import {el,button} from './company-ui.js';
import {translate as t} from './i18n.js';
// The signed-in account is independent of the employee selected in the workspace.
export function initCurrentUser(app,icon,directory){
 const toggle=button('Мой профиль',()=>drawer.hidden?open():close());toggle.id='current-user-button';toggle.setAttribute('aria-label',t('Мой профиль'));toggle.setAttribute('aria-controls','current-user-drawer');toggle.title=t('Мой профиль');
 const face=icon('people');face.querySelector('path').setAttribute('d','M20 21v-2a7 7 0 0 0-14 0v2M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8');toggle.replaceChildren(face);document.querySelector('main>.composer').append(toggle);
 const drawer=el('aside',null,'people-drawer current-user-drawer');drawer.id='current-user-drawer';drawer.hidden=true;drawer.setAttribute('aria-label',t('Мой профиль'));document.body.append(drawer);let returnFocus=null;
 function close(){drawer.hidden=true;toggle.setAttribute('aria-expanded','false');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
 function open(){returnFocus=document.activeElement;directory.close();window.DeepAgentObjects?.close?.();drawer.replaceChildren();const header=el('div',null,'people-drawer-head'),quit=button('×',close);quit.setAttribute('aria-label',t('Закрыть профиль'));header.append(el('h2',t('Мой профиль')),quit);drawer.append(header);
  const account=window.DeepAgentIdentityProvider?.current?.();const name=el('h3',account?.name||t('Личный режим'));name.dataset.authored=String(!!account);drawer.append(name);
  if(account){const roles={owner:'Владелец',observer:'Наблюдатель',employee:'Сотрудник',manager:'Руководитель',structure_admin:'Администратор структуры'};drawer.append(el('p',account.login),el('p',t(roles[account.role]||account.role)));}
  else drawer.append(el('p',t('Учётная запись не выбрана. Управление входом доступно в настройках приложения.')));
  drawer.append(button('Настройки приложения',()=>{close();document.querySelector('#app-settings-button').click();}));drawer.hidden=false;toggle.setAttribute('aria-expanded','true');quit.focus({preventScroll:true});
 }
 document.addEventListener('deepagent-directory-open',()=>{if(!drawer.hidden)close();});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!drawer.hidden)close();});
 return {close};
}
