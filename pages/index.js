import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (<>
  <Head>
    <title>SecureVolt Solutions | Security Camera Installation Cleveland, OH</title>
    <meta
      name="description"
      content="SecureVolt Solutions provides professional security camera installation, CCTV systems, and low-voltage cabling for residential and commercial clients in Cleveland and surrounding areas."
    />
  </Head>

  <div className="container mx-auto px-4 py-10 text-center">
    <h1 className="text-4xl font-bold text-blue-600">
      SecureVolt Solutions
    </h1>

    <p className="mt-4 text-lg">
      Professional Security Camera Installation & Low-Voltage Systems
      <br />
      Serving Cleveland and surrounding Northeast Ohio areas
    </p>

    <div className="mt-8 max-w-xl mx-auto text-left">
      <ul className="space-y-2 text-lg">
        <li>• CCTV & IP Camera Systems</li>
        <li>• NVR / DVR Installation & Replacement</li>
        <li>• Commercial & Residential Surveillance</li>
        <li>• Cat6 Low-Voltage Cabling</li>
        <li>• Security System Retrofits & Upgrades</li>
      </ul>
    </div>

    <div className="mt-8 space-x-4">
      <Link href="/contact">
        <span className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer">
          Request a Quote
        </span>
      </Link>

      <Link href="/services">
        <span className="bg-gray-600 text-white px-6 py-3 rounded-lg cursor-pointer">
          View Services
        </span>
      </Link>
    </div>
  </div>
</>

  );
}
