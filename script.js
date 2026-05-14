// Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".mobile-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  // Reveal-on-scroll
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // Animated stat counters
  const counters = document.querySelectorAll("[data-count]");
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const prefix = el.dataset.prefix || "";
        const duration = 1400;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          const value = target * eased;
          const display = Number.isInteger(target)
            ? Math.round(value).toString()
            : value.toFixed(1);
          el.textContent = `${prefix}${display}${suffix}`;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        counterIO.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => counterIO.observe(c));

  // Contact form - hooked up to Formspree.io
  // ─── Config ───────────────────────────────────────────────────────────────────
	const FORMSPREE_URL = "https://formspree.io/f/mojrkgwo";
	 
	// ─── Contact form ─────────────────────────────────────────────────────────────
	const form      = document.getElementById("contact-form");
	if (form) {
	  const success   = document.querySelector(".form-success");
	  const submitBtn = form.querySelector('[type="submit"]');
	 
	  form.addEventListener("submit", async (e) => {
		 e.preventDefault();
	 
		 // Basic client-side validation
		 if (!form.checkValidity()) {
		   form.reportValidity();
		   return;
		 }
	 
		 // Loading state
		 const originalText = submitBtn.innerHTML;
		 submitBtn.disabled  = true;
		 submitBtn.innerHTML = "Sending… <span class='arrow'>→</span>";
	 
		 try {
		   const res = await fetch(FORMSPREE_URL, {
			 method:  "POST",
			 headers: {
			   "Content-Type": "application/json",
			   "Accept":       "application/json",
			 },
			 body: JSON.stringify(Object.fromEntries(new FormData(form))),
		   });
	 
		   const data = await res.json();
	 
		   if (res.ok) {
			 // Success — show message, hide form fields
			 form.querySelectorAll(".form-row, .form-group, [type='submit']")
				 .forEach(el => (el.style.display = "none"));
			 success.style.display = "block";
			 form.reset();
		   } else {
			 // Formspree returned a validation error (e.g. spam detected)
			 const msg = data?.errors?.map(err => err.message).join(", ")
				 || "Something went wrong. Please try again.";
			 showError(msg);
			 resetButton(submitBtn, originalText);
		   }
		 } catch {
		   // Network failure
		   showError("Could not send your request — check your connection and try again.");
		   resetButton(submitBtn, originalText);
		 }
	  });
	 
	  // ─── Helpers ──────────────────────────────────────────────────────────────────
	  function showError(msg) {
		 let el = document.getElementById("form-error");
		 if (!el) {
		   el = document.createElement("p");
		   el.id = "form-error";
		   el.style.cssText = "color:var(--color-danger,#c0392b);font-size:.9rem;margin-top:12px;text-align:center;";
		   form.appendChild(el);
		 }
		 el.textContent = msg;
	  }
	 	 
	  function resetButton(btn, originalHTML) {
		 btn.disabled   = false;
		 btn.innerHTML  = originalHTML;
	  }
}
	const revealEls = document.querySelectorAll(".reveal");
	if (revealEls.length && "IntersectionObserver" in window) {
	  const observer = new IntersectionObserver(
		(entries) => entries.forEach(entry => {
		  if (entry.isIntersecting) {
			entry.target.classList.add("visible");
			observer.unobserve(entry.target);
		  }
		}),
		{ threshold: 0.12 }
	  );
	  revealEls.forEach(el => observer.observe(el));
	}


	// ── Newsletter subscribe ───────────────────────────────────────────────────────
	const MAILCHIMP_URL = "https://soarify.us15.list-manage.com/subscribe/post-json?u=d9d5ee80eef8e29dd5862dac7&id=e8bfee51f3";

	const subForm = document.getElementById("subscribe-form");
	const subMsg  = document.getElementById("subscribe-msg");

	if (subForm) {
	subForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		const email = document.getElementById("subscribe-email").value;
		const btn   = subForm.querySelector(".btn");

		btn.disabled    = true;
		btn.textContent = "Subscribing…";

		// Mailchimp requires JSONP for cross-origin — use a script tag trick
		const script = document.createElement("script");
		const cb     = "mcCallback_" + Date.now();

		window[cb] = (data) => {
		script.remove();
		delete window[cb];
		subMsg.classList.add("visible");
		if (data.result === "success") {
			subForm.querySelector("input").value = "";
			btn.textContent   = "Subscribed ✓";
			subMsg.style.color = "var(--accent, #1D9E75)";
			subMsg.textContent = "You're in! We'll email you when a new post drops.";
		} else {
			btn.disabled    = false;
			btn.textContent = "Subscribe";
			subMsg.style.color = "#e05c5c";
			subMsg.textContent = data.msg.includes("already subscribed")
			? "You're already subscribed!"
			: "Something went wrong — please try again.";
		}
		};

		script.src = `${MAILCHIMP_URL}&EMAIL=${encodeURIComponent(email)}&c=${cb}`;
		document.body.appendChild(script);
  });
}

});
