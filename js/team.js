    /* ==========================================================================
    APPSTRACT — Team Page Interactions
    Reuses main.js for nav/menu/reveal/magnetic/footer.
    This file adds: team card tilt effect on desktop.
    ========================================================================== */

    (function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var fineTouch    = window.matchMedia("(pointer: fine)").matches;

    document.addEventListener("DOMContentLoaded", function () {
        initCardTilt();
        initCardSpotlight();
    });

    /* ------------------------------------------------------------------------
        CARD TILT — subtle 3-D perspective tilt following the cursor on desktop
        ------------------------------------------------------------------------ */
    function initCardTilt() {
        if (!fineTouch || reduceMotion) return;

        document.querySelectorAll(".team-card").forEach(function (card) {
        var MAX = 8; // max tilt degrees

        card.addEventListener("mousemove", function (e) {
            var rect  = card.getBoundingClientRect();
            var cx    = rect.left + rect.width  / 2;
            var cy    = rect.top  + rect.height / 2;
            var dx    = (e.clientX - cx) / (rect.width  / 2);
            var dy    = (e.clientY - cy) / (rect.height / 2);
            var rotX  = (-dy * MAX).toFixed(2);
            var rotY  = ( dx * MAX).toFixed(2);
            card.style.transform =
            "perspective(900px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg) translateY(-6px)";
        });

        card.addEventListener("mouseleave", function () {
            card.style.transform = "";
        });
        });
    }

    /* ------------------------------------------------------------------------
        CARD SPOTLIGHT — radial gradient follows cursor inside each card
        ------------------------------------------------------------------------ */
    function initCardSpotlight() {
        if (!fineTouch || reduceMotion) return;

        document.querySelectorAll(".team-card").forEach(function (card) {
        card.addEventListener("mousemove", function (e) {
            var rect = card.getBoundingClientRect();
            card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
            card.style.setProperty("--my", (e.clientY - rect.top)  + "px");
        });
        });
    }

    })();