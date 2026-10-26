const keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
const storageKey='securevolt.campaign.v1';
const maxAge=24*60*60*1000;
function safeStorage(){try{return globalThis.sessionStorage;}catch{return null;}}
export function cleanAttribution(value){
 const clean={};if(!value||typeof value!=='object')return clean;
 for(const key of keys){const v=value[key];if(typeof v==='string'&&/^[a-z0-9][a-z0-9._-]{0,99}$/i.test(v))clean[key]=v;}
 return clean;
}
export function readAttribution(storage=safeStorage(),now=Date.now()){
 try{const saved=JSON.parse(storage?.getItem(storageKey)||'null');if(!saved||!Number.isFinite(saved.at)||saved.at>now||now-saved.at>maxAge)return {};return cleanAttribution(saved.tags);}catch{return {};}
}
export function captureAttribution(search,storage=safeStorage(),now=Date.now()){
 const params=new URLSearchParams(typeof search==='string'?search.slice(0,2000):'');
 const tags=cleanAttribution(Object.fromEntries(keys.map(key=>[key,params.get(key)])));
 if(!Object.keys(tags).length)return readAttribution(storage,now);
 try{storage?.setItem(storageKey,JSON.stringify({at:now,tags}));}catch{/* The URL handoff still works when storage is unavailable. */}
 return tags;
}
export function campaignQuery(tags){const query=new URLSearchParams(cleanAttribution(tags)).toString();return query?'?'+query:'';}
export function attributionLines(tags){return Object.entries(cleanAttribution(tags)).map(([key,value])=>`${key}: ${value}`);}
