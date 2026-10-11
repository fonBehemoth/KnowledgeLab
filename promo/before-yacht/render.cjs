const fs=require('fs'),cp=require('child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir=__dirname;const {pathToFileURL}=require('url');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1920,height:1080}});let errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(dir+'/index.html').href);await page.evaluate(async()=>{window.captureMode=true;await document.fonts.ready});
 const samples=[['audit',18],['automation',29],['plan',43],['target',51],['agent',64],['result',73],['infrastructure',81]];
 for(const [name,t] of samples){await page.evaluate(t=>window.renderFrame(t),t);await page.screenshot({path:dir+'/'+name+'.png'});}
 const clips=await page.evaluate(()=>[...document.querySelectorAll('text')].filter(n=>{const b=n.getBBox();return b.x<0||b.x+b.width>1818}).map(n=>n.textContent));
 console.log(JSON.stringify({errors,clips}));if(errors.length||clips.length)throw Error('Preview validation failed');
 if(process.argv.includes('--preview')){await browser.close();return;}
 const ff=process.env.FFMPEG_PATH||'ffmpeg';
 const child=cp.spawn(ff,['-y','-hide_banner','-loglevel','error','-f','image2pipe','-vcodec','mjpeg','-r','24','-i','pipe:0','-an','-c:v','libopenh264','-b:v','8500k','-pix_fmt','yuv420p','-movflags','+faststart',dir+'/centrifuga-before-yacht-render.mp4'],{stdio:['pipe','ignore','pipe']});
 let stderr='';child.stderr.on('data',b=>stderr+=b);const done=new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',c=>c===0?resolve():reject(Error(stderr)));});
 for(let i=0;i<85*24;i++){await page.evaluate(t=>window.renderFrame(t),i/24);const b=await page.screenshot({type:'jpeg',quality:95});if(!child.stdin.write(b))await new Promise(r=>child.stdin.once('drain',r));if(i%120===0)console.log('Rendered '+i/24+' / 85 seconds');}
 child.stdin.end();await done;await browser.close();console.log('COMPLETE: 85 seconds, 1920x1080, 24 fps, silent');
})().catch(e=>{console.error(e);process.exit(1)});
