import Link from 'next/link';
import SiteFrame from './SiteFrame';
const links=[['/technology-audit-cleveland','Business technology audits'],['/business-network-wifi','Network & Wi-Fi solutions'],['/business-computer-systems','Business computer systems'],['/services/security','Camera & recording solutions'],['/business-technology-consulting','Technology consulting'],['/services/voip','Business phone solutions'],['/services/sip-trunking','SIP & voice connectivity'],['/#ai-integration','AI workflow integration'],['/#staff-training','Staff technology education']];
export function ServiceLinks({current}){return <ul className="serviceLinks">{links.filter(([url])=>url!==current).map(([url,label])=><li key={url}><Link href={url}>{label} <span aria-hidden="true">↗</span></Link></li>)}</ul>;}
export default function ServicePage({page,path,children}){
 const url='https://securevoltsolutions.com'+path;
 const schema={'@context':'https://schema.org','@type':'Service',name:page.heading,description:page.description,url,provider:{'@id':'https://securevoltsolutions.com/#organization'},areaServed:{'@type':'City',name:'Cleveland'}};
 const href='/contact'+(page.offer?'?offer='+page.offer:'');
 const groups=[];for(const node of page.nodes){const last=groups.at(-1);if((node.type==='li'||node.type==='step')&&last?.type===node.type)last.items.push(node.text);else groups.push({type:node.type,text:node.text,items:[node.text]});}
 return <SiteFrame title={page.title} description={page.description}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <section className="compactHero"><div className="eyebrow">CLEVELAND · BUSINESS TECHNOLOGY</div><h1>{page.heading}</h1><p>{page.description}</p><Link className="primaryButton" href={href}>Request a consultation ↗</Link></section>
  <section className="section serviceLayout"><article className="serviceCopy">{groups.map((node,i)=>node.type==='h2'?<h2 key={i}>{node.text}</h2>:node.type==='h3'?<h3 key={i}>{node.text}</h3>:node.type==='li'?<ul key={i}>{node.items.map(t=><li key={t}>{t}</li>)}</ul>:node.type==='step'?<ol key={i}>{node.items.map(t=><li key={t}>{t}</li>)}</ol>:<p key={i}>{node.text}</p>)}{children}<Link className="primaryButton" href={href}>Discuss your requirements ↗</Link></article><aside className="contactCard serviceAside"><div className="eyebrow">YOUR NEXT STEP</div><h2>Clarity before you invest.</h2><p>Share your location, priorities and timing. Your written proposal confirms scope, costs and delivery responsibilities before work begins.</p><Link className="primaryButton" href={href}>Start your inquiry ↗</Link><p><a href="mailto:dispatch@securevoltsolutions.com">dispatch@securevoltsolutions.com</a></p><p>No passwords, patient records or confidential security information in public inquiries.</p></aside></section>
  <section className="section serviceDirectory"><h2>Related SecureVolt solutions</h2><ServiceLinks current={path}/></section>
 </SiteFrame>;
}
