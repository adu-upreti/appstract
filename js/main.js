  /* ==========================================================================
    APPSTRACT DEVELOPMENT — Navbar / Hero / Stats / Footer Interactions
    ========================================================================== */

  (function () {
    "use strict";

    var html = document.documentElement;
    html.classList.add("js");

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var fineTouch = window.matchMedia("(pointer: fine)").matches;

    document.addEventListener("DOMContentLoaded", function () {
      initNav();
      initMobileMenu();
      initSmoothAnchors();
      initRevealOnScroll();
      initCounters();
      initHeroNetwork();
      initMagneticButtons();
      initFooterYear();
    });

    /* ------------------------------------------------------------------------
      NAV — frosted background on scroll + active-link tracking
      ------------------------------------------------------------------------ */
    function initNav() {
      var nav = document.getElementById("nav");
      if (!nav) return;

      var onScroll = function () {
        nav.classList.toggle("is-scrolled", window.scrollY > 24);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      var navLinks = document.querySelectorAll(".nav__link, .mobile-menu__link");

      var setActive = function (href) {
        navLinks.forEach(function (link) {
          var isMatch = link.getAttribute("href") === href;
          link.classList.toggle("is-active", isMatch);
          if (isMatch) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      };

      var home = document.getElementById("home");
      if (home && "IntersectionObserver" in window) {
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) setActive("#home");
            });
          },
          { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
        );
        observer.observe(home);
      }
    }

    /* ------------------------------------------------------------------------
      MOBILE MENU — toggle, scroll lock, Escape to close, link-click close
      ------------------------------------------------------------------------ */
    function initMobileMenu() {
      var nav = document.getElementById("nav");
      var toggle = document.getElementById("navToggle");
      var menu = document.getElementById("mobileMenu");
      if (!nav || !toggle || !menu) return;

      var open = function () {
        nav.classList.add("is-menu-open");
        menu.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close menu");
        document.body.classList.add("menu-open");
      };

      var close = function () {
        nav.classList.remove("is-menu-open");
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        document.body.classList.remove("menu-open");
      };

      toggle.addEventListener("click", function () {
        if (menu.classList.contains("is-open")) {
          close();
        } else {
          open();
        }
      });

      menu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", close);
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && menu.classList.contains("is-open")) {
          close();
          toggle.focus();
        }
      });

      window.addEventListener("resize", function () {
        if (window.innerWidth >= 900 && menu.classList.contains("is-open")) {
          close();
        }
      });
    }

    /* ------------------------------------------------------------------------
      SMOOTH IN-PAGE ANCHORS
      ------------------------------------------------------------------------ */
    function initSmoothAnchors() {
      document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
          var id = link.getAttribute("href");
          if (!id || id === "#") return;
          var target = document.querySelector(id);
          if (!target) return;

          event.preventDefault();
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
          });

          if (!/^(?:a|button|input|select|textarea)$/i.test(target.tagName)) {
            target.setAttribute("tabindex", "-1");
          }
          target.focus({ preventScroll: true });
        });
      });
    }

    /* ------------------------------------------------------------------------
      SCROLL REVEAL
      ------------------------------------------------------------------------ */
    function initRevealOnScroll() {
      var targets = document.querySelectorAll("[data-reveal]");
      if (!targets.length) return;

      if (!("IntersectionObserver" in window) || reduceMotion) {
        targets.forEach(function (el) {
          el.classList.add("is-visible");
        });
        return;
      }

      var observer = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );

      targets.forEach(function (el) {
        observer.observe(el);
      });
    }

    /* ------------------------------------------------------------------------
      STATS COUNTERS — count-up animation triggered on scroll into view
      ------------------------------------------------------------------------ */
    function initCounters() {
      var counters = document.querySelectorAll(".stats__count[data-target]");
      if (!counters.length) return;

      var animate = function (el) {
        var target = parseInt(el.getAttribute("data-target"), 10) || 0;

        if (reduceMotion) {
          el.textContent = String(target);
          return;
        }

        var duration = 1600;
        var startTime = null;

        var ease = function (t) {
          return 1 - Math.pow(1 - t, 4);
        };

        var step = function (timestamp) {
          if (startTime === null) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          el.textContent = String(Math.round(ease(progress) * target));
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = String(target);
          }
        };

        requestAnimationFrame(step);
      };

      if (!("IntersectionObserver" in window)) {
        counters.forEach(animate);
        return;
      }

      var observer = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animate(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      counters.forEach(function (el) {
        observer.observe(el);
      });
    }

    /* ------------------------------------------------------------------------
      HERO NETWORK — animated node/line canvas behind the hero copy
      ------------------------------------------------------------------------ */
    function initHeroNetwork() {
      var canvas = document.getElementById("heroCanvas");
      var stage = canvas ? canvas.closest(".hero__container") : null;
      if (!canvas || !stage) return;

      var ctx = canvas.getContext("2d");
      var nodes = [];
      var width = 0;
      var height = 0;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rafId = null;
      var running = false;
      var pointer = { x: -9999, y: -9999, active: false };

      var MAX_DIST = 150;
      var MOUSE_RADIUS = 170;

      function resize() {
        var rect = stage.getBoundingClientRect();
        width = Math.max(1, Math.round(rect.width));
        height = Math.max(1, Math.round(rect.height));
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seed();
      }

      function seed() {
        var area = width * height;
        var count = Math.round(area / 15000);
        count = Math.max(26, Math.min(70, count));
        nodes = [];
        for (var i = 0; i < count; i++) {
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: 1.4 + Math.random() * 1.8
          });
        }
      }

      function lineColor(alpha) {
        return "rgba(80, 190, 255, " + alpha + ")";
      }

      function drawFrame() {
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = "lighter";

        for (var i = 0; i < nodes.length; i++) {
          for (var j = i + 1; j < nodes.length; j++) {
            var a = nodes[i];
            var b = nodes[j];
            var dx = a.x - b.x;
            var dy = a.y - b.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAX_DIST) {
              var alpha = (1 - dist / MAX_DIST) * 0.22;
              ctx.strokeStyle = lineColor(alpha);
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }

          if (pointer.active) {
            var pdx = nodes[i].x - pointer.x;
            var pdy = nodes[i].y - pointer.y;
            var pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pdist < MOUSE_RADIUS) {
              ctx.strokeStyle = lineColor((1 - pdist / MOUSE_RADIUS) * 0.35);
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(pointer.x, pointer.y);
              ctx.stroke();
            }
          }
        }

        for (var k = 0; k < nodes.length; k++) {
          var n = nodes[k];
          var glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
          glow.addColorStop(0, "rgba(140, 220, 255, 0.9)");
          glow.addColorStop(1, "rgba(140, 220, 255, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(220, 245, 255, 0.95)";
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalCompositeOperation = "source-over";
      }

      function step() {
        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i];

          if (pointer.active) {
            var dx = n.x - pointer.x;
            var dy = n.y - pointer.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS && dist > 0.01) {
              var force = (1 - dist / MOUSE_RADIUS) * 0.6;
              n.x += (dx / dist) * force;
              n.y += (dy / dist) * force;
            }
          }

          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;

          n.x = Math.max(0, Math.min(width, n.x));
          n.y = Math.max(0, Math.min(height, n.y));
        }

        drawFrame();
        rafId = requestAnimationFrame(step);
      }

      function start() {
        if (running || reduceMotion) return;
        running = true;
        rafId = requestAnimationFrame(step);
      }

      function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      }

      stage.addEventListener("mousemove", function (event) {
        if (!fineTouch) return;
        var rect = stage.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.active = true;
      });

      stage.addEventListener("mouseleave", function () {
        pointer.active = false;
      });

      var resizeTimer = null;
      window.addEventListener("resize", function () {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
      });

      resize();

      if (reduceMotion) {
        drawFrame();
      } else if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                start();
              } else {
                stop();
              }
            });
          },
          { threshold: 0.05 }
        );
        observer.observe(stage);
      } else {
        start();
      }

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          stop();
        } else if (!reduceMotion) {
          start();
        }
      });

      window.addEventListener("load", resize);
    }

    /* ------------------------------------------------------------------------
      MAGNETIC BUTTONS — subtle cursor-following pull on primary CTAs
      ------------------------------------------------------------------------ */
    function initMagneticButtons() {
      if (!fineTouch || reduceMotion) return;

      document.querySelectorAll(".btn--magnetic").forEach(function (btn) {
        var strength = 0.28;
        var max = 10;

        btn.addEventListener("mousemove", function (event) {
          var rect = btn.getBoundingClientRect();
          var relX = event.clientX - (rect.left + rect.width / 2);
          var relY = event.clientY - (rect.top + rect.height / 2);
          var x = Math.max(-max, Math.min(max, relX * strength));
          var y = Math.max(-max, Math.min(max, relY * strength));
          btn.style.transform = "translate(" + x + "px, " + y + "px)";
        });

        btn.addEventListener("mouseleave", function () {
          btn.style.transform = "translate(0, 0)";
        });
      });
    }

    /* ------------------------------------------------------------------------
      FOOTER — current year
      ------------------------------------------------------------------------ */
    function initFooterYear() {
      var year = document.getElementById("year");
      if (year) year.textContent = String(new Date().getFullYear());
    }

  })();