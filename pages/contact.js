import { useState } from "react";
import Head from "next/head";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert("Form submitted! We will contact you soon.");
    // TODO: Send form data to backend API (Next.js API Route)
  };

  return (
    <>
      <Head>
        <title>Contact Us | SecureVolt Solutions</title>
      </Head>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-blue-600">Get in Touch</h1>
        <p className="mt-4 text-lg">Have questions? Let’s talk about how SecureVolt can help your business.</p>
        <form className="mt-6" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Your Name" className="w-full p-3 border rounded-lg mb-4" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Your Email" className="w-full p-3 border rounded-lg mb-4" onChange={handleChange} required />
          <textarea name="message" placeholder="Your Message" className="w-full p-3 border rounded-lg mb-4" onChange={handleChange} required />
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg">Send Message</button>
        </form>
      </div>
    </>
  );
}
