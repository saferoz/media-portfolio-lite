"""Primary Escalade sample; retain cadillac-* as the second film."""
from pathlib import Path
import json, subprocess, imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/media'
SOURCE='D:/Downloads/CADILLAC ESCALADE 2ND SAMPLE BY RADEN (With CAR Sound) (1).mp4'
FF=imageio_ffmpeg.get_ffmpeg_exe()
def run(name,args):
 subprocess.run([FF,'-hide_banner','-loglevel','error','-y',*map(str,args),str(OUT/name)],check=True)
 print(name,(OUT/name).stat().st_size,flush=True)
def main():
 common=['-c:v','libx264','-preset','slow','-threads',3,'-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata',-1]
 run('cadillac-escalade-v2-film.mp4',['-i',SOURCE,'-map','0:v:0','-map','0:a:0','-vf','scale=1080:1920',*common,'-crf',23,'-maxrate','2800k','-bufsize','5600k','-c:a','aac','-b:a','160k'])
 run('cadillac-escalade-v2-preview.mp4',['-ss',3,'-i',SOURCE,'-t',6,'-an','-vf','scale=360:640',*common,'-crf',25])
 run('cadillac-escalade-v3-poster.webp',['-ss',1,'-i',SOURCE,'-frames:v',1,'-vf','scale=720:1280','-c:v','libwebp','-quality',86])
 manifest={'primary':{'source':SOURCE,'sourceSeconds':13.59,'encodedSeconds':13.55,'previewStart':3,'previewSeconds':6,'posterTime':1,'filmAudio':True,'previewAudio':False},'second':{'source':'D:/Downloads/Cadillac.mp4','film':'cadillac-film.mp4','seconds':101.08},'files':[{'name':p.name,'bytes':p.stat().st_size} for p in [OUT/'cadillac-escalade-v2-film.mp4',OUT/'cadillac-escalade-v2-preview.mp4',OUT/'cadillac-escalade-v3-poster.webp']]}
 (ROOT/'tools/media/cadillac-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
if __name__=='__main__': main()
