import {useEffect, useState} from 'react';
import Script from 'next/script';
import {measurementId, productionHosts} from '../lib/analytics.mjs';

export default function Analytics() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => { setEnabled(productionHosts.has(window.location.hostname)); }, []);
  if (!enabled) return null;
  return <>
    <Script id="securevolt-google-tag-init" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
      window.gtag('js', new Date());
      window.gtag('config', '${measurementId}', {
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    `}</Script>
    <Script id="securevolt-google-tag" src={'https://www.googletagmanager.com/gtag/js?id=' + measurementId} strategy="afterInteractive"/>
  </>;
}
