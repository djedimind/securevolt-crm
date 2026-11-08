import assert from 'node:assert/strict';
import {industries,needLabels,recommend} from '../lib/sales.mjs';
import {encodeHandoff,decodeHandoff} from '../lib/handoff.mjs';
import {validateInquiry,buildInquiry,submitInquiry} from '../lib/inquiry.mjs';
const a={industry:'healthcare',needs:['clarity','training'],locations:'several',timing:'soon',support:'remote'};
assert.deepEqual(decodeHandoff(encodeHandoff(a)),a);
for(const hash of ['#sv=bad','#sv='+encodeURIComponent('{"v":2}'),'#sv='+encodeURIComponent(JSON.stringify({...a,v:1,industry:'constructor'})),'#sv='+encodeURIComponent(JSON.stringify({...a,v:1,needs:['__proto__']}))])assert.equal(decodeHandoff(hash),null);
const f={name:'QA Reviewer',company:'TEST SecureVolt QA',email:'qa@example.test',phone:'',industry:'healthcare',locations:'several',timing:'soon',support:'remote',offer:'review',message:'Administrative technology review test.',consent:true};
assert.deepEqual(validateInquiry(f),{});
const payload=buildInquiry(f,a,Date.now()-5000);assert.equal(payload.requestType,'Technology risk assessment');assert.match(payload.requirements,/Staff Technology Confidence/);assert.match(payload.requirements,/2–5 locations/);assert.match(payload.requirements,/healthcare/i);assert.ok(payload.requirements.length<5000);
assert.ok(validateInquiry({...f,email:'bad'}).email);assert.ok(validateInquiry({...f,consent:false}).consent);
for(const result of [{status:500,data:{error:'Delivery unavailable'}},{status:200,data:{success:true}},{status:200,data:{success:false,requestId:'fake'}}])await assert.rejects(()=>submitInquiry(payload,{fetcher:async()=>new Response(JSON.stringify(result.data),{status:result.status})}));
assert.equal((await submitInquiry(payload,{fetcher:async()=>new Response(JSON.stringify({success:true,requestId:'test-verified',mode:'preview'}))})).preview,true);
await assert.rejects(()=>submitInquiry(payload,{fetcher:async()=>{throw new TypeError('Network failed');}}),/Network/);
const keys=Object.keys(needLabels);let combinations=0;
for(const industry of Object.keys(industries))for(let mask=1;mask<(1<<keys.length);mask++)for(const locations of ['one','several','many'])for(const timing of ['soon','quarter','exploring'])for(const support of ['remote','internal','none','unsure']){const input={industry,locations,timing,support,needs:keys.filter((_,i)=>mask&(1<<i))};const r=recommend(input);assert.deepEqual(decodeHandoff(encodeHandoff(input)),input);assert.ok(r.title&&r.next);combinations++;}
console.log(`Passed ${combinations} recommendation/handoff combinations, hostile input checks and inquiry receipt/failure checks.`);
