// Synthetic correspondence for the public presentation. Never connects or sends mail.
import {base64ToBlob,bytesToBase64,inFolder} from './mailbox-model.js';
import {normalizeWorkEmail} from './email-addresses.js';
const key='deepagent-public-mailbox-v1';
export function createPublicMailbox(identity,storage){
 function seed(){const file=bytesToBase64(new TextEncoder().encode('Пример плана поставки\nПоставка А — 24 октября 2026 года.\nВсе данные вымышленные.'));
  return {version:1,items:[
   {id:'sample-delivery',revision:1,folder:'inbox',state:'received',from:'Мария Белова <belova@vector.example>',to:'director@vector.example',subject:'Согласование графика поставки',text:'Андрей Николаевич, добрый день!\n\nНаправляю график поставки на следующую неделю. Просьба подтвердить дату отгрузки и ответственного за приёмку.\n\nПлан приложен к письму.\n\nС уважением,\nМария Белова',at:'2026-10-22T08:35:00Z',unread:true,answered:false,starred:true,attachments:[{id:'0',name:'План поставки.txt',size:120,type:'text/plain',data:file}]},
   {id:'sample-report',revision:1,folder:'inbox',state:'received',from:'Павел Новиков <novikov@vector.example>',to:'director@vector.example',subject:'Управленческий отчёт за сентябрь',text:'Добрый день!\n\nОтчёт за сентябрь подготовлен. Выручка составила 418 000 €. Проверка первичных документов завершена.\n\nПо поставке А остаётся вопрос к исходному расчёту. Предлагаю обсудить его на встрече.\n\nПавел Новиков',at:'2026-10-22T07:10:00Z',unread:true,answered:false,starred:false,attachments:[]},
   {id:'sample-meeting',revision:1,folder:'inbox',state:'received',from:'Елена Соколова <sokolova@vector.example>',to:'director@vector.example',subject:'Встреча руководителей подразделений',text:'Андрей Николаевич, встреча руководителей назначена на пятницу, 10:00.\n\nПовестка: результаты недели, согласования и планы подразделений.\n\nЕлена Соколова',at:'2026-10-21T13:20:00Z',unread:false,answered:true,starred:false,attachments:[]},
   {id:'sample-sent',revision:1,folder:'sent',state:'sent',from:'director@vector.example',to:'sokolova@vector.example',subject:'Re: Встреча руководителей подразделений',text:'Елена, встречу подтверждаю. Добавьте, пожалуйста, в повестку план закупок на ноябрь.\n\nАндрей Воронцов',at:'2026-10-21T14:05:00Z',unread:false,starred:false,attachments:[]},
   {id:'sample-draft',revision:1,folder:'drafts',state:'draft',from:'director@vector.example',to:'orlov@vector.example',recipient_text:'orlov@vector.example',recipients:['orlov@vector.example'],copy_to:[],cc:'',copy_text:'',subject:'План продаж на ноябрь',text:'Алексей, добрый день!\n\nПодготовьте, пожалуйста, предложения по плану продаж на ноябрь.',at:'2026-10-22T06:40:00Z',unread:false,starred:false,attachments:[]}
  ]};
 }
 function load(){try{const box=JSON.parse(storage?.getItem(key)||'null');if(box?.version===1&&Array.isArray(box.items))return box;}catch{}return seed();}
 function save(box){try{if(!storage)throw Error();storage.setItem(key,JSON.stringify(box));}catch{throw Error('Браузер не разрешил сохранить почту. Освободите место или уменьшите вложения.');}}
 function find(box,id){const item=box.items.find(x=>x.id===id);if(!item)throw Error('Письмо не найдено.');return item;}
 function view(item,full=false){const result=structuredClone(item);result.preview=item.text.slice(0,180);result.attachments=(item.attachments||[]).map(({data,...a})=>({...a,available:!!data}));if(!full)delete result.text;return result;}
 async function address(){return (await identity.profile()).email||'director@vector.example';}
 return {
  async list(q=''){const box=load(),query=q.trim().toLowerCase(),counts={};for(const folder of ['inbox','sent','drafts','trash','outbox','archive','unread','unanswered'])counts[folder]=box.items.filter(x=>inFolder(x,folder)).length;return {address:await address(),configured:false,can_send:false,settings:null,synced_at:null,counts,items:box.items.filter(x=>!query||[x.from,x.to,x.subject,x.text].join(' ').toLowerCase().includes(query)).sort((a,b)=>b.at.localeCompare(a.at)).map(x=>view(x))};},
  async read(id){return view(find(load(),id),true);},
  async readDraft(id){const item=find(load(),id);if(item.folder!=='drafts')throw Error('Письмо не является черновиком.');return structuredClone(item);},
  async saveDraft(value,id){const box=load(),old=id?find(box,id):null;if(old&&old.revision!==value.revision)throw Error('Черновик изменён в другом окне. Откройте его заново.');if(old&&old.folder!=='drafts')throw Error('Письмо не является черновиком.');for(const email of [...value.recipients,...value.copy_to,...(value.blind_copy||[])])normalizeWorkEmail(email);if(value.subject.length>1000||value.text.length>120000)throw Error('Письмо слишком длинное.');const item={...(old||{}),...structuredClone(value),id:id||crypto.randomUUID(),revision:(old?.revision||0)+1,folder:'drafts',state:'draft',from:await address(),to:value.recipients.join(', '),cc:value.copy_to.join(', '),bcc:(value.blind_copy||[]).join(', '),unread:false,starred:false,at:new Date().toISOString(),attachments:value.attachments.map((a,i)=>({...a,id:String(i),size:Math.floor(a.data.length*3/4)}))};if(old)box.items[box.items.indexOf(old)]=item;else box.items.push(item);save(box);return view(item,true);},
  async change(id,value){const box=load(),item=find(box,id);if(item.revision!==value.revision)throw Error('Письмо изменилось. Откройте его заново.');for(const name of ['unread','starred'])if(value[name]!==undefined)item[name]=value[name];if(value.folder){const target=value.folder==='restore'?item.previous_folder||'inbox':'trash';item.previous_folder=item.folder;item.folder=target;}item.revision++;save(box);return view(item,true);},
  async remove(id,revision){const box=load(),item=find(box,id);if(item.folder!=='trash'||item.revision!==revision)throw Error('Откройте письмо в корзине заново.');box.items.splice(box.items.indexOf(item),1);save(box);return {deleted:true};},
  async attachment(id,attachment){const item=find(load(),id),file=item.attachments.find(a=>a.id===attachment);if(!file?.data)throw Error('Вложение не найдено.');return base64ToBlob(file.data,file.type);},
  async send(){throw Error('Подключите настоящий почтовый ящик в серверной версии приложения.');},
  async sync(){throw Error('Для получения новых писем подключите настоящий почтовый ящик.');},
  reset(){storage?.removeItem(key);}
 };
}
