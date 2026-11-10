import ServicePage from '../components/ServicePage';
import ProjectHighlight from '../components/ProjectHighlight';
import content from '../lib/service-content.json';
export default function Page(){return <ServicePage page={content['business-computer-systems']} path="/business-computer-systems">
<ProjectHighlight id="middleburg-heights-project" location="MIDDLEBURG HEIGHTS, OHIO" title="Restaurant POS equipment replacement" summary="Replaced an existing restaurant point-of-sale system with new equipment in Middleburg Heights, Ohio. The photo shows the replacement equipment after installation." work={['Replaced the restaurant’s previous POS equipment.','Installed the replacement point-of-sale system.']} photos={[{src:'/projects/middleburg-heights-pos.webp',alt:'Replacement restaurant POS terminal installed in Middleburg Heights, Ohio',caption:'After installation: replacement POS terminal. Receipts shown are dummy test receipts.'}]} note="This project documents equipment replacement experience. New POS requirements, software compatibility and implementation responsibilities are confirmed separately for each proposal."/>
</ServicePage>;}
