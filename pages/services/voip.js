import Head from "next/head";
import Link from "next/link";

export default function VoIP() {
  return (
    <>
      <Head>
        <title>VoIP & Cloud Phone Systems | SecureVolt</title>
        <meta name="description" content="SecureVolt Solutions offers reliable VoIP phone systems with AI-powered call analytics and cloud PBX." />
      </Head>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-blue-600">VoIP & Cloud Phone Systems</h1>
        <p className="mt-4 text-lg">Powerful business communication solutions with crystal-clear voice quality, AI-driven analytics, and mobile integration.</p>
        <ul className="mt-6 list-disc ml-6 text-lg">
          <li>🔹 High-Definition Voice & Call Encryption</li>
          <li>🔹 AI-Driven Call Routing & IVR</li>
          <li>🔹 Remote Work & Mobile Support</li>
        </ul>
        <Link href="/contact" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">Get a Free Quote</Link>
      </div>
    </>
  );
}
