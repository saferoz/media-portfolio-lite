"""Render a quiet BTS-to-finished-film hero; originals remain untouched."""
from pathlib import Path
import subprocess, json, imageio_ffmpeg
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/media'; TMP=ROOT/'.local/hero'; TMP.mkdir(parents=True,exist_ok=True)
FF=imageio_ffmpeg.get_ffmpeg_exe()
RESULT=Path('E:/1. Freelancing Scope/ARCHI 3/Rendered Fix/Eating Final.mp4')
def run(args): subprocess.run([FF,'-hide_banner','-loglevel','error','-y',*args],check=True)
for device,w,h,bitrate,bts,rotation in [
 ('desktop',1280,720,'1800k','D:/Downloads/IMG_9654.MOV','transpose=2,'),
 ('mobile',540,720,'850k','D:/Downloads/IMG_9653.MOV','')]:
 parts=[]
 for i,(source,start,duration,extra) in enumerate([(bts,1,2,rotation),(str(RESULT),1,6,'')]):
  target=TMP/f'quiet-{device}-{i}.mp4'; parts.append(target)
  sw,sh=(int(w*1.12)//2*2,int(h*1.12)//2*2) if i==0 and device=='desktop' else (w,h)
  crop_x='iw-ow' if i==0 else '(iw-ow)/2'
  vf=extra+f'scale={sw}:{sh}:force_original_aspect_ratio=increase,crop={w}:{h}:{crop_x}:(ih-oh)/2,setsar=1,fps=24,format=yuv420p'
  run(['-ss',str(start),'-i',source,'-t',str(duration),'-an','-vf',vf,'-c:v','libx264','-crf','18','-preset','fast','-threads','3',str(target)])
 target=OUT/f'hero-personal-{device}.mp4'
 run(['-i',str(parts[0]),'-i',str(parts[1]),'-filter_complex','[0:v][1:v]xfade=transition=fade:duration=0.4:offset=1.6[v]','-map','[v]','-an','-c:v','libx264','-b:v',bitrate,'-maxrate',bitrate,'-bufsize','2M','-preset','slow','-threads','3','-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata','-1',str(target)])
 run(['-i',str(target),'-frames:v','1','-c:v','libwebp','-quality','85',str(OUT/f'hero-personal-{device}-poster.webp')])
 print(device,target.stat().st_size,flush=True)
run(['-i',str(RESULT),'-an','-vf','scale=720:1280','-c:v','libx264','-crf','21','-preset','fast','-threads','3','-movflags','+faststart',str(OUT/'archi-film.mp4')])
# Preserve the supplied commercial audio in the click-to-play film.
run(['-i',str(OUT/'archi-film.mp4'),'-i',str(RESULT),'-map','0:v','-map','1:a?','-c:v','copy','-c:a','aac','-b:a','160k','-movflags','+faststart',str(TMP/'archi-audio.mp4')])
(TMP/'archi-audio.mp4').replace(OUT/'archi-film.mp4')
run(['-ss','10','-i',str(RESULT),'-frames:v','1','-vf','scale=540:-2','-c:v','libwebp','-quality','85',str(OUT/'archi-poster.webp')])
photo=ImageOps.exif_transpose(Image.open('D:/OneDrive - OxfordSaudia/Desktop/48951872C95525A5F88A2A95ED09CC65.png')).convert('RGB')
photo.thumbnail((1480,1000));photo.save(OUT/'about-studio-bts.webp',quality=87)
(ROOT/'tools/media/hero-manifest.json').write_text(json.dumps({'duration':7.6,'transition':{'type':'dissolve','start':1.6,'seconds':0.4},'shots':[{'project':'archi','kind':'BTS','seconds':2,'sourceStart':1},{'project':'archi','kind':'Finished commercial','seconds':6,'sourceStart':1}],'files':[{'name':p.name,'bytes':p.stat().st_size} for p in OUT.glob('hero-personal-*')]},indent=2),encoding='utf-8')
