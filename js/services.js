    /* ==========================================================================
    APPSTRACT — Services Page Interactions
    main.js handles: nav, mobile menu, reveal, magnetic, footer year.
    This file adds: service accordion, package card spotlight.
    ========================================================================== */

    (function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var fineTouch    = window.matchMedia("(pointer: fine)").matches;

    document.addEventListener("DOMContentLoaded", function () {
        initServiceAccordion();
        initPackageSpotlight();
        initDeepLink();
    });

    /* ------------------------------------------------------------------------
        SERVICE ACCORDION — click to expand, click again or another to collapse
        ------------------------------------------------------------------------ */
    function initServiceAccordion() {
        var cards = document.querySelectorAll(".svc-card");
        if (!cards.length) return;

        cards.forEach(function (card) {
        var trigger = card.querySelector(".svc-card__trigger");
        var panel   = card.querySelector(".svc-card__panel");
        if (!trigger || !panel) return;

        trigger.addEventListener("click", function () {
            var isOpen = card.classList.contains("is-open");

            /* Close all */
            cards.forEach(function (c) {
            c.classList.remove("is-open");
            var t = c.querySelector(".svc-card__trigger");
            if (t) t.setAttribute("aria-expanded", "false");
            });

            /* Open clicked if it was closed */
            if (!isOpen) {
            card.classList.add("is-open");
            trigger.setAttribute("aria-expanded", "true");

            /* Scroll card into comfortable view after CSS transition */
            if (!reduceMotion) {
                setTimeout(function () {
                var rect = card.getBoundingClientRect();
                var navH = parseInt(
                    getComputedStyle(document.documentElement).getPropertyValue("--nav-h") || "84",
                    10
                );
                if (rect.top < navH + 16) {
                    window.scrollBy({ top: rect.top - navH - 16, behavior: "smooth" });
                }
                }, 320);
            }
            }
        });

        /* Keyboard: Space / Enter already fire click on <button>;
            also support Escape to close the open card */
        trigger.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && card.classList.contains("is-open")) {
            card.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");
            trigger.focus();
            }
        });
        });
    }

    /* ------------------------------------------------------------------------
        PACKAGE CARDS — cursor spotlight (radial gradient follows mouse)
        ------------------------------------------------------------------------ */
    function initPackageSpotlight() {
        if (!fineTouch || reduceMotion) return;

        document.querySelectorAll(".pkg-card").forEach(function (card) {
        card.addEventListener("mousemove", function (e) {
            var rect = card.getBoundingClientRect();
            card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
            card.style.setProperty("--my", (e.clientY - rect.top)  + "px");
        });
        });
    }

    /* ------------------------------------------------------------------------
        DEEP LINK — if URL hash matches a service id, auto-open that card
        e.g. services.html#svc-ai will open the AI card on load
        ------------------------------------------------------------------------ */
    function initDeepLink() {
        var hash = window.location.hash;
        if (!hash) return;

        var target = document.querySelector(hash + " .svc-card__trigger");
        if (!target) return;

        /* Small delay so reveal animations don't fight the scroll */
        setTimeout(function () {
        target.click();
        }, 500);
    }

    })();