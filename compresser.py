#!/usr/bin/env python3
"""Fabrique les fichiers servis au visiteur à partir des originaux.

Les photos reçues et les vidéos brutes vivent dans `assets/*/originaux/`.
Ce script en tire les versions allégées que le site charge réellement :

  photos  → deux largeurs (640 et 1080 px) en WebP, pour le srcset
  vidéos  → un MP4 compressé en 540 px de large et son image d'attente

À relancer après chaque ajout dans `originaux/`. Nécessite Pillow et
imageio-ffmpeg (`pip install pillow imageio-ffmpeg`).
"""

import pathlib
import subprocess

from PIL import Image

RACINE = pathlib.Path(__file__).parent
PHOTOS = RACINE / "assets/img"
VIDEOS = RACINE / "assets/video"

LARGEURS = (640, 1080)
QUALITE = 74
LARGEUR_VIDEO = 540


def photos():
    for source in sorted((PHOTOS / "originaux").iterdir()):
        if source.suffix.lower() not in (".webp", ".jpg", ".jpeg", ".png"):
            continue
        image = Image.open(source).convert("RGB")
        for largeur in LARGEURS:
            hauteur = round(image.height * largeur / image.width)
            sortie = PHOTOS / f"{source.stem}-{largeur}.webp"
            image.resize((largeur, hauteur), Image.LANCZOS).save(
                sortie, "WEBP", quality=QUALITE, method=6
            )
            print(f"  {sortie.name} — {largeur}×{hauteur}, {sortie.stat().st_size // 1024} Ko")


def videos():
    import imageio_ffmpeg

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    for source in sorted((VIDEOS / "originaux").iterdir()):
        if source.suffix.lower() != ".mp4":
            continue

        sortie = VIDEOS / source.name
        subprocess.run(
            [ffmpeg, "-y", "-loglevel", "error", "-i", str(source),
             "-vf", f"scale={LARGEUR_VIDEO}:-2",
             "-c:v", "libx264", "-crf", "30", "-preset", "slow",
             "-profile:v", "main", "-pix_fmt", "yuv420p",
             "-movflags", "+faststart", "-an", str(sortie)],
            check=True,
        )
        print(f"  {sortie.name} — {sortie.stat().st_size // 1024} Ko")

        # Image d'attente : sans elle, le bloc reste vide le temps du chargement.
        affiche = VIDEOS / f"{source.stem}-affiche.webp"
        subprocess.run(
            [ffmpeg, "-y", "-loglevel", "error", "-ss", "1", "-i", str(source),
             "-frames:v", "1", "-vf", f"scale={LARGEUR_VIDEO}:-2",
             "-quality", "70", str(affiche)],
            check=True,
        )
        print(f"  {affiche.name} — {affiche.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    print("Photos :")
    photos()
    print("Vidéos :")
    videos()
