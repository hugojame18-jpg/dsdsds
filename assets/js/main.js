/* Maison Ivoire — interactions
   Chaque formulaire de commande est autonome : la page d'accueil et les
   fiches produit partagent le même script. */
(function () {
  "use strict";

  var PRIX = 20;
  var EMAIL = "contact@maison-ivoire.fr";

  /* Liens de paiement, un par coloris (Stripe, SumUp, PayPal…).
     C'est la page de paiement qui recueille les coordonnées et l'adresse.
     Tant qu'un lien est vide, le bouton prépare un e-mail de commande. */
  var PAIEMENT = {
    "Moka": "https://t.trklinkx.com/click?pid=4784&offer_id=13057",
    "Crème": "https://t.trklinkx.com/click?pid=4784&offer_id=13057",
    "Noir": "https://t.trklinkx.com/click?pid=4784&offer_id=13057"
  };

  /* Fin de l'offre de livraison offerte. Passée cette date, le bandeau
     annonce simplement la livraison offerte, sans compte à rebours.
     À mettre à jour à chaque nouvelle opération. */
  var FIN_OFFRE = new Date("2026-08-31T23:59:59+02:00");

  var euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

  function resume(donnees) {
    return [
      "Commande — La cape Maison Ivoire",
      "",
      "Coloris : " + donnees.coloris,
      "Taille : " + donnees.taille,
      "Quantité : " + donnees.quantite,
      "Total : " + euros.format(donnees.quantite * PRIX) + " (livraison offerte)"
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
        taille: form.elements.taille ? form.elements.taille.value : "unique",
        quantite: nombre()
      };

      var lien = PAIEMENT[donnees.coloris];
      if (lien) {
        /* La page de paiement prend le relais : coordonnées, adresse, règlement. */
        window.location.href = lien;
        return;
      }

      var texte = resume(donnees);
      recapTexte.value = texte;
      recap.hidden = false;

      var sujet = "Commande — cape " + donnees.coloris + " " + donnees.taille +
        " ×" + donnees.quantite;
      window.location.href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(sujet) +
        "&body=" + encodeURIComponent(texte);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll(".formulaire"), activer);

  function chaque(selecteur, action) {
    Array.prototype.forEach.call(document.querySelectorAll(selecteur), action);
  }

  /* En un seul fichier, les photos sont encodées dans window.IMAGES ;
     sur le site normal, le chemin est utilisé tel quel. */
  function source(chemin) {
    return (window.IMAGES && window.IMAGES[chemin]) || chemin;
  }

  /* Galerie : les vignettes changent la vue principale. */
  chaque(".galerie", function (galerie) {
    var vue = galerie.querySelector('[data-role="vue"]');
    var legende = galerie.querySelector('[data-role="legende"]');
    var vignettes = galerie.querySelectorAll(".galerie__vignette");

    Array.prototype.forEach.call(vignettes, function (vignette) {
      vignette.addEventListener("click", function () {
        /* La vue principale prend la grande version : à cette taille
           d'affichage, c'est celle que le srcset aurait choisie. */
        vue.removeAttribute("srcset");
        vue.src = source(vignette.dataset.base + "-1080.webp");
        vue.alt = vignette.dataset.alt;
        vue.style.objectPosition = vignette.dataset.position || "";
        legende.textContent = vignette.dataset.legende;

        Array.prototype.forEach.call(vignettes, function (autre) {
          autre.removeAttribute("aria-current");
        });
        vignette.setAttribute("aria-current", "true");
      });
    });
  });

  /* Le lien « Guide des tailles » déplie le volet correspondant. */
  chaque(".tailles__guide", function (lien) {
    lien.addEventListener("click", function () {
      var volet = document.getElementById(lien.getAttribute("href").slice(1));
      if (volet) { volet.open = true; }
    });
  });

  /* Bandeau : temps restant sur l'offre de livraison. */

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

  /* Force la lecture des vidéos (autoplay bloqué sur certains mobiles). */
  var videos = document.querySelectorAll("video[autoplay]");
  Array.prototype.forEach.call(videos, function (v) {
    v.muted = true;
    var p = v.play();
    if (p !== undefined) {
      p.catch(function () {
        /* Si le navigateur refuse encore, on relance au premier scroll. */
        var relancer = function () {
          v.play();
          window.removeEventListener("scroll", relancer);
          window.removeEventListener("touchstart", relancer);
        };
        window.addEventListener("scroll", relancer, { passive: true });
        window.addEventListener("touchstart", relancer, { passive: true });
      });
    }
  });

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
