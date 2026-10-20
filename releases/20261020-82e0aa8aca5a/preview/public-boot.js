// Local diagnostics only: no requests or telemetry.
(() => {
 let ready=false,failed=false;
 const release=document.querySelector('meta[name="demo-release"]')?.content||'';
 function show(message){
  if(!document.body){document.addEventListener('DOMContentLoaded',()=>show(message),{once:true});return;}
  let box=document.getElementById('demo-load-status');
  if(!box){
   box=document.createElement('div');box.id='demo-load-status';box.setAttribute('role','alert');
   box.style.cssText='position:fixed;inset:12px 12px auto auto;max-width:430px;padding:16px;z-index:100000;background:#fff;color:#303842;box-shadow:0 4px 24px #0003;border-radius:12px;font:16px Arial,sans-serif';
   const label=document.createElement('p');label.className='load-message';box.append(label);
   const button=document.createElement('button');button.textContent='Перезагрузить демо';button.onclick=()=>location.reload();box.append(button);
   const version=document.createElement('small');version.textContent=' Выпуск '+release;box.append(version);document.body.append(box);
  }
  box.querySelector('.load-message').textContent=message;
 }
 function error(){failed=true;show('Не удалось загрузить или открыть раздел демо. Перезагрузите страницу. Если ошибка повторится, сообщите номер выпуска.');}
 window.addEventListener('error',error,true);
 window.addEventListener('unhandledrejection',error);
 const timeout=setTimeout(()=>{if(!ready)error();},15000);
 window.DeepAgentPublicBoot={ready(){ready=true;clearTimeout(timeout);if(!failed)document.getElementById('demo-load-status')?.remove();if(window.parent!==window)window.parent.postMessage({type:'deepagent-ready',release},location.origin);const settings=document.querySelector('#reset-demo')?.closest('dialog');if(settings&&!settings.querySelector('#public-release')){const label=document.createElement('p');label.id='public-release';label.textContent='Версия интерфейса: '+release;settings.append(label);}}};
})();
