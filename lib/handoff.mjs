import {industries,needLabels,locationLabels,timingLabels,supportLabels} from './sales.mjs';
const own=(o,k)=>typeof k==='string'&&Object.hasOwn(o,k);
export function cleanAnswers(v){if(!v||typeof v!=='object'||!own(industries,v.industry)||!own(locationLabels,v.locations)||!own(timingLabels,v.timing)||!own(supportLabels,v.support)||!Array.isArray(v.needs)||!v.needs.length||v.needs.length>Object.keys(needLabels).length||v.needs.some(n=>!own(needLabels,n)))return null;return {industry:v.industry,locations:v.locations,needs:[...new Set(v.needs)],timing:v.timing,support:v.support};}
export function encodeHandoff(v){const a=cleanAnswers(v);if(!a)throw Error('Incomplete discovery answers');return '#sv='+encodeURIComponent(JSON.stringify({v:1,...a}));}
export function decodeHandoff(hash){if(typeof hash!=='string'||!hash.startsWith('#sv=')||hash.length>1600)return null;try{const v=JSON.parse(decodeURIComponent(hash.slice(4)));return v.v===1?cleanAnswers(v):null;}catch{return null;}}
