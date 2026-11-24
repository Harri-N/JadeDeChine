/* Jade de Chine — page Carte : menus déroulants + rubrique active au défilement */
(function () {
  "use strict";

  var nav = document.getElementById("carte-nav");
  if (!nav) return;

  /* ---------- Menus déroulants ---------- */
  var toggles = nav.querySelectorAll("[aria-controls]");

  function closeAll(except) {
    toggles.forEach(function (btn) {
      if (btn === except) return;
      btn.setAttribute("aria-expanded", "false");
      document.getElementById(btn.getAttribute("aria-controls")).hidden = true;
    });
  }

  toggles.forEach(function (btn) {
    var menu = document.getElementById(btn.getAttribute("aria-controls"));
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      closeAll(btn);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      menu.hidden = !open;
      if (open) {
        var first = menu.querySelector("a");
        if (first && btn.matches(":focus-visible")) first.focus();
      }
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeAll();
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".carte-nav__item")) closeAll();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openBtn = nav.querySelector('[aria-expanded="true"]');
    closeAll();
    if (openBtn) openBtn.focus();
  });

  /* ---------- Rubrique active selon la position de défilement ---------- */
  var groups = Array.prototype.slice.call(document.querySelectorAll(".carte-group[id]"));
  var buttons = {};
  nav.querySelectorAll("[data-group]").forEach(function (b) {
    buttons[b.getAttribute("data-group")] = b;
  });

  var ticking = false;
  function updateActive() {
    ticking = false;
    var line = window.scrollY + 200;
    var current = null;
    groups.forEach(function (g) {
      var top = g.getBoundingClientRect().top + window.scrollY;
      if (line >= top && line < top + g.offsetHeight) current = g.id;
    });
    Object.keys(buttons).forEach(function (id) {
      buttons[id].classList.toggle("is-active", id === current);
    });
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateActive);
    }
  }, { passive: true });
  updateActive();
})();
