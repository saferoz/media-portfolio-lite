"""Render independent four-shot hero edits. Originals remain untouched.
Run with PYTHONPATH=C:/Users/User/AppData/Local/Temp/portfolio-media-tools.
"""
from pathlib import Path
import subprocess, json, imageio_ffmpeg
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/media'
TMP = ROOT / '.local/hero-v6'
FF = imageio_ffmpeg.get_ffmpeg_exe()
VERSION = 'hero-v6'
# name, source, in-point, horizontal crop fraction; mobile lengths are set below.
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
 manifest = json.loads((ROOT/'tools/media/hero-manifest.json').read_text())
 # Decode each original in one filter graph; only the final output is lossy.
 w,h,budget = 540,960,1800000
 fps = 24
 spider_source = TIMELINES['mobile'][2][1]
 spider_frames = imageio_ffmpeg.count_frames_and_secs(spider_source)[0] - 3 * fps
 spider_seconds = spider_frames / fps
 archi_start = 7.5 + spider_seconds
 archi_frames = 4 * fps
 target = OUT/f'{VERSION}-mobile.mp4'
 while True:
  args=[]; filters=[]; shots=[]
  for i,(name,src,start,focus) in enumerate(TIMELINES['mobile']):
   args += ['-i',src]
   frames = spider_frames if i == 2 else archi_frames if i == 3 else 96
   trim = f'trim=start_frame={int(start*fps)}:end_frame={int(start*fps)+frames}'
   vf = f'{trim},setpts=PTS-STARTPTS,scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}:(iw-ow)*{focus}:(ih-oh)/2,setsar=1,fps=24,format=yuv420p,settb=AVTB'
   if i == 2: vf += ',tpad=stop_mode=clone:stop_duration=0.35'
   filters.append(f'[{i}:v]{vf}[s{i}]')
   shots.append({'name':name,'source':src,'sourceStart':start,'seconds':frames/fps,'sourceFrames':frames,'cropFraction':focus,'sourceCrop':None,'timelineStart':[0,3.65,7.5,archi_start][i], 'finalFrameHoldSeconds': .35 if i == 2 else 0})
  filters += ['[s0][s1]xfade=transition=fade:duration=0.35:offset=3.65[v1]', '[v1][s2]xfade=transition=fade:duration=0.15:offset=7.5[v2]', f'[v2][s3]xfade=transition=fade:duration=0.35:offset={archi_start}[v]']
  run([*args,'-filter_complex_threads',1,'-filter_complex',';'.join(filters),'-map','[v]','-an','-c:v','libx264','-b:v','900k','-maxrate','900k','-bufsize','2M','-preset','slow','-threads',3,'-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata',-1,target])
  print('ARCHI frames',archi_frames,'bytes',target.stat().st_size,flush=True)
  if target.stat().st_size <= budget: break
  archi_frames -= 1
  assert archi_frames > 8, 'Cannot fit the rendition within its budget'
 poster = OUT/f'{VERSION}-mobile-poster.webp'
 run(['-i',target,'-frames:v',1,'-c:v','libwebp','-quality',85,poster])
 output_frames, duration = imageio_ffmpeg.count_frames_and_secs(str(target))
 manifest['version'] = 'desktop-v4-mobile-v6'
 manifest['devices']['mobile']={'duration':duration,'encodedFrames':output_frames,'fps':fps,'transitions':[.35,.15,.35],'encoding':'Original inputs, one final lossy encode; 900k maxrate, 2M buffer, slow preset','width':w,'height':h,'budgetBytes':budget,'shots':shots,'files':[{'name':p.name,'bytes':p.stat().st_size} for p in [target,poster]]}
 (ROOT/'tools/media/hero-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
if __name__=='__main__': main()
