#!/usr/bin/env python3
"""Assemble le site en un seul fichier HTML (CSS, JS et images inlinés)."""

import base64
import pathlib
import re

RACINE = pathlib.Path(__file__).parent
TYPES = {".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}


def data_uri(chemin: pathlib.Path) -> str:
    mime = TYPES[chemin.suffix.lower()]
    donnees = base64.b64encode(chemin.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{donnees}"


def construire() -> str:
    html = (RACINE / "index.html").read_text(encoding="utf-8")
    css = (RACINE / "assets/css/style.css").read_text(encoding="utf-8")
    js = (RACINE / "assets/js/main.js").read_text(encoding="utf-8")

    html = html.replace(
        '<link rel="stylesheet" href="assets/css/style.css">',
        f"<style>\n{css}\n</style>",
    )
    html = html.replace(
        '<script src="assets/js/main.js"></script>',
        f"<script>\n{js}\n</script>",
    )

    for image in sorted((RACINE / "assets/img").iterdir()):
        if image.suffix.lower() in TYPES:
            html = html.replace(f"assets/img/{image.name}", data_uri(image))

    reste = re.findall(r'(?:src|href)="assets/[^"]+"', html)
    if reste:
        raise SystemExit(f"Références non inlinées : {reste}")

    return html


if __name__ == "__main__":
    sortie = RACINE / "boutique-en-un-fichier.html"
    sortie.write_text(construire(), encoding="utf-8")
    print(f"{sortie.name} — {sortie.stat().st_size / 1024:.0f} Ko")
