// Small pure helpers shared by the mail client and its public presentation.
import {normalizeWorkEmail} from './email-addresses.js';
export const mailFolders=[['inbox','Входящие'],['unread','Непрочитанные'],['unanswered','Без ответа'],['starred','Избранное'],['sent','Отправленные'],['drafts','Черновики'],['outbox','Исходящие'],['archive','Архив'],['trash','Корзина']];
export const inFolder=(item,folder)=>folder==='unread'?item.folder==='inbox'&&item.unread:folder==='unanswered'?item.folder==='inbox'&&!item.answered:folder==='starred'?item.starred&&item.folder!=='trash':item.folder===folder;
export function recipients(value){
 const parts=[];let part='',quoted=false,angle=false;
 for(let i=0;i<value.length;i++){const c=value[i];if(c==='"'&&value[i-1]!=='\\')quoted=!quoted;if(c==='<'&&!quoted)angle=true;if(c==='>'&&!quoted)angle=false;if((c===','||c===';')&&!quoted&&!angle){parts.push(part);part='';}else part+=c;}parts.push(part);
 return [...new Set(parts.map(x=>x.trim()).filter(Boolean).map(x=>normalizeWorkEmail(x.match(/<([^<>]+)>$/)?.[1]||x)))];
}
export function addressOf(value){try{const match=value.match(/<([^<>]+)>/);return match?normalizeWorkEmail(match[1]):recipients(value)[0]||'';}catch{return '';}}
export function bytesToBase64(buffer){let result='';const bytes=new Uint8Array(buffer);for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(result);}
export function base64ToBlob(data,type='application/octet-stream'){const raw=atob(data),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));return new Blob([bytes],{type});}
export function mailDate(value){try{return new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Zurich',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value));}catch{return '';}}
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
