"""Render independent four-shot hero edits. Originals remain untouched.
Run with PYTHONPATH=C:/Users/User/AppData/Local/Temp/portfolio-media-tools.
"""
from pathlib import Path
import subprocess, json, imageio_ffmpeg
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/media'
TMP = ROOT / '.local/hero-v4'
FF = imageio_ffmpeg.get_ffmpeg_exe()
VERSION = 'hero-v4'
# name, source, in-point, horizontal crop fraction; every shot is four seconds.
# TENET preserves the preceding recipe exactly, including authored mobile framing.
TIMELINES = {
 'desktop': [
  ('TENET', 'E:/Gen AI Projects/TENET/Generations/TENET PERFECT.mp4', .25, 0),
  ('Simulator', 'D:/Downloads/sim room v2.mp4', 0, .5),
  ('Rakan preflight', 'E:/V1-0014_Rakan Brolls149555201.mov', 8, .5),
  ('Diriyah', str(OUT/'diriyah-film.mp4'), 7, .5),
 ],
 'mobile': [
  ('TENET', 'E:/TEMPP DELL optionss/tenet vertical.mp4', 0, .25),
  ('Preflight inspection', 'E:/TEMPP DELL optionss/preflight inspection clip vertical.mp4', 0, .5),
  ('Spider-Man', 'E:/Gen AI Projects/Spiderman-v2/hf_20260803_221432_eb56c480-8903-4090-839a-47ccf212ee14.mp4', 3, .5),
  ('ARCHI', 'E:/TEMPP DELL optionss/Eating Final.mp4', 3, .5),

 ],
}
def run(args):
 subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', *map(str,args)], check=True)

def main():
 TMP.mkdir(parents=True, exist_ok=True)
 manifest = {'duration': 14.95, 'transitionSeconds': .35, 'fps': 24, 'audio': False, 'version': VERSION, 'devices': {}}
 for device,w,h,bitrate,budget in [('desktop',1280,720,'1800k',3500000),('mobile',540,960,'900k',1800000)]:
  parts=[]; shots=[]
  for i,(name,src,start,focus) in enumerate(TIMELINES[device]):
   target=TMP/f'{device}-{i}.mp4'; parts.append(target)
   range_filter=''
   precrop='crop=1920:816:0:132,' if name=='Diriyah' else ''
   vf=f'{precrop}scale={w}:{h}:force_original_aspect_ratio=increase{range_filter},crop={w}:{h}:(iw-ow)*{focus}:(ih-oh)/2,setsar=1,fps=24,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS'
   run(['-ss',start,'-i',src,'-t',4,'-an','-vf',vf,'-c:v','libx264','-crf',18,'-preset','fast','-threads',3,target])
   shots.append({'name':name,'source':src,'sourceStart':start,'seconds':4,'cropFraction':focus,'sourceCrop': '1920:816:0:132' if name=='Diriyah' else None,'timelineStart':round(i*3.65,2)})
  args=[]
  for part in parts: args+=['-i',part]
  graph='[0:v][1:v]xfade=transition=fade:duration=0.35:offset=3.65[v1];[v1][2:v]xfade=transition=fade:duration=0.35:offset=7.3[v2];[v2][3:v]xfade=transition=fade:duration=0.35:offset=10.95[v]'
  target=OUT/f'{VERSION}-{device}.mp4'
  run([*args,'-filter_complex_threads',1,'-filter_complex',graph,'-map','[v]','-an','-c:v','libx264','-b:v',bitrate,'-maxrate',bitrate,'-bufsize','2M','-preset','slow','-threads',3,'-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata',-1,target])
  assert target.stat().st_size <= budget, f'{device} exceeds budget'
  poster=OUT/f'{VERSION}-{device}-poster.webp'
  run(['-i',target,'-frames:v',1,'-c:v','libwebp','-quality',85,poster])
  manifest['devices'][device]={'width':w,'height':h,'budgetBytes':budget,'shots':shots,'files':[{'name':p.name,'bytes':p.stat().st_size} for p in [target,poster]]}
  print(device,target.stat().st_size,flush=True)
 (ROOT/'tools/media/hero-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
if __name__=='__main__': main()
