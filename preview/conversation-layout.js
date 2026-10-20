import {translate} from './i18n.js';
import {initGlobalSearch} from './global-search.js';
import {initChatNavigation} from './chat-navigation.js';
import {initHistoryWorkspace} from './history-workspace.js';

const paths={company:'M3 21V5l9-3 9 3v16M8 8h1m6 0h1M8 12h1m6 0h1M9 21v-5h6v5',department:'M12 3v5M5 21v-5h14v5M5 16v-5h14v5M12 11V8',projects:'M3 7h7l2-3h8v16H3Z',people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8m6 10v-2a4 4 0 0 0-3-3M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',reports:'M5 3h10l4 4v14H5ZM14 3v5h5M8 12h8m-8 4h8',chat:'M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 1 1 17-5Z',analytics:'M4 20V4m0 16h17M8 16v-5m5 5V7m5 9v-9',library:'M4 3h4v18H4ZM12 3h4v18h-4m7-16 3 15',graph:'M10 5h4m-8 4 4 9m8-9-4 9M9 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-6 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0',history:'M3 11a9 9 0 1 1 3 8M3 4v7h7m2-5v6l4 2',assistant:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Zm6 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0',plus:'M12 4v16M4 12h16',menu:'M4 6h16M4 12h16M4 18h16',close:'m6 6 12 12M6 18 18 6',sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2m-1 5a6 6 0 1 1-12 0 6 6 0 0 1 12 0',moon:'M21 14a9 9 0 0 1-11-11 9 9 0 1 0 11 11'};
Object.assign(paths,{left:'m14 6-6 6 6 6',right:'m10 6 6 6-6 6',down:'m6 9 6 6 6-6',arrowRight:'M4 12h16m-6-6 6 6-6 6',arrowUp:'M12 20V4m-6 6 6-6 6 6',arrowDown:'M12 4v16m-6-6 6 6 6-6',microphone:'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0Zm-3 6v1a6 6 0 0 0 12 0v-1m-6 7v4m-4 0h8',video:'M3 6h12v12H3Zm12 4 6-4v12l-6-4M7 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4'});
function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('nav-icon');const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',paths[name]||paths.reports);svg.append(p);return svg;}
function refreshArrowIcons(){
 for(const [selector,name] of [['#previous-company','left'],['#next-company','right'],['.send','arrowUp'],['#jump-latest','arrowDown']]){const target=document.querySelector(selector);if(target&&!target.querySelector('svg'))target.replaceChildren(icon(name));}
 for(const selector of ['#content [data-department]','#content [data-section]','#base-values','#activity-action','#company-left','#company-right'])for(const target of document.querySelectorAll(selector)){
  for(const node of [...target.childNodes])if(node.nodeType===Node.TEXT_NODE&&/[→↑↓‹›]/.test(node.textContent)){
   const text=node.textContent,name=/↑/.test(text)?'arrowUp':/↓/.test(text)?'arrowDown':/‹/.test(text)?'left':/›/.test(text)?'right':'arrowRight',arrow=icon(name);arrow.classList.add('action-arrow');
   node.textContent=text.replace(/[→↑↓‹›]/g,'').trim();if(/^[\s‹]/.test(text)&&name==='left')target.prepend(arrow);else target.append(arrow);
  }
 }
 for(const summary of document.querySelectorAll('.workspace-disclosure>summary'))if(!summary.querySelector('.summary-chevron')){const arrow=icon('down');arrow.classList.add('summary-chevron');summary.append(arrow);}
}
function mark(el,name){if(el&&!el.querySelector(':scope>.nav-icon'))el.prepend(icon(name));}
function labeledButton(id,text,name,fn){const b=document.createElement('button');b.type='button';b.id=id;b.append(icon(name),document.createTextNode(translate(text)));b.onclick=fn;return b;}

export function initConversationLayout(){
 if(document.body.classList.contains('conversation-layout'))return;
 document.body.classList.add('conversation-layout');
 const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=new URL('./conversation-layout.css?v=20261019-company1',import.meta.url);document.head.append(sheet);
 const side=document.querySelector('#navigation-panel'),toggle=document.querySelector('#menu-toggle'),brand=document.querySelector('.brand-lockup');
 const heading=document.createElement('div');heading.className='nav-heading';toggle.replaceChildren(icon('close'));toggle.setAttribute('aria-label',translate('Скрыть навигацию'));heading.append(brand,toggle);
 const scroll=document.createElement('div');scroll.className='nav-scroll';scroll.append(...side.childNodes);side.append(heading,scroll);
 const reopen=labeledButton('reopen-navigation','Показать навигацию','menu',()=>toggle.click());document.body.append(reopen);
 const context=document.querySelector('.workspace-toolbar');if(context){const mobile=context.querySelector('.mobile-activity');if(mobile)mobile.hidden=true;context.hidden=true;scroll.prepend(context);}
 // Reuse the carousel's original controls and gesture handlers in one visible row.
 const oldCompany=document.querySelector('#company-disclosure'),companies=document.querySelector('#companies');
 if(oldCompany&&companies){const compact=document.createElement('section');compact.id='company-switcher';compact.setAttribute('aria-label',translate('Компания'));const firm=companies.querySelector('.firm'),caption=document.createElement('small');caption.className='company-caption';caption.textContent=translate('Компания');firm.prepend(icon('company'),caption);document.querySelector('#company-field').hidden=true;oldCompany.before(compact);compact.append(companies);oldCompany.hidden=true;}
 const sections=scroll.querySelector('.main-tabs'),analytic=document.querySelector('#analytics-access');
 if(analytic){sections.querySelector('[data-section="Аналитика"]')?.remove();analytic.onclick=null;analytic.dataset.section='Аналитика';sections.append(analytic);}
 const library=document.createElement('nav');library.className='nav-library';library.setAttribute('aria-label',translate('Материалы и история'));
 const historyLink=document.getElementById('history-access');historyLink.replaceChildren(document.createTextNode(translate('История')));historyLink.title=translate('История');historyLink.dataset.section='История';historyLink.onclick=null;library.setAttribute('aria-label',translate('История'));library.append(historyLink);
 for(const id of ['core-history-button','core-graph-button']){const item=document.getElementById(id);if(item){item.hidden=true;library.append(item);}}
 scroll.append(library);document.querySelector('#workspace-resources')?.remove();
 const recent=document.createElement('nav');recent.className='nav-recent';recent.setAttribute('aria-label',translate('Последние чаты'));scroll.append(recent);
 const dialogue=document.createElement('nav');dialogue.className='nav-dialogue';dialogue.setAttribute('aria-label',translate('Диалог'));
 for(const id of ['assistant-mode','team-mode','participants-button','base-values']){const item=document.getElementById(id);if(item)dialogue.append(item);}
 const sectionChoice=scroll.querySelector('.section-choice');sectionChoice.before(dialogue);document.querySelector('.chat-controls')?.remove();
 // Keep navigation stable. Context selection belongs to the working pane.
 const flow=document.querySelector('#conversation-flow'),choices=document.createElement('section');
 choices.id='workspace-choices';choices.setAttribute('aria-label',translate('Выбор в рабочем разделе'));flow.prepend(choices);
 const departmentSelect=document.querySelector('#department-select'),departmentStep=departmentSelect.closest('.step');
 departmentStep.hidden=true;choices.append(departmentStep);
 const departmentChoices=document.createElement('nav');departmentChoices.id='workspace-departments';departmentChoices.setAttribute('aria-label',translate('Подразделения'));choices.append(departmentChoices);
 const departmentButton=document.createElement('button');departmentButton.type='button';departmentButton.id='department-trigger';departmentButton.setAttribute('aria-controls','department-options');
 const departmentCaption=document.createElement('strong'),departmentValue=document.createElement('span');departmentCaption.textContent=translate('Подразделение');departmentButton.append(icon('department'),departmentCaption,departmentValue,icon('down'));
 const departmentOptions=document.createElement('div');departmentOptions.id='department-options';departmentOptions.hidden=true;departmentChoices.append(departmentButton,departmentOptions);
 let departmentOpen=false,lastDepartmentCompany=null,lastDepartment=null;
 const toggleDepartments=()=>{departmentOptions.hidden=!departmentOpen;departmentButton.setAttribute('aria-expanded',String(departmentOpen));};
 departmentButton.onclick=()=>{departmentOpen=!departmentOpen;toggleDepartments();};departmentOptions.addEventListener('click',event=>{if(event.target.closest('[data-department]')){departmentOpen=false;toggleDepartments();departmentButton.focus({preventScroll:true});}});
 document.addEventListener('click',event=>{if(departmentOpen&&!departmentChoices.contains(event.target)){departmentOpen=false;toggleDepartments();}});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&departmentOpen){departmentOpen=false;toggleDepartments();departmentButton.focus({preventScroll:true});}});
 const personnel=document.querySelector('#person-controls'),subnav=document.querySelector('#subnav');choices.append(personnel,subnav);
 const refreshChoices=()=>{
  const state=window.deepAgentDemo.state();document.body.dataset.workspaceSection=state.section||'';
  departmentChoices.hidden=!state.company_id;
  if(state.company_id!==lastDepartmentCompany||state.department!==lastDepartment){departmentOpen=false;lastDepartmentCompany=state.company_id;lastDepartment=state.department;}
  departmentCaption.textContent=translate('Подразделение');departmentValue.textContent=state.department?departmentSelect.selectedOptions[0]?.textContent||state.department:translate('Выбрать');departmentValue.dataset.authored=state.department&&state.department!=='Все отделы'?'true':'false';departmentButton.classList.toggle('has-value',!!state.department);
  departmentOptions.replaceChildren();for(const option of departmentSelect.options){if(!option.value)continue;const b=document.createElement('button');b.type='button';b.dataset.department=option.value;b.textContent=option.textContent;b.classList.toggle('active',state.department===option.value);b.setAttribute('aria-pressed',String(state.department===option.value));departmentOptions.append(b);}
  toggleDepartments();choices.hidden=departmentChoices.hidden&&personnel.hidden&&!subnav.childElementCount;
 };
 document.addEventListener('deepagent-section-rendered',refreshChoices);document.addEventListener('deepagent-language-change',refreshChoices);refreshChoices();
 side.addEventListener('click',event=>{if(innerWidth<=900&&event.target.closest('[data-section],#history-access,#core-history-button,.nav-recent button')&&!document.body.classList.contains('nav-closed'))toggle.click();});
 const activity=document.getElementById('activity-button');if(activity)scroll.append(activity);
 const footer=document.createElement('div');footer.className='nav-footer';const settings=side.querySelector('.nav-settings');if(settings)footer.append(settings);
 const themeSelect=document.querySelector('#theme-select');if(themeSelect){themeSelect.replaceChildren();for(const [value,label] of [['light','Светлая тема'],['dark','Тёмная тема']]){const option=document.createElement('option');option.value=value;option.textContent=translate(label);themeSelect.append(option);}themeSelect.onchange=()=>setMode(themeSelect.value);}
 let mode='light';try{mode=localStorage.getItem('deepagent-conversation-mode')||mode;}catch{}
 function setMode(next){mode=next==='dark'?'dark':'light';document.body.dataset.conversationMode=mode;if(themeSelect)themeSelect.value=mode;try{localStorage.setItem('deepagent-conversation-mode',mode);}catch{}}
 side.append(footer);setMode(mode);
 document.querySelector('body>header').hidden=true;
 const appearance=document.querySelector('.appearance-settings');if(appearance){appearance.open=true;const target=document.querySelector('#app-settings-button');const original=target?.onclick;if(target)target.onclick=e=>{original?.(e);const dialog=[...document.querySelectorAll('dialog')].find(d=>d.open);if(dialog&&!dialog.querySelector('#theme-select'))dialog.append(appearance);};}
 document.querySelector('.app-footer').hidden=true;
 const labels={'Проекты':'projects','Персонал':'people','Отчёты':'reports','Чаты':'chat','Аналитика':'analytics','История':'history'};
 const decorate=()=>{for(const item of side.querySelectorAll('[data-section]'))mark(item,labels[item.dataset.section]);for(const [id,name] of Object.entries({'history-access':'history','core-history-button':'library','core-graph-button':'graph','app-settings-button':'settings','assistant-mode':'assistant','team-mode':'chat','participants-button':'people','base-values':'reports','activity-button':'history'}))mark(document.getElementById(id),name);mark(document.querySelector('#company-disclosure>summary'),'company');for(const item of side.querySelectorAll('#subnav>button'))mark(item,'reports');};
 initChatNavigation(recent,icon);initHistoryWorkspace();
 document.addEventListener('deepagent-section-rendered',()=>{decorate();refreshArrowIcons();});document.addEventListener('deepagent-language-change',()=>{decorate();setMode(mode);refreshArrowIcons();});decorate();refreshArrowIcons();
 let arrowRefreshPending=false;new MutationObserver(()=>{if(arrowRefreshPending)return;arrowRefreshPending=true;requestAnimationFrame(()=>{arrowRefreshPending=false;refreshArrowIcons();});}).observe(document.querySelector('#content'),{childList:true,subtree:true});
 initAttachments();
 paths.search='m21 21-6-6M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0';initGlobalSearch(icon);
 const composer=document.querySelector('#ask-form'),send=composer.querySelector('.send');
 for(const [id,label,name] of [['voice-input','Голосовое общение · планируется','microphone'],['video-record','Видеозапись · планируется','video']]){
  const control=labeledButton(id,label,name,()=>window.DeepAgentAttachments.status(translate(label)));control.className='planned-composer-control';control.setAttribute('aria-label',translate(label));control.setAttribute('aria-disabled','true');control.title=translate(label);control.replaceChildren(icon(name));composer.insertBefore(control,send);
 }
 const question=document.querySelector('#question');if(!question.onkeydown)question.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(!document.querySelector('.send').disabled)document.querySelector('#ask-form').requestSubmit();}};
 window.deepAgentDemo.refresh();
}

