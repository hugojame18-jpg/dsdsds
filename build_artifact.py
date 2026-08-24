#!/usr/bin/env python3
"""Assemble tout le site (accueil + fiches produit) en un seul fichier HTML.

CSS, JavaScript et images sont inlinés, et la navigation entre les pages
passe par l'ancre de l'adresse (#/accueil, #/moka…). Pratique pour envoyer
la boutique par e-mail ou l'héberger n'importe où sans arborescence.
"""

import base64
import pathlib
import re

RACINE = pathlib.Path(__file__).parent
TYPES = {".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
         ".mp4": "video/mp4"}

PAGES = [
    ("accueil", "index.html"),
    ("moka", "cape-moka.html"),
    ("ivoire", "cape-ivoire.html"),
    ("noir", "cape-noir.html"),
]

ROUTEUR = """
/* Navigation entre les pages du fichier unique. */
(function () {
  "use strict";
  function afficher() {
    var route = /^#\\/([a-z]+)(?:\\/([\\w-]+))?$/.exec(window.location.hash);
    var cle = route ? route[1] : "accueil";
    var ancre = route ? route[2] : null;
    var cible = document.getElementById("page-" + cle) || document.getElementById("page-accueil");
    Array.prototype.forEach.call(document.querySelectorAll(".page"), function (page) {
      page.hidden = page !== cible;
    });
    var vers = ancre && (document.getElementById(ancre + "--" + cle) || document.getElementById(ancre));
    if (vers) { vers.scrollIntoView(); } else { window.scrollTo(0, 0); }
  }
  window.addEventListener("hashchange", afficher);
  afficher();
})();
"""


def data_uri(chemin: pathlib.Path) -> str:
    mime = TYPES[chemin.suffix.lower()]
    return f"data:{mime};base64,{base64.b64encode(chemin.read_bytes()).decode('ascii')}"


def corps(html: str) -> str:
    return re.search(r"<body>(.*?)</body>", html, re.S).group(1).strip()


def vers_routes(html: str) -> str:
    """Les liens entre fichiers deviennent des ancres de navigation."""
    html = re.sub(r'href="index\.html#([\w-]+)"', r'href="#/accueil/\1"', html)
    html = html.replace('href="index.html"', 'href="#/accueil"')
    for cle, _ in PAGES[1:]:
        html = html.replace(f'href="cape-{cle}.html"', f'href="#/{cle}"')
    return html


def suffixer(html: str, cle: str) -> str:
    """Les quatre pages cohabitent : chaque identifiant reçoit sa page."""
    html = re.sub(r'\b(id|for|aria-labelledby)="([\w-]+)"', rf'\1="\2--{cle}"', html)
    html = re.sub(r'href="#(?!/)([\w-]+)"', rf'href="#\1--{cle}"', html)
    return html


def construire() -> str:
    index = (RACINE / "index.html").read_text(encoding="utf-8")
    tete = re.search(r"<head>(.*?)</head>", index, re.S).group(1)
    tete = re.sub(r'\s*<link rel="stylesheet" href="assets/css/style\.css">', "", tete)

    css = (RACINE / "assets/css/style.css").read_text(encoding="utf-8")
    js = (RACINE / "assets/js/main.js").read_text(encoding="utf-8")

    blocs = []
    for cle, fichier in PAGES:
        contenu = corps((RACINE / fichier).read_text(encoding="utf-8"))
        contenu = re.sub(r'\s*<script src="assets/js/main\.js"></script>', "", contenu)
        contenu = suffixer(vers_routes(contenu), cle)
        blocs.append(f'<div class="page" id="page-{cle}" hidden>\n{contenu}\n</div>')

    document = (
        "<!DOCTYPE html>\n<html lang=\"fr\">\n<head>"
        + tete
        + f"\n<style>\n{css}\n</style>\n</head>\n<body>\n"
        + "\n\n".join(blocs)
        + f"\n<script>\n{js}\n{ROUTEUR}\n</script>\n</body>\n</html>\n"
    )

    # Les photos ne sont encodées qu'une fois puis distribuées au chargement :
    # une même image apparaît sur plusieurs pages, l'inliner à chaque fois
    # quadruplerait le poids du fichier.
    banque = {}
    for image in sorted((RACINE / "assets/img").iterdir()):
        if image.suffix.lower() in TYPES:
            chemin = f"assets/img/{image.name}"
            banque[chemin] = data_uri(image)
            # L'espace évite de mordre sur data-src="…" des vignettes de galerie.
            document = document.replace(f' src="{chemin}"', f' data-image="{chemin}"')

    # Les vidéos n'apparaissent qu'une fois : elles vont directement dans le src.
    dossier_video = RACINE / "assets/video"
    if dossier_video.is_dir():
        for video in sorted(dossier_video.iterdir()):
            if video.suffix.lower() in TYPES:
                document = document.replace(f' src="assets/video/{video.name}"',
                                            f' src="{data_uri(video)}"')

    entrees = ",\n".join(f'  "{nom}": "{uri}"' for nom, uri in banque.items())
    document = document.replace(
        "<script>\n",
        "<script>\nvar IMAGES = {\n" + entrees + "\n};\n"
        "Array.prototype.forEach.call(document.querySelectorAll('[data-image]'), function (img) {\n"
        "  img.src = IMAGES[img.dataset.image];\n"
        "});\n",
        1,
    )

    reste = re.findall(r'(?:^|[^-])(?:src|href)="(?:assets/|[a-z-]+\.html)[^"]*"', document)
    if reste:
        raise SystemExit(f"Références non inlinées : {sorted(set(reste))}")

    return document


if __name__ == "__main__":
    sortie = RACINE / "boutique-en-un-fichier.html"
    sortie.write_text(construire(), encoding="utf-8")
    print(f"{sortie.name} — {sortie.stat().st_size / 1024:.0f} Ko")
