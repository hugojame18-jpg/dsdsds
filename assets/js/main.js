/* Maison Ivoire — interactions
   Chaque formulaire de commande est autonome : la page d'accueil et les
   fiches produit partagent le même script. */
(function () {
  "use strict";

  var PRIX = 20;
  var EMAIL = "contact@maison-ivoire.fr";

  /* Fin de l'offre de livraison offerte. Passée cette date, le bandeau
     annonce simplement la livraison offerte, sans compte à rebours.
     À mettre à jour à chaque nouvelle opération. */
  var FIN_OFFRE = new Date("2026-08-31T23:59:59+02:00");

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

  /* Bandeau : temps restant sur l'offre de livraison. */
  function chaque(selecteur, action) {
    Array.prototype.forEach.call(document.querySelectorAll(selecteur), action);
  }

  function majOffre() {
    var reste = FIN_OFFRE.getTime() - Date.now();

    if (reste <= 0) {
      chaque('[data-role="offre"]', function (el) {
        el.textContent = "Livraison offerte sur toutes les commandes";
      });
      chaque('[data-role="compte"]', function (el) { el.textContent = ""; });
      return;
    }

    var jours = Math.floor(reste / 86400000);
    var heures = Math.floor((reste % 86400000) / 3600000);
    var minutes = Math.floor((reste % 3600000) / 60000);

    var texte;
    if (jours >= 1) {
      texte = "plus que " + jours + " j " + heures + " h";
    } else if (heures >= 1) {
      texte = "plus que " + heures + " h " + minutes + " min";
    } else {
      texte = "plus que " + minutes + " min";
    }

    chaque('[data-role="compte"]', function (el) { el.textContent = texte; });
  }

  majOffre();
  window.setInterval(majOffre, 60000);

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
      ".section-tete, .produit-vignette, .la-piece__texte, .la-piece__image, .garanties li, .produit__infos"
    );
    Array.prototype.forEach.call(cibles, function (cible) {
      cible.classList.add("reveler");
      observateur.observe(cible);
    });
  }
})();
