import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Welcome to SecureVolt Solutions</title>
        <meta name="description" content="Your trusted provider for VoIP, SIP Trunking, and Business Security Solutions." />
      </Head>
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-4xl font-bold text-blue-600">SecureVolt Solutions</h1>
        <p className="mt-4 text-lg">
          Powering businesses with VoIP, SIP Trunking, and AI-driven security solutions.
        </p>
        <div className="mt-6 space-x-4">
          <Link href="/services/voip">
            <span className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer">Explore VoIP Services</span>
          </Link>
          <Link href="/contact">
            <span className="bg-gray-600 text-white px-6 py-3 rounded-lg cursor-pointer">Contact Us</span>
          </Link>
        </div>
      </div>
    </>
  );
}
