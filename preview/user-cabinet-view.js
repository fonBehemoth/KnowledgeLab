import {el,button} from './company-ui.js';
import {photoEditor} from './profile-photo.js';
const roles={owner:'Владелец',observer:'Наблюдатель',employee:'Сотрудник',manager:'Руководитель',structure_admin:'Администратор структуры'};
function field(form,label,value='',type='text'){
 const wrap=el('label',label),control=el(type==='textarea'?'textarea':'input');if(type!=='textarea')control.type=type;control.value=value;control.setAttribute('aria-label',label);wrap.append(control);form.append(wrap);return control;
}
// This view only edits the authenticated account. Workspace selection is never an identity.
export async function renderUserCabinet(drawer,isCurrent){
 const provider=window.DeepAgentIdentityProvider,body=el('div',null,'user-cabinet');drawer.append(body);
 if(!provider?.current?.()){body.append(el('p',provider?'Войдите в учётную запись через настройки приложения.':'Для входа в личный кабинет откройте приложение.'),button('Настройки приложения',()=>document.querySelector('#app-settings-button')?.click()));return;}
 body.append(el('p','Загрузка профиля…'));
 try{
  let profile=await provider.profile();if(!isCurrent())return;body.replaceChildren();
  const account=el('p',profile.account.login+' · '+(roles[profile.account.role]||profile.account.role));body.append(account);
  const form=el('form');body.append(form);const photo=photoEditor(form,profile.photo_data),name=field(form,'ФИО',profile.name),email=field(form,'Рабочая почта',profile.email,'email'),about=field(form,'О себе',profile.about,'textarea');name.required=true;name.maxLength=160;email.maxLength=254;about.maxLength=2000;
  const save=el('button','Сохранить профиль');save.type='submit';const result=el('p');result.setAttribute('role','status');form.append(save,result);
  form.onsubmit=async event=>{event.preventDefault();save.disabled=true;result.textContent='';try{profile=await provider.saveProfile({revision:profile.revision,name:name.value,email:email.value,about:about.value,photo_data:photo()});result.textContent=profile.refresh_warning||'Профиль сохранён.';}catch(error){result.textContent=error.message;}finally{save.disabled=false;}};
  if(profile.employee){const card=el('section');card.append(el('h3','Работа'));for(const [key,label] of [['company','Компания'],['department','Подразделение'],['position','Должность'],['manager','Руководитель'],['work_schedule','Время работы'],['duties','Обязанности']])if(profile.employee[key])card.append(el('p',label+': '+profile.employee[key]));body.append(card);}
  const security=el('details'),summary=el('summary','Сменить пароль'),passwordForm=el('form');security.append(summary,passwordForm);body.append(security);
  const old=field(passwordForm,'Текущий пароль','','password'),next=field(passwordForm,'Новый пароль','','password'),confirm=field(passwordForm,'Повторите новый пароль','','password');for(const input of [old,next,confirm]){input.required=true;input.maxLength=256;}old.autocomplete='current-password';next.autocomplete=confirm.autocomplete='new-password';next.minLength=12;
  const change=el('button','Сохранить пароль');change.type='submit';const notice=el('p');notice.setAttribute('role','status');passwordForm.append(change,notice);
  passwordForm.onsubmit=async event=>{event.preventDefault();change.disabled=true;notice.textContent='';try{if(next.value!==confirm.value)throw Error('Пароли не совпадают.');await provider.changePassword(old.value,next.value);passwordForm.reset();notice.textContent='Пароль изменён. Другие сеансы завершены.';}catch(error){notice.textContent=error.message;}finally{change.disabled=false;}};
  body.append(button('Выйти из учётной записи',()=>provider.logout()));
 }catch(error){if(isCurrent())body.replaceChildren(el('p',error.message),button('Повторить',()=>{body.remove();renderUserCabinet(drawer,isCurrent);}));}
}
