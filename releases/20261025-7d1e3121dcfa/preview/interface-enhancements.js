import {initCompanyIdentity} from './company-identity.js';
export function initInterfaceEnhancements(){
 initCompanyIdentity();
 function mark(){for(const b of document.querySelectorAll('button')){const text=(b.getAttribute('aria-label')||b.textContent).trim();if(/^(Закрыть|Close|Zavřít|Закрити)(\s|$)|^[×✕]$/.test(text))b.classList.add('close-control');}}
 let queued=false;new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;mark();});}}).observe(document.body,{subtree:true,childList:true});mark();
 document.addEventListener('click',e=>{const input=e.target.closest('input[type="date"],input[type="datetime-local"]');if(input&&!input.disabled&&!input.readOnly&&input.showPicker)try{input.showPicker();}catch{/* Native keyboard entry remains available where the picker is restricted. */}});
}
