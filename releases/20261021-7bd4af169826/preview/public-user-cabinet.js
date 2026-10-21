import {normalizeWorkEmail} from './email-addresses.js';
// Public presentation identity: synthetic data only; never an authentication provider.
const storageKey='deepagent-public-profile-v1';
export function createPublicUserCabinet(organization,storage){
 const person=organization.people.find(p=>p.id==='director');
 if(!person)throw Error('Не найден пример профиля.');
 const company=organization.companies.find(c=>c.id===person.company_id),department=organization.departments.find(d=>d.id===person.department_id);
 const defaults={name:person.name,email:person.email||'',about:'Руковожу развитием компании, координирую работу подразделений и контролирую выполнение ключевых задач.',photo_data:''};
 let value={...defaults},revision='initial';
 function clean(input){
  const name=String(input.name||'').trim(),email=normalizeWorkEmail(input.email),about=String(input.about||'').trim(),photo_data=String(input.photo_data||'');
  if(!name||name.length>160||email.length>254||about.length>2000)throw Error('Проверьте заполнение профиля.');
  if(photo_data&&(!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo_data)||photo_data.length>340000))throw Error('Выберите фотографию JPG, PNG или WebP.');
  return {name,email,about,photo_data};
 }
 function read(){try{const saved=JSON.parse(storage?.getItem(storageKey)||'null');if(saved?.version===1){value=clean(saved.value);revision=String(saved.revision);}}catch{}}
 read();
 const current=()=>({id:'public-current-user',login:'a.vorontsov',name:value.name,role:'owner'});
 function profile(){return {account:current(),revision,...value,employee:{id:person.id,company:company?.name||'',department:department?.name||'',position:person.position,work_schedule:person.work_schedule||'',duties:'Стратегия компании, развитие подразделений, согласование ключевых решений и контроль результатов.',manager:''},save_message:'Изменения сохранены в этом браузере.'};}
 return {current,async profile(){read();return structuredClone(profile());},async saveProfile(input){
  read();if(input.revision!==revision)throw Error('Профиль изменён в другом окне. Откройте его заново.');
  const next=clean(input),nextRevision=crypto.randomUUID();
  try{if(!storage)throw Error();storage.setItem(storageKey,JSON.stringify({version:1,revision:nextRevision,value:next}));}catch{throw Error('Браузер не разрешил сохранить изменения.');}
  value=next;revision=nextRevision;return structuredClone(profile());
 },reset(){storage?.removeItem(storageKey);value={...defaults};revision='initial';}};
}
