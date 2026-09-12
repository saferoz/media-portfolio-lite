"""Prepare portfolio derivatives without altering the supplied source files.

Requires Pillow and imageio-ffmpeg. Run from the repository root.
"""
from pathlib import Path
import json
import subprocess
import imageio_ffmpeg
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / "public" / "media"
VIDEO = Path("E:/Gen AI Projects/SwiftSoft/Renders/Swifftsoft - Final v5.mp4")
PORTRAIT = Path("D:/Downloads/profile.png")
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
DEST.mkdir(parents=True, exist_ok=True)

def encode(name, options):
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", *options,
                    str(DEST / name)], check=True)
    print(name, (DEST / name).stat().st_size, flush=True)

def clip(name, seconds, size, bitrate, start=0):
    encode(name, ["-ss", str(start), "-i", str(VIDEO), "-t", str(seconds),
                  "-an", "-vf", size, "-c:v", "libx264", "-preset", "medium",
                  "-b:v", bitrate, "-maxrate", bitrate, "-bufsize", "2M",
                  "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-map_metadata", "-1"])

clip("hero-desktop.mp4", 10, "scale=1600:900", "2400k")
clip("hero-mobile.mp4", 10, "crop=810:1080:650:0,scale=540:720", "950k")
clip("swiftsoft-preview.mp4", 7, "scale=960:540", "900k")
encode("swiftsoft-film.mp4", ["-i", str(VIDEO), "-map", "0:v:0", "-map", "0:a:0",
                             "-c:v", "libx264", "-crf", "22", "-preset", "medium",
                             "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
                             "-movflags", "+faststart", "-map_metadata", "-1"])
for name, second, width in [
    ("hero-poster.webp", 1, 1600),
    ("swiftsoft-poster.webp", 1, 1280),
    ("swiftsoft-still-01.webp", 12, 960),
    ("swiftsoft-still-02.webp", 24, 960),
    ("swiftsoft-still-03.webp", 40, 960),
]:
    encode(name, ["-ss", str(second), "-i", str(VIDEO), "-frames:v", "1", "-vf",
                  f"scale={width}:-1", "-c:v", "libwebp", "-quality", "80"])

with Image.open(PORTRAIT) as im:
    im.thumbnail((900, 1154), Image.Resampling.LANCZOS)
    im.convert("RGB").save(DEST / "portrait.webp", "WEBP", quality=86, method=6)

manifest = {
    "source": {"title": "SwiftSoft", "durationSeconds": 55.51, "width": 1920,
               "height": 1080, "fps": 24, "originalBytes": 94653591},
    "derivatives": [
        {"file": path.name, "bytes": path.stat().st_size}
        for path in sorted(DEST.iterdir()) if path.is_file()
    ],
    "notes": [
        "Original sources are unchanged.",
        "Hero uses the opening ten seconds; card preview uses opening seven seconds.",
        "Stills are from SwiftSoft and must not be labeled as separate completed projects.",
        "Full film retains original audio; all previews are silent.",
    ],
}
(ROOT / "tools" / "media" / "manifest.json").write_text(json.dumps(manifest, indent=2))
print(json.dumps(manifest, indent=2))
