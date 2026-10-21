import {renderUserCabinet} from './user-cabinet-view.js';
import {el,button} from './company-ui.js';
import {translate as t} from './i18n.js';
// The signed-in account is independent of the employee selected in the workspace.
export function initCurrentUser(app,icon,directory){
 const toggle=button('Мой профиль',()=>drawer.hidden?open():close());toggle.id='current-user-button';toggle.setAttribute('aria-label',t('Мой профиль'));toggle.setAttribute('aria-controls','current-user-drawer');toggle.title=t('Мой профиль');
 const face=icon('people');face.querySelector('path').setAttribute('d','M20 21v-2a7 7 0 0 0-14 0v2M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8');toggle.replaceChildren(face);document.querySelector('main>.composer').append(toggle);
 const drawer=el('aside',null,'people-drawer current-user-drawer');drawer.id='current-user-drawer';drawer.hidden=true;drawer.setAttribute('aria-label',t('Мой профиль'));document.body.append(drawer);let returnFocus=null,epoch=0;
 function close(){epoch++;drawer.hidden=true;toggle.setAttribute('aria-expanded','false');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
 function open(){const opened=++epoch;returnFocus=document.activeElement;directory.close();window.DeepAgentObjects?.close?.();drawer.replaceChildren();const header=el('div',null,'people-drawer-head'),quit=button('×',close);quit.setAttribute('aria-label',t('Закрыть профиль'));header.append(el('h2',t('Мой профиль')),quit);drawer.append(header);
  renderUserCabinet(drawer,()=>opened===epoch&&!drawer.hidden);drawer.hidden=false;toggle.setAttribute('aria-expanded','true');quit.focus({preventScroll:true});
 }
 document.addEventListener('deepagent-directory-open',()=>{if(!drawer.hidden)close();});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!drawer.hidden)close();});
 return {close};
}
