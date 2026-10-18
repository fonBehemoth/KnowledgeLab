import {translate} from './i18n.js';

const paths={company:'M3 21V5l9-3 9 3v16M8 8h1m6 0h1M8 12h1m6 0h1M9 21v-5h6v5',department:'M12 3v5M5 21v-5h14v5M5 16v-5h14v5M12 11V8',projects:'M3 7h7l2-3h8v16H3Z',people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8m6 10v-2a4 4 0 0 0-3-3M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',reports:'M5 3h10l4 4v14H5ZM14 3v5h5M8 12h8m-8 4h8',chat:'M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 1 1 17-5Z',analytics:'M4 20V4m0 16h17M8 16v-5m5 5V7m5 9v-9',library:'M4 3h4v18H4ZM12 3h4v18h-4m7-16 3 15',graph:'M10 5h4m-8 4 4 9m8-9-4 9M9 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-6 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0',history:'M3 11a9 9 0 1 1 3 8M3 4v7h7m2-5v6l4 2',assistant:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Zm6 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0',plus:'M12 4v16M4 12h16',menu:'M4 6h16M4 12h16M4 18h16',close:'m6 6 12 12M6 18 18 6',sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2m-1 5a6 6 0 1 1-12 0 6 6 0 0 1 12 0',moon:'M21 14a9 9 0 0 1-11-11 9 9 0 1 0 11 11'};
function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('nav-icon');const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',paths[name]||paths.reports);svg.append(p);return svg;}
function mark(el,name){if(el&&!el.querySelector(':scope>.nav-icon'))el.prepend(icon(name));}
function labeledButton(id,text,name,fn){const b=document.createElement('button');b.type='button';b.id=id;b.append(icon(name),document.createTextNode(translate(text)));b.onclick=fn;return b;}

export function initConversationLayout(){
 if(document.body.classList.contains('conversation-layout'))return;
 document.body.classList.add('conversation-layout');
 const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=new URL('./conversation-layout.css?v=20261018-chat2',import.meta.url);document.head.append(sheet);
 const side=document.querySelector('#navigation-panel'),toggle=document.querySelector('#menu-toggle'),brand=document.querySelector('.brand-lockup');
 const heading=document.createElement('div');heading.className='nav-heading';toggle.replaceChildren(icon('close'));toggle.setAttribute('aria-label',translate('Скрыть навигацию'));heading.append(brand,toggle);
 const scroll=document.createElement('div');scroll.className='nav-scroll';scroll.append(...side.childNodes);side.append(heading,scroll);
 const reopen=labeledButton('reopen-navigation','Показать навигацию','menu',()=>toggle.click());document.body.append(reopen);
 const context=document.querySelector('.workspace-toolbar');if(context){const mobile=context.querySelector('.mobile-activity');if(mobile)mobile.hidden=true;scroll.prepend(context);}
 const sections=scroll.querySelector('.main-tabs'),analytic=document.querySelector('#analytics-access');
 if(analytic){sections.querySelector('[data-section="Аналитика"]')?.remove();analytic.dataset.section='Аналитика';sections.append(analytic);}
 const library=document.createElement('nav');library.className='nav-library';library.setAttribute('aria-label',translate('Материалы и история'));
 for(const id of ['history-access','core-history-button','core-graph-button']){const item=document.getElementById(id);if(item)library.append(item);}
 scroll.append(library);document.querySelector('#workspace-resources')?.remove();
 const recent=document.createElement('nav');recent.className='nav-recent';recent.setAttribute('aria-label',translate('Последние чаты'));scroll.append(recent);
 const dialogue=document.createElement('nav');dialogue.className='nav-dialogue';dialogue.setAttribute('aria-label',translate('Диалог'));
 for(const id of ['assistant-mode','team-mode','participants-button','base-values']){const item=document.getElementById(id);if(item)dialogue.append(item);}
 scroll.append(dialogue);document.querySelector('.chat-controls')?.remove();
 const activity=document.getElementById('activity-button');if(activity)scroll.append(activity);
 const footer=document.createElement('div');footer.className='nav-footer';const settings=side.querySelector('.nav-settings');if(settings)footer.append(settings);
 const themeSelect=document.querySelector('#theme-select');if(themeSelect){themeSelect.replaceChildren();for(const [value,label] of [['light','Светлая тема'],['dark','Тёмная тема']]){const option=document.createElement('option');option.value=value;option.textContent=translate(label);themeSelect.append(option);}themeSelect.onchange=()=>setMode(themeSelect.value);}
 let mode='light';try{mode=localStorage.getItem('deepagent-conversation-mode')||mode;}catch{}
 const modeButton=labeledButton('conversation-theme','Тёмная тема','moon',()=>setMode(mode==='light'?'dark':'light'));
 function setMode(next){mode=next==='dark'?'dark':'light';document.body.dataset.conversationMode=mode;if(themeSelect)themeSelect.value=mode;modeButton.replaceChildren(icon(mode==='light'?'moon':'sun'),document.createTextNode(translate(mode==='light'?'Тёмная тема':'Светлая тема')));modeButton.setAttribute('aria-pressed',String(mode==='dark'));try{localStorage.setItem('deepagent-conversation-mode',mode);}catch{}}
 footer.append(modeButton);side.append(footer);setMode(mode);
 document.querySelector('body>header').hidden=true;
 const appearance=document.querySelector('.appearance-settings');if(appearance){const target=document.querySelector('#app-settings-button');const original=target?.onclick;if(target)target.onclick=e=>{original?.(e);const dialog=[...document.querySelectorAll('dialog')].find(d=>d.open);if(dialog&&!dialog.querySelector('#theme-select'))dialog.append(appearance);};}
 document.querySelector('.app-footer').hidden=true;
 const labels={'Проекты':'projects','Персонал':'people','Отчёты':'reports','Чаты':'chat','Аналитика':'analytics'};
 const decorate=()=>{for(const item of side.querySelectorAll('[data-section]'))mark(item,labels[item.dataset.section]);for(const [id,name] of Object.entries({'history-access':'history','core-history-button':'library','core-graph-button':'graph','app-settings-button':'settings','assistant-mode':'assistant','team-mode':'chat','participants-button':'people','base-values':'reports','activity-button':'history'}))mark(document.getElementById(id),name);mark(document.querySelector('#company-disclosure>summary'),'company');for(const item of side.querySelectorAll('#subnav>button'))mark(item,'reports');};
 const refreshRecent=()=>{recent.replaceChildren();const state=window.deepAgentDemo.state(),history=window.deepAgentDemo.historySnapshot().chats[state.company_id];const threads=history?.threads||[];recent.hidden=!threads.length;if(!threads.length)return;const label=document.createElement('small');label.textContent=translate('Последние чаты');recent.append(label);for(const item of threads.slice(-4).reverse()){const b=labeledButton('',item.title,'chat',()=>{document.querySelector('#history-access').click();[...document.querySelectorAll('[data-open-chat]')].find(x=>x.dataset.openChat===item.id)?.click();});const text=b.lastChild,span=document.createElement('span');span.dataset.authored='true';span.textContent=text.textContent;text.replaceWith(span);recent.append(b);}};
 document.addEventListener('deepagent-section-rendered',()=>{decorate();refreshRecent();});document.addEventListener('deepagent-history-changed',refreshRecent);document.addEventListener('deepagent-language-change',()=>{decorate();setMode(mode);refreshRecent();});decorate();refreshRecent();
 initAttachments();
 const question=document.querySelector('#question');if(!question.onkeydown)question.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(!document.querySelector('.send').disabled)document.querySelector('#ask-form').requestSubmit();}};
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
