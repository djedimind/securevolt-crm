import Head from "next/head";

export default function SIPTrunking() {
  return (
    <>
      <Head>
        <title>SIP Trunking & Call Centers | SecureVolt</title>
        <meta name="description" content="SecureVolt Solutions offers cost-effective SIP Trunking and call center solutions with high reliability and AI-powered routing." />
      </Head>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-blue-600">SIP Trunking & Call Centers</h1>
        <p className="mt-4 text-lg">
          Reliable SIP Trunking solutions with AI-driven call routing, cost-efficient pricing, and seamless business communication.
        </p>
        <ul className="mt-6 list-disc ml-6 text-lg">
          <li>🔹 Cost-efficient Call Routing & IVR</li>
          <li>🔹 High-Quality VoIP Connectivity</li>
          <li>🔹 Scalable Call Center Solutions</li>
        </ul>
        <a href="/contact" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">Get a Free Quote</a>
      </div>
    </>
  );
}
