import Image from 'next/image';
import Link from 'next/link';

export default function ProjectHighlight({ id, location, title, summary, work, photos, note }) {
  return <section className="projectHighlight" id={id} aria-labelledby={id+'-title'}>
    <div className="eyebrow">PROJECT EXPERIENCE · {location}</div>
    <h2 id={id+'-title'}>{title}</h2>
    <p>{summary}</p>
    <div className="projectPhotos">{photos.map(photo => <figure key={photo.src}>
      <Image src={photo.src} width={1200} height={900} sizes="(max-width: 540px) 85vw, 350px" alt={photo.alt}/>
      <figcaption>{photo.caption}</figcaption>
    </figure>)}</div>
    <h3>Work performed</h3>
    <ul>{work.map(item => <li key={item}>{item}</li>)}</ul>
    <p>{note}</p>
    <p><Link href="/contact?offer=equipment">Discuss your business equipment requirements.</Link></p>
  </section>;
}
