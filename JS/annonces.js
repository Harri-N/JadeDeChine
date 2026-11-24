/* ==========================================================================
   ANNONCES (fermetures, événements…) — c'est ICI qu'on les modifie.
   --------------------------------------------------------------------------
   Chaque annonce s'affiche automatiquement entre `debut` (facultatif) et
   `fin`, sur toutes les pages :
     - un bandeau rouge en bas de l'écran (cliquable),
     - une fenêtre qui s'ouvre toute seule à la 1re visite de la session.
   Une fois la date `fin` passée, l'annonce disparaît d'elle-même : inutile de
   la supprimer (mais on peut, pour garder le fichier propre).

   Dates : format "AAAA-MM-JJTHH:MM:SS+02:00"
     → +02:00 en heure d'été (fin mars → fin octobre), +01:00 en hiver.

   Champs :
     id       identifiant unique (sert à ne montrer la fenêtre qu'une fois)
     debut    (facultatif) date d'apparition
     fin      date de disparition
     titre    titre de la fenêtre
     bandeau  texte du bandeau rouge
     contenu  texte de la fenêtre (HTML autorisé : <p>, <strong>, <br>…)
     image    (facultatif) chemin depuis la racine du site, ex. "Images/Fermeture.jpg"
   ========================================================================== */
var ANNONCES = [
  {
    id: "vacances-2025",
    fin: "2025-08-04T23:59:59+02:00",
    titre: "🌴 Vacances annuelles 🌴",
    bandeau: "Fermeture du 19/07 au 04/08 inclus.",
    contenu:
      "<p><strong>Le restaurant sera fermé du 19 juillet au 04 août inclus.</strong></p>" +
      "<p><strong>L’équipe vous souhaite de belles vacances et vous retrouve très vite ! ☀️</strong></p>"
  }

  /* Modèle à copier (ne pas oublier la virgule entre deux annonces) :
  ,{
    id: "fermeture-exemple",
    fin: "2026-01-12T23:59:59+01:00",
    titre: "⚠️ Fermeture exceptionnelle ⚠️",
    bandeau: "➡️🔐 Fermeture le 12/01 ⬅️",
    contenu: "<p>Nous serons fermés ce dimanche 12 janvier. Nous vous retrouvons donc mardi dès 12h.</p><p>À bientôt ! 🍴</p>",
    image: "Images/Fermeture.jpg"
  }
  */
];

/* ---------------------- Ne pas modifier en dessous ---------------------- */
(function () {
  "use strict";

  // Racine du site, déduite de l'emplacement de ce script (…/JS/annonces.js)
  var script = document.currentScript;
  var siteRoot = new URL("..", script ? script.src : location.href);

  var now = Date.now();
  var actives = ANNONCES.filter(function (a) {
    var start = a.debut ? Date.parse(a.debut) : -Infinity;
    var end = Date.parse(a.fin);
    return !isNaN(end) && now >= start && now <= end;
  });
  if (!actives.length) return;

  var store = window.JadeStore || { get: function () { return null; }, set: function () {} };

  /* Fenêtre (une seule, réutilisée pour chaque annonce) */
  var dialog = document.createElement("dialog");
  dialog.className = "annonce-dialog";
  dialog.setAttribute("aria-labelledby", "annonce-title");
  dialog.innerHTML =
    '<div class="annonce-dialog__header">' +
    '  <button type="button" class="annonce-dialog__close" aria-label="Fermer">&times;</button>' +
    "</div>" +
    '<div class="annonce-dialog__body">' +
    '  <h2 class="annonce-dialog__title" id="annonce-title"></h2>' +
    '  <div class="annonce-dialog__content"></div>' +
    "</div>" +
    '<div class="annonce-dialog__footer">' +
    '  <button type="button" class="btn annonce-dialog__next"></button>' +
    "</div>";
  document.body.appendChild(dialog);

  var titleEl = dialog.querySelector(".annonce-dialog__title");
  var contentEl = dialog.querySelector(".annonce-dialog__content");
  var nextBtn = dialog.querySelector(".annonce-dialog__next");
  var queue = [];

  function show(a) {
    titleEl.textContent = a.titre;
    contentEl.innerHTML = a.contenu || "";
    if (a.image) {
      var img = document.createElement("img");
      img.className = "annonce-dialog__img";
      img.src = new URL(a.image, siteRoot).href;
      img.alt = "";
      contentEl.appendChild(img);
    }
    nextBtn.textContent = queue.length ? "Suivant" : "Fermer";
    store.set("annonce-vue-" + a.id, "ok");
    if (!dialog.open) dialog.showModal();
    dialog.querySelector(".annonce-dialog__body").scrollTop = 0;
  }
  function next() {
    if (queue.length) show(queue.shift());
    else dialog.close();
  }

  nextBtn.addEventListener("click", next);
  dialog.querySelector(".annonce-dialog__close").addEventListener("click", function () {
    queue = [];
    dialog.close();
  });
  // Clic sur le fond assombri = fermer
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) {
      queue = [];
      dialog.close();
    }
  });
  dialog.addEventListener("cancel", function () { queue = []; });

  /* Bandeaux */
  var bar = document.createElement("div");
  bar.className = "annonces-bar";
  actives.forEach(function (a) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "annonce-banner";
    b.textContent = a.bandeau;
    b.addEventListener("click", function () {
      queue = [];
      show(a);
    });
    bar.appendChild(b);
  });
  document.body.appendChild(bar);
  document.body.classList.add("has-annonces");

  // Hauteur des bandeaux → place le bandeau cookies au-dessus
  function syncHeight() {
    document.documentElement.style.setProperty("--annonces-h", bar.offsetHeight + "px");
  }
  syncHeight();
  window.addEventListener("resize", syncHeight);

  /* Ouverture automatique, une fois par session, l'une après l'autre */
  queue = actives.filter(function (a) { return store.get("annonce-vue-" + a.id) !== "ok"; });
  if (queue.length) show(queue.shift());
})();
