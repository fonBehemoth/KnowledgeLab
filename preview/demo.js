import {renderExecutiveDashboard} from './executive-dashboard.js';
import {initInterfaceEnhancements} from './interface-enhancements.js';
initInterfaceEnhancements();
import {createPublicMailbox} from './public-mailbox.js';
import {createPublicUserCabinet} from './public-user-cabinet.js';
import {initDemoAdministration} from './demo-administration.js';
import {initWorkspaceChrome,disclosure} from './workspace-chrome.js?v=20261019-company1';
const $=s=>document.querySelector(s),app=window.deepAgentDemo;
const fixture=await fetch('./fixtures.json').then(r=>{if(!r.ok)throw Error('Не удалось загрузить демо');return r.json();});
app.applyOrganization(fixture.organization);
let profileStorage;try{profileStorage=window.localStorage;}catch{}
window.DeepAgentIdentityProvider=createPublicUserCabinet(fixture.organization,profileStorage);
window.DeepAgentMailboxProvider=createPublicMailbox(window.DeepAgentIdentityProvider,profileStorage);
let saved;try{saved=JSON.parse(localStorage.getItem('deepagent-public-review-v1'));}catch{}
app.restoreHistory(saved||fixture.history);
document.addEventListener('deepagent-history-changed',e=>{try{localStorage.setItem('deepagent-public-review-v1',JSON.stringify(e.detail));}catch{}});
function button(id,label,action){const b=document.createElement('button');b.id=id;b.className='secondary';b.textContent=label;b.onclick=action;return b;}
$('.header-right').append(button('core-history-button','Материалы и история',()=>$('#history-access').click()),button('analytics-access','Аналитика',()=>app.openAnalytics()));
const settings=document.createElement('dialog');settings.id='app-settings-dialog';settings.innerHTML='<div class="dialog-head"><h2>Настройки приложения</h2><button class="close-dialog" aria-label="Закрыть">×</button></div><details><summary>О версии</summary><p>Изменения структуры и настроек сохраняются в этом браузере. Применение прав доступа, учётные записи, доставка сообщений и обработка рабочих данных требуют приложения с сервером. Публичная страница не ограничивает доступ к своим данным. В кабинете показан вымышленный пользователь; изменения его профиля сохраняются только в этом браузере.</p></details><button class="secondary" id="reset-demo">Сбросить изменения</button>';
document.body.append(settings);settings.querySelector('.close-dialog').onclick=()=>settings.close();settings.querySelector('#reset-demo').onclick=()=>{localStorage.removeItem('deepagent-public-review-v1');window.DeepAgentIdentityProvider.reset();window.DeepAgentMailboxProvider.reset();location.reload();};
const navSettings=document.createElement('div');navSettings.className='nav-settings';navSettings.append(button('app-settings-button','Настройки приложения',()=>settings.showModal()));$('#navigation-panel').append(navSettings);
window.DeepAgentSearchProvider=async()=>[{kind:'Отчёты',title:'Продажи и операционные расходы',text:'Апрель — сентябрь 2026. Выручка, прибыль, денежные потоки, задолженность, запасы, налоги и персонал. Пример предприятия в Цюрихе, CHF.',detail:'Демонстрационный отчёт',open:()=>app.openAnalytics()}];
window.DeepAgentHistoryProvider={materials:async()=>[{id:'demo-sales',title:'Продажи и операционные расходы',text:'Демонстрационный управленческий отчёт за апрель — сентябрь 2026. Синтетический управленческий реестр предприятия в Цюрихе, CHF.',kind:'Пример отчёта',open:()=>app.openAnalytics()}],versions:async()=>[]};
initDemoAdministration(app,fixture.organization,settings);
initWorkspaceChrome();
function renderAnalytics(){const host=$('#analytics-host');if(!host)return;const company=app.organization().companies.find(c=>c.id===app.state().company_id);if(company)renderExecutiveDashboard(host,company);}
document.addEventListener('deepagent-section-rendered',renderAnalytics);
$('#ask-form').addEventListener('submit',e=>{e.preventDefault();const files=window.DeepAgentAttachments?.files()||[];let text=$('#question').value.trim();if(!text&&!files.length)return;if(files.length)text+=(text?'\n\n':'')+'Прикреплённые файлы: '+files.map(x=>x.name).join(', ')+'\nДемо: содержимое файлов не отправляется и не анализируется.';$('#question').value='';window.DeepAgentAttachments?.clear();if(app.state().chatMode==='team'){const data=structuredClone(app.historySnapshot()),id=app.state().company_id;data.teams[id]??={members:[],messages:[]};data.teams[id].messages.push({author:'Вы',text,at:new Date().toISOString()});app.restoreHistory(data);return;}app.appendCoreMessages([{author:'Вы',text},{author:'MINDI',text:'Это демонстрация интерфейса. Для примера: в поставке А расчёт 240 × 125 = 30 000 €, в отчёте — 36 000 €. Расхождение — 6 000 €. Этот ответ подготовлен заранее; введённый запрос не отправляется на сервер.'}]);});
app.refresh();
window.DeepAgentPublicBoot?.ready();
