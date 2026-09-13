"""Render the four-shot hero only; original footage remains untouched."""
from pathlib import Path
import subprocess, json, imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/media'; TMP=ROOT/'.local/hero-polish'; TMP.mkdir(parents=True,exist_ok=True)
FF=imageio_ffmpeg.get_ffmpeg_exe()
SHOTS=[
 ('TENET', 'E:/Gen AI Projects/TENET/Generations/TENET PERFECT.mp4',0.25,4,0.25),
 ('Rakan', 'E:/V1-0014_Rakan Brolls149555201.mov',8,4,0.62),
 ('SwiftSoft', 'E:/Gen AI Projects/SwiftSoft/4K videos/hf_20260731_220106_d224db06-b626-4a90-9c54-7011291da0d2.mp4',1,4,0.67),
 ('Cockpit', 'E:/horizontal cockpit.mp4',0,4,0.5),
]
MOBILE_SOURCES={'TENET':'E:/tenet vertical.mp4','Rakan':'E:/2nd clip vertical.mp4','Cockpit':'E:/cockpit vertical.mp4'}

def run(args): subprocess.run([FF,'-hide_banner','-loglevel','error','-y',*args],check=True)
for device,w,h,bitrate in [('desktop',1280,720,'1800k'),('mobile',540,960,'950k')]:
 parts=[]
 for i,(name,src,start,duration,focus) in enumerate(SHOTS):
  if device=='mobile' and name in MOBILE_SOURCES: src,start=MOBILE_SOURCES[name],0
  target=TMP/f'{device}-{i}.mp4'; parts.append(target)
  x=focus if device=='mobile' else (0 if name=='TENET' else 0.5)
  vf=f'scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}:(iw-ow)*{x}:(ih-oh)/2,setsar=1,fps=24,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS'
  run(['-ss',str(start),'-i',src,'-t',str(duration),'-an','-vf',vf,'-c:v','libx264','-crf','18','-preset','fast','-threads','3',str(target)])
 args=[]
 for part in parts: args+=['-i',str(part)]
 # Short dissolves retain the pace of the footage rather than adding motion effects.
 graph='[0:v][1:v]xfade=transition=fade:duration=0.35:offset=3.65[v1];[v1][2:v]xfade=transition=fade:duration=0.35:offset=7.3[v2];[v2][3:v]xfade=transition=fade:duration=0.35:offset=10.95[v]'
 target=OUT/f'hero-personal-{device}.mp4'
 run([*args,'-filter_complex_threads','1','-filter_complex',graph,'-map','[v]','-an','-c:v','libx264','-b:v',bitrate,'-maxrate',bitrate,'-bufsize','2M','-preset','slow','-threads','3','-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata','-1',str(target)])
 run(['-i',str(target),'-frames:v','1','-c:v','libwebp','-quality','85',str(OUT/f'hero-personal-{device}-poster.webp')])
 print(device,target.stat().st_size,flush=True)
(ROOT/'tools/media/hero-manifest.json').write_text(json.dumps({'duration':14.95,'transitionSeconds':0.35,'shots':[{'name':n,'source':s,'sourceStart':t,'seconds':d,'mobileCropFraction':f} for n,s,t,d,f in SHOTS],'mobileSources':MOBILE_SOURCES,'mobileSourceStart':0,'desktopTenetCropFraction':0,'files':[{'name':p.name,'bytes':p.stat().st_size} for p in OUT.glob('hero-personal-*')]},indent=2),encoding='utf-8')
