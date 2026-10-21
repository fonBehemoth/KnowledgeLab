import {translate as t} from './i18n.js';
export const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
export const button=(text,fn)=>{const n=el('button',t(text));n.type='button';n.onclick=fn;return n;};
