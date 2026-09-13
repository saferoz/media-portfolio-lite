"""Render the ten-second editorial hero as one file per device."""
from pathlib import Path
import subprocess,json,imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'public/media'; TMP=ROOT/'.local/hero'; TMP.mkdir(parents=True,exist_ok=True)
FF=imageio_ffmpeg.get_ffmpeg_exe()
# Each segment is two seconds. Credits in heroShotIds follow this same order.
SHOTS=[('jury-cake',11,'crop=1080:608:0:490','crop=1080:1440:0:260'),('students',2,None,'crop=810:1080:950:0'),('hazardous',18,'crop=1080:608:0:500','crop=1080:1440:0:100'),('diriyah',8,'crop=1920:800:0:140','crop=810:800:650:140'),('spiderman',17.5,'crop=1080:608:0:140','crop=1080:1440:0:180')]
def run(args): subprocess.run([FF,'-hide_banner','-loglevel','error','-y',*args],check=True)
for device,w,h,bitrate in [('desktop',1600,900,'2100k'),('mobile',540,720,'850k')]:
 parts=[]
 for i,(name,start,desktop,mobile) in enumerate(SHOTS):
  crop=desktop if device=='desktop' else mobile
  vf=(crop+',' if crop else '')+f'scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},setsar=1,fps=24'
  target=TMP/f'{device}-{i}.mp4';parts.append(target)
  run(['-ss',str(start),'-i',str(OUT/(name+'-film.mp4')),'-t','2','-an','-vf',vf,'-c:v','libx264','-crf','18','-preset','fast','-threads','3','-pix_fmt','yuv420p',str(target)])
 listing=TMP/(device+'.txt');listing.write_text(''.join("file '"+p.as_posix()+"'\n" for p in parts),encoding='utf-8')
 run(['-f','concat','-safe','0','-i',str(listing),'-an','-c:v','libx264','-b:v',bitrate,'-maxrate',bitrate,'-bufsize','2M','-preset','slow','-threads','3','-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata','-1',str(OUT/f'hero-montage-{device}.mp4')])
 run(['-i',str(OUT/f'hero-montage-{device}.mp4'),'-frames:v','1','-c:v','libwebp','-quality','85',str(OUT/('hero-montage-poster.webp' if device=='desktop' else 'hero-montage-mobile-poster.webp'))])
 print(device,(OUT/f'hero-montage-{device}.mp4').stat().st_size,flush=True)
(ROOT/'tools/media/hero-manifest.json').write_text(json.dumps({'duration':10,'shots':[{'project':n,'sourceStart':s,'seconds':2,'desktopCrop':d,'mobileCrop':m} for n,s,d,m in SHOTS],'files':[{'name':p.name,'bytes':p.stat().st_size} for p in OUT.glob('hero-*')]},indent=2),encoding='utf-8')
