export const measurementId = 'G-LHBQWZH3KS';
export const productionHosts = new Set(['securevoltsolutions.com', 'www.securevoltsolutions.com']);

// Accept only a fixed offer label and a confirmed receipt; never forward form fields.
export function trackConfirmedLead({receipt, offer, isTest = false}, browser = typeof window !== 'undefined' ? window : undefined) {
  if (!browser || !productionHosts.has(browser.location.hostname) || isTest || receipt?.preview ||
      typeof receipt?.requestId !== 'string' || !receipt.requestId || typeof browser.gtag !== 'function') return false;
  const key = 'sv:lead:' + receipt.requestId;
  browser.__svLeadReceipts ||= new Set();
  if (browser.__svLeadReceipts.has(key)) return false;
  try { if (browser.sessionStorage.getItem(key)) return false; } catch {}
  browser.__svLeadReceipts.add(key);
  try { browser.sessionStorage.setItem(key, '1'); } catch {}
  browser.gtag('event', 'generate_lead', {
    send_to: measurementId,
    lead_source: 'website_inquiry',
    service_offer: ['review', 'ai', 'training', 'equipment'].includes(offer) ? offer : 'other',
  });
  return true;
}
