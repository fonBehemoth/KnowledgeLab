import {bindWorkEmail,normalizeWorkEmail} from './email-addresses.js';
import {el,button} from './company-ui.js';
import {photoEditor} from './profile-photo.js';
import {avatarFace} from './person-avatar.js';
const roles={owner:'Владелец',observer:'Наблюдатель',employee:'Сотрудник',manager:'Руководитель',structure_admin:'Администратор структуры'};
function field(form,label,value='',type='text'){
 const wrap=el('label',label),control=el(type==='textarea'?'textarea':'input');
 if(type!=='textarea')control.type=type;
 control.value=value;control.setAttribute('aria-label',label);wrap.append(control);form.append(wrap);return control;
}
function workDetails(profile){
 const card=el('section',null,'profile-work'),details=el('dl');card.append(el('h3','Работа'),details);
 for(const [key,label] of [['company','Компания'],['department','Подразделение'],['position','Должность'],['manager','Руководитель'],['work_schedule','Время работы'],['duties','Обязанности']]){
  if(profile.employee?.[key])details.append(el('dt',label),el('dd',profile.employee[key]));
 }
 return card;
}
function appendSecurity(body,provider){
 if(typeof provider.changePassword!=='function')return;
 const security=el('details'),summary=el('summary','Сменить пароль'),form=el('form');security.append(summary,form);body.append(security);
 const old=field(form,'Текущий пароль','','password'),next=field(form,'Новый пароль','','password'),confirm=field(form,'Повторите новый пароль','','password');
 for(const input of [old,next,confirm]){input.required=true;input.maxLength=256;}
 old.autocomplete='current-password';next.autocomplete=confirm.autocomplete='new-password';next.minLength=12;
 const save=el('button','Сохранить пароль');save.type='submit';const notice=el('p');notice.setAttribute('role','status');form.append(save,notice);
 form.onsubmit=async event=>{event.preventDefault();save.disabled=true;notice.textContent='';try{
  if(next.value!==confirm.value)throw Error('Пароли не совпадают.');
  await provider.changePassword(old.value,next.value);form.reset();notice.textContent='Пароль изменён. Другие сеансы завершены.';
 }catch(error){notice.textContent=error.message;}finally{save.disabled=false;}};
}
// Saved profile and editing are separate views. Workspace selection is never an identity.
export async function renderUserCabinet(drawer,isCurrent){
 const provider=window.DeepAgentIdentityProvider,body=el('div',null,'user-cabinet');drawer.append(body);
 if(!provider?.current?.()){
  body.append(el('p',provider?'Войдите в учётную запись через настройки приложения.':'Для входа в личный кабинет откройте приложение.'),button('Настройки приложения',()=>document.querySelector('#app-settings-button')?.click()));return;
 }
 body.append(el('p','Загрузка профиля…'));
 try{
  let profile=await provider.profile();if(!isCurrent())return;
  function showProfile(message='',focus=false){
   body.replaceChildren();body.dataset.mode='view';
   const hero=el('section',null,'profile-summary'),identity=el('div');
   identity.append(el('h3',profile.name));if(profile.employee?.position)identity.append(el('p',profile.employee.position));
   hero.append(avatarFace({name:profile.name,kind:'human',photo_data:profile.photo_data}),identity);body.append(hero);
   body.append(el('p',profile.account.login+' · '+(roles[profile.account.role]||profile.account.role),'profile-account'));
   const edit=button('Редактировать профиль',editProfile);edit.className='profile-edit-action';body.append(edit);
   if(message){const status=el('p',message);status.setAttribute('role','status');body.append(status);}
   if(profile.email){
    const contact=el('section',null,'profile-contact'),address=el('a',profile.email);address.href='mailto:'+encodeURIComponent(profile.email).replace(/%40/gi,'@');address.title='Написать письмо';address.setAttribute('aria-label','Написать письмо: '+profile.email);contact.append(el('h3','Рабочая почта'),address);body.append(contact);
   }
   if(profile.about){const about=el('section',null,'profile-about');about.append(el('h3','О себе'),el('p',profile.about));body.append(about);}
   if(profile.employee)body.append(workDetails(profile));
   appendSecurity(body,provider);
   if(typeof provider.logout==='function')body.append(button('Выйти из учётной записи',()=>provider.logout()));
   body.scrollTop=0;if(focus)edit.focus({preventScroll:true});
  }
  function editProfile(){
   body.replaceChildren();body.dataset.mode='edit';body.append(el('h3','Редактирование профиля'));
   const form=el('form');body.append(form);
   const photo=photoEditor(form,profile.photo_data),name=field(form,'ФИО',profile.name),email=bindWorkEmail(field(form,'Рабочая почта',profile.email,'email')),about=field(form,'О себе',profile.about,'textarea');
   name.required=true;name.maxLength=160;about.maxLength=2000;
   const actions=el('div',null,'profile-form-actions'),save=el('button','Сохранить профиль'),cancel=button('Отмена',()=>showProfile('',true));save.type='submit';actions.append(save,cancel);
   const error=el('p');error.setAttribute('role','alert');form.append(actions,error);
   form.onsubmit=async event=>{
    event.preventDefault();error.textContent='';
    try{
     const payload={revision:profile.revision,name:name.value,email:normalizeWorkEmail(email.value),about:about.value,photo_data:photo()};
     for(const control of form.querySelectorAll('input,textarea,button'))control.disabled=true;
     const saved=await provider.saveProfile(payload);profile=saved;
     if(isCurrent())showProfile(saved.refresh_warning||saved.save_message||'Профиль сохранён.',true);
    }catch(problem){if(isCurrent())error.textContent=problem.message;}
    finally{for(const control of form.querySelectorAll('input,textarea,button'))control.disabled=false;}
   };
   body.scrollTop=0;name.focus({preventScroll:true});
  }
  showProfile();
 }catch(error){
  if(isCurrent())body.replaceChildren(el('p',error.message),error.status===401?button('Войти снова',()=>location.reload()):button('Повторить',()=>{body.remove();renderUserCabinet(drawer,isCurrent);}));
 }
}
