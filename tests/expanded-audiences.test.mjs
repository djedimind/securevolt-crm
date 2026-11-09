import assert from 'node:assert/strict';
import {recommend} from '../lib/sales.mjs';
import {buildInquiry} from '../lib/inquiry.mjs';
import {decodeHandoff,encodeHandoff} from '../lib/handoff.mjs';
for(const industry of ['schools','churches','nonprofits','business','other']){
 const answers={industry,locations:'one',needs:['clarity'],timing:'soon',support:'internal'};
 const recommendation=recommend(answers);
 assert.equal(recommendation.primary,'review');
 assert.equal(decodeHandoff(encodeHandoff(answers)).industry,industry);
 const inquiry=buildInquiry({name:'QA Reviewer',company:'TEST Expanded Audience',email:'qa@example.test',industry,locations:'one',timing:'soon',support:'internal',offer:'review',message:'TEST only',consent:true},answers,Date.now()-5000);
 assert.match(inquiry.requirements,/Technology Audit & Readiness Review/);
 assert.match(inquiry.requirements,/Industry:/);
}
assert.throws(()=>buildInquiry({name:'QA Reviewer',company:'TEST Organization',email:'qa@example.test',industry:'schools',locations:'one',timing:'soon',support:'',offer:'review',consent:true}));
console.log('Expanded audiences preserve recommendation, handoff and inquiry payloads; support is required.');
