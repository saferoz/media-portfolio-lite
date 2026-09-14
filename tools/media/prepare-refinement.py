"""Prepare the approved student excerpt, hazardous poster and Cadillac film.
Source footage is never modified. Run with the same PYTHONPATH as prepare-hero.py.
"""
from pathlib import Path
import json, subprocess, imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/media'
FF=imageio_ffmpeg.get_ffmpeg_exe()
def run(name,args):
 subprocess.run([FF,'-hide_banner','-loglevel','error','-y',*map(str,args),str(OUT/name)],check=True)
 print(name,(OUT/name).stat().st_size,flush=True)
def main():
 common=['-c:v','libx264','-preset','fast','-threads',3,'-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata',-1]
 for kind,w,crf in [('film',1280,20),('preview',640,25)]:
  audio=['-c:a','aac','-b:a','128k'] if kind=='film' else ['-an']
  run(f'students-intro-v2-{kind}.mp4',['-ss',12,'-i',OUT/'students-film.mp4','-t',12,'-vf',f'scale={w}:-2',*common,'-crf',crf,*audio])
 run('hazardous-v2-poster.webp',['-ss',41,'-i',OUT/'hazardous-film.mp4','-frames:v',1,'-vf','scale=720:-2','-c:v','libwebp','-quality',86])
 src='D:/Downloads/Cadillac.mp4'
 run('cadillac-film.mp4',['-i',src,'-map','0:v:0','-map','0:a:0?','-vf','scale=1080:1920',*common,'-crf',23,'-maxrate','2800k','-bufsize','5600k','-c:a','aac','-b:a','160k'])
 run('cadillac-preview.mp4',['-ss',3,'-i',OUT/'cadillac-film.mp4','-t',6,'-an','-vf','scale=360:640',*common,'-crf',25])
 run('cadillac-poster.webp',['-ss',3,'-i',OUT/'cadillac-film.mp4','-frames:v',1,'-vf','scale=720:1280','-c:v','libwebp','-quality',86])
 manifest={'studentIntro':{'source':'public/media/students-film.mp4','sourceStart':12,'sourceEnd':24,'seconds':12,'filmAudio':True,'previewAudio':False,'posterSourceTime':15},'hazardous':{'posterSource':'public/media/hazardous-film.mp4','posterSourceTime':41,'unchangedPreviewStart':75},'cadillac':{'source':src,'duration':101.08,'previewStart':3,'previewSeconds':6,'posterTime':3,'fullFilmAudio':True,'previewAudio':False},'files':[{'name':p.name,'bytes':p.stat().st_size} for p in OUT.iterdir() if p.name.startswith(('students-intro-v2','hazardous-v2','cadillac-'))]}
 (ROOT/'tools/media/refinement-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
 p=ROOT/'tools/media/motion-manifest.json'; m=json.loads(p.read_text()); m['clips'][0].update(duration=12,output='students-intro-v2',posterOutput='students-intro-poster.webp'); p.write_text(json.dumps(m,indent=2)+'\n')
if __name__=='__main__': main()
