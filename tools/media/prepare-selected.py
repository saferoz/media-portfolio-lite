from pathlib import Path
import subprocess, json, imageio_ffmpeg
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[2]
DEST=ROOT/'public/media'; DEST.mkdir(exist_ok=True)
FFMPEG=imageio_ffmpeg.get_ffmpeg_exe()
SOURCES=[('eltacoria-translation',r'F:/2. Raden Media Production/El Tacoria 2/Rendered/Newly Rendered/Translation.mp4',14.35),('eltacoria-app',r'F:/2. Raden Media Production/El Tacoria 2/Rendered/Newly Rendered/App with Voiceover Draft 2.mp4',24.98),('jury-eid',r'F:/2. Raden Media Production/2025/RAMADAN WORK EDITED MASTER/JURY/Jury Eid Gift.mp4',21.67),('jury-cake',r'F:/2. Raden Media Production/2025/RAMADAN WORK EDITED MASTER/JURY/Jury Cake 4K.mp4',17.64)]
def encode(name,args):
 subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-y',*args,str(DEST/name)],check=True)
 print(name,(DEST/name).stat().st_size,flush=True)
for name,src,duration in SOURCES:
 encode(name+'-film.mp4',['-i',src,'-map','0:v:0','-map','0:a:0?','-c:v','libx264','-crf','22','-preset','fast','-threads','4','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-map_metadata','-1'])
 encode(name+'-preview.mp4',['-ss','1','-i',src,'-t','6','-an','-vf','scale=360:640','-c:v','libx264','-crf','25','-preset','fast','-threads','4','-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata','-1'])
 encode(name+'-poster.webp',['-ss','2','-i',src,'-frames:v','1','-vf','scale=720:1280','-c:v','libwebp','-quality','86'])
# Web derivatives retain the supplied compositions and colors. Originals stay untouched.
images=Path('D:/OneDrive - OxfordSaudia/Desktop/Colorist Stills')
for src,name,width in [('Untitled_1.15.1.png','grading-after',1920),('Untitled_1.15.2.png','grading-before',1920),('Color 1.jpg','grading-night',1400),('Color 2.1.jpg','grading-process',1400),('Color 3.jpg','grading-day',1400),('Color 4.jpg','grading-flight',1400)]:
 with Image.open(images/src) as original:
  im=ImageOps.exif_transpose(original).convert('RGB');im.thumbnail((width,2400),Image.Resampling.LANCZOS);im.save(DEST/(name+'.webp'),'WEBP',quality=92,method=6)
 print(name,flush=True)
(ROOT/'tools/media/selected-work-manifest.json').write_text(json.dumps({'videos':[{'id':name,'source':src,'duration':duration} for name,src,duration in SOURCES],'files':[{'name':p.name,'bytes':p.stat().st_size} for p in sorted(DEST.iterdir()) if p.name.startswith(('eltacoria','jury','grading'))]},indent=2),encoding='utf-8')
