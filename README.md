# Maison Ivoire — boutique en ligne

Site vitrine d'une seule pièce : la cape d'hiver bordée de fourrure, trois coloris, **20 €**, livraison offerte.

Site statique, sans dépendance ni étape de build. Un `index.html`, une feuille de style, un script.

## Ouvrir le site

Double-cliquez sur `index.html`, ou lancez un petit serveur local :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Structure

```
index.html              la page complète
assets/css/style.css    palette, typographie, mise en page
assets/js/main.js       total, présélection du coloris, envoi de la commande
assets/img/             les trois photos produit
build_artifact.py       génère boutique-en-un-fichier.html (tout inliné)
```

## À personnaliser avant la mise en ligne

| Quoi | Où |
| --- | --- |
| Nom de la marque (« Maison Ivoire ») | `index.html` (`.marque`, `<title>`, pied de page) |
| Adresse e-mail de commande | `assets/js/main.js` (constante `EMAIL`) et `index.html` (liens `mailto:`) |
| Prix | `assets/js/main.js` (constante `PRIX`) et les mentions « 20 € » dans `index.html` |
| Délais d'expédition et retours | section `.garanties` et la FAQ dans `index.html` |

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
