/* Maison Ivoire — interactions
   Chaque formulaire de commande est autonome : la page d'accueil et les
   fiches produit partagent le même script. */
(function () {
  "use strict";

  var PRIX = 20;
  var EMAIL = "contact@maison-ivoire.fr";

  var euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

  function valeur(form, nom) {
    var champ = form.elements[nom];
    return champ ? champ.value.trim() : "";
  }

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

  function activer(form) {
    var quantite = form.elements.quantite;
    var sousTotal = form.querySelector('[data-role="sous-total"]');
    var total = form.querySelector('[data-role="total"]');
    var recap = form.querySelector('[data-role="recap"]');
    var recapTexte = form.querySelector('[data-role="recap-texte"]');

    function nombre() {
      var n = parseInt(quantite.value, 10);
      if (isNaN(n) || n < 1) { return 1; }
      return n > 10 ? 10 : n;
    }

    function majTotal() {
      var montant = euros.format(nombre() * PRIX);
      sousTotal.textContent = montant;
      total.textContent = montant;
    }

    quantite.addEventListener("input", majTotal);
    majTotal();

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var donnees = {
        coloris: form.elements.coloris.value,
        quantite: nombre(),
        nom: valeur(form, "nom"),
        email: valeur(form, "email"),
        telephone: valeur(form, "telephone"),
        adresse: valeur(form, "adresse"),
        message: valeur(form, "message")
      };

      var texte = resume(donnees);
      recapTexte.value = texte;
      recap.hidden = false;

      var sujet = "Commande — cape " + donnees.coloris + " ×" + donnees.quantite;
      window.location.href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(sujet) +
        "&body=" + encodeURIComponent(texte);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll(".formulaire"), activer);

  /* Révélation douce des sections au défilement. */
  if ("IntersectionObserver" in window) {
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          entree.target.classList.add("vu");
          observateur.unobserve(entree.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });

    var cibles = document.querySelectorAll(
      ".section-tete, .carte, .matiere__texte, .matiere__image, .garanties li, .produit__infos"
    );
    Array.prototype.forEach.call(cibles, function (cible) {
      cible.classList.add("reveler");
      observateur.observe(cible);
    });
  }
})();
