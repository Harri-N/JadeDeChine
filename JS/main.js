/* Jade de Chine — script commun à toutes les pages.
   (thème clair/sombre, navigation, bandeau cookies, animations, horaires) */
(function () {
  "use strict";

  /* ---------- Stockage (protégé : peut être bloqué en navigation privée) ---------- */
  var store = {
    get: function (k) {
      try { return sessionStorage.getItem(k); } catch (e) { return null; }
    },
    set: function (k, v) {
      try { sessionStorage.setItem(k, v); } catch (e) { /* ignoré */ }
    }
  };
  window.JadeStore = store;

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    document.cookie =
      name + "=" + encodeURIComponent(value) +
      ";expires=" + d.toUTCString() +
      ";path=/;SameSite=Lax" +
      (location.protocol === "https:" ? ";Secure" : "");
  }
  function getCookie(name) {
    var parts = document.cookie ? document.cookie.split("; ") : [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].split("=");
      if (p[0] === name) return decodeURIComponent(p.slice(1).join("="));
    }
    return "";
  }

  /* ---------- Thème clair / sombre ----------
     La classe est déjà posée dans <head> (pas de flash) ; ici on gère le bouton. */
  var root = document.documentElement;
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    var sync = function () {
      var light = root.classList.contains("light");
      btn.setAttribute("aria-pressed", light ? "true" : "false");
      btn.setAttribute("aria-label", light ? "Passer au thème sombre" : "Passer au thème clair");
    };
    sync();
    btn.addEventListener("click", function () {
      root.classList.add("theme-anim");
      var light = root.classList.toggle("light");
      store.set("Theme", light ? "light" : "dark");
      sync();
      closeNav();
      window.setTimeout(function () { root.classList.remove("theme-anim"); }, 600);
    });
  });

  /* ---------- Barre de navigation ---------- */
  var nav = document.getElementById("site-nav");
  var toggle = nav && nav.querySelector(".site-nav__toggle");

  function updateNav() {
    if (!nav) return;
    var solid = window.scrollY >= 56 || nav.classList.contains("is-open");
    nav.classList.toggle("is-solid", solid);
  }
  function closeNav() {
    if (!nav || !nav.classList.contains("is-open")) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    updateNav();
  }
  if (nav) {
    window.addEventListener("scroll", updateNav, { passive: true });
    updateNav();
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      updateNav();
    });
    // Ferme le menu mobile quand on clique un lien ou en dehors
    nav.querySelectorAll(".site-nav__link").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest("#site-nav")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Bandeau cookies ---------- */
  var COOKIE_NAME = "PrefCookieJade";
  var banner = document.getElementById("cookie-banner");
  if (banner && !getCookie(COOKIE_NAME)) banner.hidden = false;
  document.querySelectorAll("[data-cookie-ok]").forEach(function (el) {
    el.addEventListener("click", function () {
      setCookie(COOKIE_NAME, "ok", 30 * 6); // 6 mois (recommandation APD)
      if (banner) banner.hidden = true;
    });
  });

  /* ---------- Animations à l'apparition ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Pied de page : année + jour courant dans les horaires ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
  var today = new Date().getDay(); // 0 = dimanche
  document.querySelectorAll(".hours tr[data-day]").forEach(function (tr) {
    if (Number(tr.getAttribute("data-day")) === today) tr.classList.add("is-today");
  });
})();
