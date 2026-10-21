import {translate as t} from './i18n.js';
export function initEmployeeContact(app){
 const form=document.querySelector('#ask-form'),input=document.querySelector('#question'),send=form.querySelector('.send');
 const update=()=>{const direct=app.state().conversation_kind==='employee';send.setAttribute('aria-label',t(direct?'Сохранить сообщение':'Отправить сообщение'));if(direct){input.placeholder=t('Сообщение сотруднику…');input.setAttribute('aria-label',t('Сообщение сотруднику'));}};
 form.addEventListener('submit',async event=>{
  if(app.state().conversation_kind!=='employee')return;
  event.preventDefault();event.stopImmediatePropagation();
  if(window.DeepAgentAttachments?.files().length){window.DeepAgentAttachments.status(t('Вложения в переписку с сотрудником пока не поддерживаются.'));return;}
  const text=input.value.trim(),original=input.value,context=app.state().conversation_id;if(!text)return;send.disabled=true;
  try{await window.DeepAgentPersistence?.flush();if(app.state().conversation_id!==context)throw Error(t('Открыта другая переписка. Сообщение не добавлено.'));if(!app.saveEmployeeMessage(text))return;if(input.value===original)input.value='';await window.DeepAgentPersistence?.flush();window.DeepAgentAttachments?.status(t('Сообщение сохранено в переписке. Доставка сотруднику ещё не подключена.'));}
  catch(error){window.DeepAgentAttachments?.status(error.message);}
  finally{send.disabled=!input.value.trim();}
 },true);
 document.addEventListener('deepagent-history-changed',update);document.addEventListener('deepagent-section-rendered',update);update();
}
