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
assets/js/main.js       total et envoi de la commande, pour chaque formulaire
assets/img/             les trois photos produit
build_artifact.py       génère boutique-en-un-fichier.html (tout le site inliné)
```

Les quatre pages partagent la même feuille de style et le même script.

L'accueil est une vitrine : une grille de vignettes (photo, nom, prix), puis la
présentation de la pièce, les garanties et l'aide.

Une fiche produit reprend la photo, le prix, le sélecteur de coloris, le formulaire de
commande pré-réglé, puis le descriptif : texte de présentation, indice de chaleur,
mensurations du mannequin, matière, tailles, longueurs et volet livraison.

### Caractéristiques du produit

Elles sont écrites en clair dans les fiches, à un seul endroit par page :

| | |
| --- | --- |
| Matière | 100 % polyester |
| Taille | Unique, convient du 34 au 44 |
| Longueur | 78 cm devant, 83 cm dos |
| Fermeture | Agrafe et œillet sur le devant |
| Coupe | Manches chauve-souris |
| Indice de chaleur | 2/5 — mi-saison |
| Mannequin | 1,65 m, taille 34/36, porte la taille unique |

## À personnaliser avant la mise en ligne

| Quoi | Où |
| --- | --- |
| Nom de la marque (« Maison Ivoire ») | les quatre pages (`.marque`, `<title>`, pied de page) |
| Adresse e-mail de commande | `assets/js/main.js` (constante `EMAIL`) et les liens `mailto:` des quatre pages |
| Prix | `assets/js/main.js` (constante `PRIX`) et les mentions « 20 € » dans les quatre pages |
| Délais d'expédition et retours | `.garanties` et la FAQ dans `index.html`, volet « Livraison et retours » des fiches |

Les délais annoncés (expédition sous 48 h, retour sous 14 jours) sont des valeurs de départ :
vérifiez qu'elles correspondent à ce que vous pratiquez avant de publier.

## Commandes

Le formulaire ne stocke rien : il compose un e-mail prérempli avec le coloris, la quantité,
l'adresse et le total. Si la messagerie ne s'ouvre pas, un récapitulatif copiable s'affiche
sous le bouton.

Pour encaisser en ligne, deux options simples :

- un lien de paiement Stripe / SumUp / PayPal envoyé en réponse à la commande (fonctionnement actuel) ;
- un bouton de paiement à coller à la place du formulaire, si vous préférez le paiement immédiat.

## Mise en ligne (GitHub Pages)

Dans les réglages du dépôt : **Settings → Pages → Source : Deploy from a branch**,
puis choisissez la branche et le dossier `/ (root)`. Le site est publié quelques minutes après.
