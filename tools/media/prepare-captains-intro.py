"""Keep the animated question card complete: source 12-20 seconds."""
from pathlib import Path
import json, subprocess, imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/media'
FF=imageio_ffmpeg.get_ffmpeg_exe()
for kind,width,crf in [('film',1280,20),('preview',640,25)]:
 output=OUT/f'captains-intro-v2-{kind}.mp4'
 subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-ss','12','-i',str(OUT/'captains-film.mp4'),'-t','8','-vf',f'scale={width}:-2','-c:v','libx264','-crf',str(crf),'-preset','fast','-threads','3','-pix_fmt','yuv420p','-movflags','+faststart',*(['-an'] if kind=='preview' else ['-c:a','aac','-b:a','128k']),str(output)],check=True)
 print(output.name,output.stat().st_size)
p=ROOT/'tools/media/motion-manifest.json'
m=json.loads(p.read_text());m['clips'][1].update(duration=8,output='captains-intro-v2',posterOutput='captains-intro-poster.webp');p.write_text(json.dumps(m,indent=2)+'\n',encoding='utf-8')
