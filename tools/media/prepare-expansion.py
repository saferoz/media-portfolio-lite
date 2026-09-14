"""Prepare approved portfolio media. Source files are never changed."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess, json
import imageio_ffmpeg
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/media'
FF=imageio_ffmpeg.get_ffmpeg_exe()
VIDEOS=[
('students',r'F:/Portfolio/Cinematography/Aviation 2.0/Get to Know Our Students EP1.mp4',79.12,False,8),
('captains',r'F:/Portfolio/Cinematography/Aviation 2.0/Meet Our Captains EP01 Challin with sub.mp4',120.79,False,10),
('hazardous',r'F:/OxfordSaudia 2021-2022/RENDERED FINAL VIDEO/5 Hazardous/(COMPRESSED) 5 Hazardous Attitudes VERY FINAL WITH ARABIC READY TO POST.mov',106.65,True,41),
('founding-day',r"F:/Hanif's Gabut/Ajdan's Saudi Founding Day/Rendered/Color Work Before After.mp4",11.65,True,1),
('diriyah',r'F:/Portfolio/Cinematography/General/Diriyah Colors.mp4',11.47,False,8),
('interview-grade',r'C:/Users/User/Documents/PreziPitch/Content/322969661/dgxxBvDHfB/Media/A53E8F59BE3A0237D989148BDFBFAF1C.mp4',12.55,False,1),
('spiderman',r'D:/Downloads/IMG_8769.MP4',46.70,True,17.5),
('graduation',r'F:/OxfordSaudia 2021-2022/RENDERED FINAL VIDEO/Graduation Trailer/updated with text.mov',68.99,False,8),
]
IMAGES=[
('students-bts',r'D:/OneDrive - OxfordSaudia/Desktop/DSC00650.jpg'),
('interview-before',r'D:/OneDrive - OxfordSaudia/Desktop/jawad/A7FEAE9E5107C63110707AA972E2C7C9.png'),
('interview-after',r'D:/OneDrive - OxfordSaudia/Desktop/jawad/1F13084224EE257A432768DB62FDDF77.png'),
('education-lighting',r'D:/OneDrive - OxfordSaudia/Desktop/DF198263E6F1E221FE10F906BA32CDBD.jpeg'),
('education-planning',r'C:/Users/User/AppData/Local/Temp/codex-clipboard-CJXV5z.png'),
('education-simulator',r'C:/Users/User/Documents/PreziPitch/Content/322969661/4tKzSkohhV/Media/444383AF3CA27BA0F0BEF6CC8229DFAF.png'),
('education-filming',r'C:/Users/User/Documents/PreziPitch/Content/322969661/4tKzSkohhV/Media/65B816E941DE1FB8D1E86A981F4CD1AA.png'),
('graduation-bts',r'E:/2026 - 07 - Turkey Fam Trip/Edited/DSC05501.jpg'),
('graduation-camera',r'C:/Users/User/AppData/Local/Temp/codex-clipboard-n05zL7.png'),
]
def run(name,args):
 subprocess.run([FF,'-hide_banner','-loglevel','error','-y',*args,str(OUT/name)],check=True)
 print(name,(OUT/name).stat().st_size,flush=True)
def video(item):
 name,src,duration,portrait,start=item
 size='1080:1920' if portrait else '1920:1080'
 small='360:640' if portrait else '640:360'
 poster='720:1280' if portrait else '1280:720'
 # Convert full-range HEVC to limited-range BT.709 explicitly.
 vf='scale='+size+(':in_range=full:out_range=tv' if name=='spiderman' else '')
 run(name+'-film.mp4',['-i',src,'-map','0:v:0','-map','0:a:0?','-vf',vf,'-c:v','libx264','-crf','18' if name in ['founding-day','diriyah','interview-grade'] else '21','-maxrate','5M','-bufsize','10M','-preset','fast','-threads','3','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','160k','-movflags','+faststart','-map_metadata','-1'])
 run(name+'-preview.mp4',['-ss',str(75 if name=='hazardous' else start),'-i',str(OUT/(name+'-film.mp4')),'-t',str(min(6,duration-start)),'-an','-vf','scale='+small,'-c:v','libx264','-crf','25','-preset','fast','-threads','2','-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata','-1'])
 run(('hazardous-v2' if name=='hazardous' else name)+'-poster.webp',['-ss',str(start),'-i',str(OUT/(name+'-film.mp4')),'-frames:v','1','-vf','scale='+poster,'-c:v','libwebp','-quality','86'])
if __name__=='__main__':
 OUT.mkdir(exist_ok=True)
 for name,src in IMAGES:
  with Image.open(src) as original:
   im=ImageOps.exif_transpose(original).convert('RGB'); im.thumbnail((1920,2200),Image.Resampling.LANCZOS); im.save(OUT/(name+'.webp'),'WEBP',quality=92,method=6)
 with ThreadPoolExecutor(max_workers=2) as pool: list(pool.map(video,VIDEOS))
 manifest={'videos':[{'id':n,'source':s,'duration':d,'portrait':p} for n,s,d,p,_ in VIDEOS],'images':[{'id':n,'source':s} for n,s in IMAGES],'files':[{'name':p.name,'bytes':p.stat().st_size} for p in OUT.iterdir() if any(p.name.startswith(n+'-') or p.name==n+'.webp' for n in [v[0] for v in VIDEOS]+[v[0] for v in IMAGES])]}
 (ROOT/'tools/media/expansion-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
