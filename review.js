const frame=document.getElementById('application'),status=document.getElementById('review-status');
let palette='neutral',screen='report',busy=false,ready=false;
const labels={original:'Текущая оливковая',neutral:'Светлая + синий',graphite:'Графитовая навигация',warm:'Тёплая + бирюзовый'};
const names={report:'Отчёт',chat:'Длинная переписка',person:'Карточка сотрудника'};
const wait=async fn=>{for(let i=0;i<150;i++){const value=fn();if(value)return value;await new Promise(r=>setTimeout(r,100));}throw Error('Экран не загрузился. Обновите страницу сравнения.');};
function announce(){status.textContent=labels[palette]+' · '+names[screen]+' · Меняется оформление; расположение элементов и данные одинаковые.';}
function recolor(){const d=frame.contentDocument,w=frame.contentWindow;d.documentElement.dataset.reviewTheme=palette;
 if(w.Chart)for(const c of d.querySelectorAll('canvas')){const chart=w.Chart.getChart(c);if(!chart)continue;const color=getComputedStyle(d.documentElement).getPropertyValue('--green').trim();for(const data of chart.data.datasets){data.borderColor=color;data.backgroundColor=color;}chart.update('none');}
 document.querySelectorAll('[data-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.palette===palette)));announce();}
async function openScreen(next){if(!ready||busy)return;busy=true;screen=next;document.querySelectorAll('[data-screen]').forEach(b=>{b.disabled=true;b.setAttribute('aria-pressed',String(b.dataset.screen===screen));});status.textContent='Открываю: '+names[screen]+'…';
 try{const d=frame.contentDocument,click=s=>{const el=d.querySelector(s);if(!el)throw Error('Не найден элемент: '+s);el.click();};
  if(screen==='report'){
   click('#analytics-access');await wait(()=>d.querySelector('#demo-chart'));
  }else if(screen==='chat'){
   click('#history-access');await wait(()=>d.querySelector('.history-layout'));const stream=d.querySelector('.history-stream');if(stream)stream.scrollTop=0;d.querySelector('#conversation-flow').scrollTop=0;
  }else{
   const select=d.querySelector('#department-select');select.value='sales';select.dispatchEvent(new Event('change',{bubbles:true}));click('[data-section="Персонал"]');click('[data-employee="novikov"]');click('[data-sub="Дополнительные задачи"]');await wait(()=>d.querySelector('.person-head'));d.querySelector('#conversation-flow').scrollTop=0;
  }
  recolor();
 }catch(e){status.textContent=e.message;}finally{busy=false;document.querySelectorAll('[data-screen]').forEach(b=>b.disabled=false);}}
frame.addEventListener('load',async()=>{try{const d=frame.contentDocument;const sheet=d.createElement('link');sheet.rel='stylesheet';sheet.href='./themes.css';d.head.append(sheet);await wait(()=>frame.contentWindow.deepAgentDemo&&d.querySelector('#analytics-access')&&d.querySelector('#company-name')?.textContent==='Вектор');const menu=d.querySelector('#menu-toggle');if(frame.clientWidth>=1000&&menu?.getAttribute('aria-expanded')==='false')menu.click();ready=true;recolor();await openScreen(screen);}catch(e){status.textContent=e.message;}});
document.querySelectorAll('[data-palette]').forEach(b=>b.onclick=()=>{palette=b.dataset.palette;if(ready)recolor();});
document.querySelectorAll('[data-screen]').forEach(b=>b.onclick=()=>openScreen(b.dataset.screen));
