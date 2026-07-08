/* ==========================================================================
   APPSTRACT — About Page Interactions
   main.js handles: nav, mobile menu, reveal, counters, magnetic, footer year.
   This file adds: FAQ accordion.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initFaq();
  });

  /* ------------------------------------------------------------------------
     FAQ ACCORDION — exclusive open/close with CSS grid-template-rows trick
     ------------------------------------------------------------------------ */
  function initFaq() {
    var items = document.querySelectorAll(".faq-item");
    if (!items.length) return;

    items.forEach(function (item) {
      var trigger = item.querySelector(".faq-item__trigger");
      if (!trigger) return;

      trigger.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");

        /* Close all */
        items.forEach(function (other) {
          other.classList.remove("is-open");
          var t = other.querySelector(".faq-item__trigger");
          if (t) t.setAttribute("aria-expanded", "false");
        });

        /* Open clicked if it was closed */
        if (!isOpen) {
          item.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

})();