function initAttachments(){
 const form=document.querySelector('#ask-form'),input=document.createElement('input');input.type='file';input.multiple=true;input.hidden=true;input.id='chat-file-input';input.setAttribute('aria-label',translate('Добавить файлы'));
 const list=document.createElement('div');list.id='chat-attachments';list.setAttribute('aria-live','polite');form.before(list);
 const status=document.createElement('p');status.id='attachment-status';status.className='hint';status.setAttribute('role','status');status.hidden=true;form.before(status);
 let files=[],busy=false;
 const add=labeledButton('attach-file','Добавить файлы','plus',()=>input.click());add.title=translate('Добавить файлы');add.setAttribute('aria-label',translate('Добавить файлы'));add.replaceChildren(icon('plus'));form.prepend(add,input);
 function render(){list.replaceChildren();for(const file of files){const item=document.createElement('div');item.className='attachment-chip';const name=document.createElement('span');name.dataset.authored='true';name.textContent=file.name;const remove=labeledButton('',translate('Удалить файл')+': '+file.name,'close',()=>{files=files.filter(x=>x!==file);render();});remove.disabled=busy;remove.setAttribute('aria-label',translate('Удалить файл')+': '+file.name);remove.replaceChildren(icon('close'));item.append(name,remove);list.append(item);}add.disabled=busy;input.disabled=busy;}
 input.onchange=()=>{for(const file of input.files)if(!files.some(x=>x.name===file.name&&x.size===file.size&&x.lastModified===file.lastModified))files.push(file);input.value='';render();};
 window.DeepAgentAttachments={files:()=>[...files],clear:()=>{files=[];render();},busy:value=>{busy=value;render();},status:text=>{status.textContent=text;status.hidden=!text;}};
 // Clear a pending selection on company changes to prevent accidental cross-context use.
 let company=window.deepAgentDemo?.state().company_id;document.addEventListener('deepagent-section-rendered',()=>{const next=window.deepAgentDemo?.state().company_id;if(next!==company){files=[];render();company=next;}});
}
