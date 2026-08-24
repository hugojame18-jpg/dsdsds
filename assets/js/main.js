/* Maison Ivoire — interactions */
(function () {
  "use strict";

  var PRIX = 20;
  var EMAIL = "contact@maison-ivoire.fr";

  var euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

  var form = document.getElementById("formulaire");
  var quantite = document.getElementById("quantite");
  var sousTotal = document.getElementById("sous-total");
  var total = document.getElementById("total");
  var recap = document.getElementById("recap");
  var recapTexte = document.getElementById("recap-texte");

  function nombre() {
    var n = parseInt(quantite.value, 10);
    if (isNaN(n) || n < 1) { n = 1; }
    if (n > 10) { n = 10; }
    return n;
  }

  function majTotal() {
    var montant = euros.format(nombre() * PRIX);
    sousTotal.textContent = montant;
    total.textContent = montant;
  }

  quantite.addEventListener("input", majTotal);
  majTotal();

  /* Le bouton d'un coloris présélectionne la bonne pastille du formulaire. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-coloris]"), function (lien) {
    lien.addEventListener("click", function () {
      var choix = document.querySelector('input[name="coloris"][value="' + lien.dataset.coloris + '"]');
      if (choix) { choix.checked = true; }
    });
  });

  function resume(donnees) {
    return [
      "Commande — La cape Maison Ivoire",
      "",
      "Coloris : " + donnees.coloris,
      "Quantité : " + donnees.quantite,
      "Total : " + euros.format(donnees.quantite * PRIX) + " (livraison offerte)",
      "",
      "Nom : " + donnees.nom,
      "E-mail : " + donnees.email,
      "Téléphone : " + (donnees.telephone || "—"),
      "",
      "Adresse de livraison :",
      donnees.adresse,
      "",
      "Message : " + (donnees.message || "—")
    ].join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var donnees = {
      coloris: form.elements.coloris.value,
      quantite: nombre(),
      nom: form.elements.nom.value.trim(),
      email: form.elements.email.value.trim(),
      telephone: form.elements.telephone.value.trim(),
      adresse: form.elements.adresse.value.trim(),
      message: form.elements.message.value.trim()
    };

    var texte = resume(donnees);
    recapTexte.value = texte;
    recap.hidden = false;

    var sujet = "Commande — cape " + donnees.coloris + " ×" + donnees.quantite;
    window.location.href = "mailto:" + EMAIL +
      "?subject=" + encodeURIComponent(sujet) +
      "&body=" + encodeURIComponent(texte);
  });

  /* Révélation douce des sections au défilement. */
  var cibles = document.querySelectorAll(".section-tete, .carte, .matiere__texte, .matiere__image, .garanties li, .formulaire");
  if ("IntersectionObserver" in window) {
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          entree.target.classList.add("vu");
          observateur.unobserve(entree.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });

    Array.prototype.forEach.call(cibles, function (cible) {
      cible.classList.add("reveler");
      observateur.observe(cible);
    });
  }
})();
