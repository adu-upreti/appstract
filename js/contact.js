  /* ==========================================================================
    APPSTRACT — Contact Page Interactions
    ========================================================================== */

  (function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
      initContactForm();
    });

    function initContactForm() {
      var form    = document.getElementById("contactForm");
      var success = document.getElementById("formSuccess");
      var submit  = document.getElementById("formSubmit");
      if (!form || !success || !submit) return;

      /* Ensure success hidden on load */
      success.hidden = true;

      var fields = [
        { id: "name",    validate: function (v) { return v.trim().length >= 2; },                          error: "Please enter your full name." },
        { id: "email",   validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, error: "Please enter a valid email address." },
        { id: "service", validate: function (v) { return v !== ""; },                                      error: "Please select a service." },
        { id: "message", validate: function (v) { return v.trim().length >= 10; },                         error: "Please write a short message (at least 10 characters)." }
      ];

      /* Live validation */
      fields.forEach(function (f) {
        var el = document.getElementById(f.id);
        if (!el) return;
        el.addEventListener("input",  function () { if (f.validate(el.value)) clearError(f.id); });
        el.addEventListener("change", function () { if (f.validate(el.value)) clearError(f.id); });
      });

      form.addEventListener("submit", async function (e) {
        e.preventDefault();

        /* Client-side validation */
        var valid = true;
        fields.forEach(function (f) {
          var el = document.getElementById(f.id);
          if (!el) return;
          if (!f.validate(el.value)) { showError(f.id, f.error); valid = false; }
          else { clearError(f.id); }
        });
        if (!valid) return;

        /* Loading state */
        var label = submit.querySelector(".submit-label");
        var originalLabel = label ? label.textContent : "Send Message";
        submit.disabled = true;
        submit.classList.add("is-loading");
        if (label) label.textContent = "Sending";

        try {
          var formData = new FormData(form);
          formData.append("access_key", "45ab7a61-8df4-475e-a653-b2eb12b54cf3");

          var response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
          });

          var data = await response.json();

          if (response.ok) {
            /* Show success, hide form */
            form.style.display = "none";
            success.removeAttribute("hidden");
            success.hidden = false;
            success.focus();
            form.reset();
          } else {
            /* Server returned error */
            resetSubmit(originalLabel);
            showGlobalError("Error: " + (data.message || "Something went wrong."));
          }
        } catch (err) {
          resetSubmit(originalLabel);
          showGlobalError("Network error — please check your connection and try again.");
        }
      });

      function resetSubmit(text) {
        submit.disabled = false;
        submit.classList.remove("is-loading");
        var l = submit.querySelector(".submit-label");
        if (l) l.textContent = text || "Send Message";
      }

      function showGlobalError(msg) {
        var existing = form.querySelector(".form-global-error");
        if (existing) existing.remove();
        var el = document.createElement("p");
        el.className = "form-error form-global-error";
        el.textContent = msg;
        el.style.textAlign = "center";
        el.style.marginTop = ".5rem";
        submit.insertAdjacentElement("afterend", el);
      }

      function showError(id, msg) {
        var el  = document.getElementById(id);
        var err = document.getElementById(id + "-error");
        if (el)  el.classList.add("is-error");
        if (err) err.textContent = msg;
      }

      function clearError(id) {
        var el  = document.getElementById(id);
        var err = document.getElementById(id + "-error");
        if (el)  el.classList.remove("is-error");
        if (err) err.textContent = "";
      }
    }

  })();