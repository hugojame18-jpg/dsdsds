# Maison Ivoire — boutique en ligne

Boutique de capes en fausse fourrure : une grille de coloris en page d'accueil et une
fiche produit par coloris — moka, crème, noir. **20,00 €**, livraison offerte.

Site statique, sans dépendance ni étape de build. Palette blanche et beige, sans version sombre.

## Ouvrir le site

Double-cliquez sur `index.html`, ou lancez un petit serveur local :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Structure

```
index.html              accueil : hero, les trois coloris, la pièce, commande, FAQ
cape-moka.html          fiche produit — moka
cape-ivoire.html        fiche produit — crème
cape-noir.html          fiche produit — noir
assets/css/style.css    palette, typographie, mise en page
assets/video/originaux/ les vidéos telles que reçues
assets/video/           les vidéos compressées et leur image d'attente
compresser.py           fabrique tout ce qui précède depuis originaux/
assets/js/main.js       total et envoi de la commande, pour chaque formulaire
assets/img/             les photos produit — cape-<coloris>[-n].webp
build_artifact.py       génère boutique-en-un-fichier.html (tout le site inliné)
```

Les quatre pages partagent la même feuille de style et le même script.

L'accueil s'ouvre sur deux vidéos verticales encadrant le nom de la pièce et son prix
(lecture automatique, sans son, en boucle), puis une grille de vignettes (photo, nom,
prix), la présentation de la pièce, les garanties et l'aide.

Quand le nombre d'articles laisse une case vide en bas de la grille sur téléphone, la
dernière vignette occupe toute la largeur — pas de trou.

Une fiche produit reprend la galerie photo, le prix, le choix du coloris et de la taille, la
quantité et le total, puis le descriptif : texte de présentation, indice de chaleur,
mensurations du mannequin, matière, dimensions, guide des tailles et volet livraison.

Aucune coordonnée n'est demandée sur le site : le bouton « Commander » mène à la page de
paiement, qui recueille le nom, l'adresse et le règlement.

### Caractéristiques du produit

Elles sont écrites en clair dans les fiches, à un seul endroit par page :

| | |
| --- | --- |
| Matière | 100 % polyester |
| Tailles | S (34/36), M (38/40), L (42/44) |
| Longueur | 78 cm devant, 83 cm dos |
| Fermeture | Agrafe et œillet sur le devant |
| Coupe | Manches chauve-souris |
| Indice de chaleur | 2/5 — mi-saison |
| Mannequin | 1,65 m, taille 34/36, porte la taille S |

## À personnaliser avant la mise en ligne

| Quoi | Où |
| --- | --- |
| Nom de la marque (« Maison Ivoire ») | les quatre pages (`.marque`, `<title>`, pied de page) |
| Adresse e-mail de commande | `assets/js/main.js` (constante `EMAIL`) et les liens `mailto:` des quatre pages |
| Prix | `assets/js/main.js` (constante `PRIX`) et les mentions « 20 € » dans les quatre pages |
| Fin de l'offre de livraison | `assets/js/main.js` (constante `FIN_OFFRE`) |
| Délais d'expédition et retours | `.garanties` et la FAQ dans `index.html`, volet « Livraison et retours » des fiches |

Les délais annoncés (expédition sous 48 h, retour sous 14 jours) sont des valeurs de départ :
vérifiez qu'elles correspondent à ce que vous pratiquez avant de publier.

## Ajouter des photos à un produit

Déposez le fichier dans `assets/img/` puis, dans la fiche du coloris, ajoutez une vignette
à la liste `.galerie__vignettes` :

```html
<li><button type="button" class="galerie__vignette"
    data-src="assets/img/cape-ivoire-5.webp"
    data-alt="Description de la photo"
    data-legende="Légende affichée sous la vue"><img
    src="assets/img/cape-ivoire-5.webp" alt="Vue 5" loading="lazy"
    width="1296" height="1728"></button></li>
```

La première vignette porte `aria-current="true"` : c'est la vue affichée à l'ouverture.
Quand un coloris n'a qu'une seule photo, la liste de vignettes est simplement absente.

Pour une photo dont le cadrage 3/4 coupe mal — une image en 2/3, par exemple — ajoutez
`data-position="center 62%"` sur le bouton : la vue principale reprend ce cadrage au clic.

## L'offre de livraison offerte

Le bandeau du haut affiche « Livraison offerte pendant une semaine » suivi du temps
restant, calculé à partir de `FIN_OFFRE` dans `assets/js/main.js` :

```js
var FIN_OFFRE = new Date("2026-08-31T23:59:59+02:00");
```

Une fois la date passée, le bandeau bascule tout seul sur « Livraison offerte sur toutes
les commandes » et le décompte disparaît. **Mettez cette date à jour à chaque nouvelle
opération** : un décompte qui se remet à zéro tout seul est une pratique commerciale
trompeuse.

## Poids des médias

Les fichiers servis ne sont jamais les originaux. `compresser.py` produit, depuis
`assets/*/originaux/` :

- deux largeurs par photo (640 et 1080 px) en WebP, que les pages déclarent en `srcset` ;
- une vidéo en 540 px de large, sans piste audio, et son image d'attente.

```bash
pip install pillow imageio-ffmpeg
python3 compresser.py
```

À relancer après chaque photo ou vidéo ajoutée dans `originaux/`. Les 11 photos et les
2 vidéos passent ainsi de 12 Mo à 4 Mo, et un téléphone ne charge que les versions 640.

## Commandes et paiement

Le site ne demande ni nom, ni adresse, ni e-mail : la cliente choisit son coloris, sa
taille et sa quantité, puis « Commander » l'envoie sur la page de paiement, qui se charge
des coordonnées et du règlement.

Collez vos liens de paiement (Stripe, SumUp, PayPal…) dans `assets/js/main.js` :

```js
var PAIEMENT = {
  "Moka": "https://buy.stripe.com/...",
  "Crème": "",
  "Noir": ""
};
```

Tant qu'un lien est vide, le bouton bascule sur un e-mail de commande prérempli avec le
coloris, la taille et la quantité — de quoi vendre dès aujourd'hui, en renvoyant le lien
de paiement à la main.

## Mise en ligne (GitHub Pages)

Dans les réglages du dépôt : **Settings → Pages → Source : Deploy from a branch**,
puis choisissez la branche et le dossier `/ (root)`. Le site est publié quelques minutes après.
