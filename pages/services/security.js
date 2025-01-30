import Head from "next/head";

export default function Security() {
  return (
    <>
      <Head>
        <title>Business Surveillance & Security | SecureVolt</title>
        <meta name="description" content="SecureVolt Solutions provides advanced security camera systems, AI motion detection, and cloud-based video storage." />
      </Head>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-blue-600">Business Surveillance & Security</h1>
        <p className="mt-4 text-lg">
          Protect your business with AI-driven security cameras, 24/7 monitoring, and cloud-based video storage.
        </p>
        <ul className="mt-6 list-disc ml-6 text-lg">
          <li>🔹 AI Motion Detection & Smart Alerts</li>
          <li>🔹 Cloud-Based Secure Video Storage</li>
          <li>🔹 Remote Access & Live Monitoring</li>
        </ul>
        <a href="/contact" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">Get a Free Quote</a>
      </div>
    </>
  );
}
