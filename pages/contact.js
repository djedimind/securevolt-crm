import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export default function Contact() {
    const formStartedAt = useRef(Date.now());
  async function handleSubmit(event) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

        const payload = {
      name: form.get("name"),
      company: form.get("company"),
      email: form.get("email"),
      phone: form.get("phone"),
      requestType: form.get("requestType"),
      quantity: form.get("quantity"),
      deliveryLocation: form.get("deliveryLocation"),
      timeline: form.get("timeline"),
      requirements: form.get("message"),

      // Anti-bot signals
      website: form.get("website") || "",
      formStartedAt: formStartedAt.current,
    };

    try {
      const response = await fetch("/api/quote-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit quote request.");
      }

      alert(
        "Your commercial quote request has been received. SecureVolt will review the requirements and follow up."
      );

      formElement.reset();
            formStartedAt.current = Date.now();
    } catch (error) {
      console.error("Quote submission error:", error);

      alert(
        "We could not submit your request. Please try again or email dispatch@securevoltsolutions.com."
      );
    }
  }

  return (
    <>
      <Head>
        <title>Request a Commercial Quote | SecureVolt Solutions</title>

        <meta
          name="description"
          content="Request a commercial hardware, security infrastructure, network, or technology assessment quote from SecureVolt Solutions Incorporated."
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </Head>

      <main>
        <header className="siteHeader">
          <div className="headerInner">
            <Link
              className="brand"
              href="/"
              aria-label="SecureVolt Solutions home"
            >
              <span className="brandLogo">
                <Image
                  src="/securevolt-logo.png"
                  alt="SecureVolt Solutions Incorporated"
                  fill
                  priority
                  sizes="190px"
                />
              </span>
            </Link>

            <nav>
              <Link href="/#solutions">Solutions</Link>
              <Link href="/#process">Process</Link>
              <Link href="/#about">About</Link>

              <Link className="navButton" href="/">
                Back to Home
              </Link>
            </nav>
          </div>
        </header>

        <section className="hero">
          <div className="heroInner">
            <span className="eyebrow">Commercial Quote Request</span>

            <h1>
              Tell us what your
              <span>organization needs.</span>
            </h1>

            <p>
              Send your quantity, specifications, warranty requirements,
              delivery location, and desired timeline. SecureVolt will review
              the request and begin sourcing the appropriate commercial
              solution.
            </p>
          </div>
        </section>

        <section className="contactSection">
          <div className="contactGrid">
            <form className="quoteForm" onSubmit={handleSubmit}>
                              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  width: "1px",
                  height: "1px",
                  overflow: "hidden",
                }}
              >
                <label>
                  Website
                  <input
                    name="website"
                    type="text"
                    tabIndex="-1"
                    autoComplete="off"
                  />
                </label>
              </div>
              <div className="formHeading">
                <span>Start Your Request</span>

                <h2>Commercial technology quote</h2>

                <p>
                  Provide as much information as possible. Missing details can
                  be confirmed during follow-up.
                </p>
              </div>

              <div className="fieldGrid">
                <label>
                  Name
                  <input
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                  />
                </label>

                <label>
                  Company
                  <input
                    name="company"
                    type="text"
                    autoComplete="organization"
                    required
                  />
                </label>

                <label>
                  Business email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>

                <label>
                  Phone
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                  />
                </label>

                <label>
                  Request type
                  <select
                    name="requestType"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Select a service
                    </option>

                    <option>Volume laptops and computers</option>
                    <option>Workstations, servers, or displays</option>
                    <option>Network and connectivity equipment</option>
                    <option>Commercial camera or security system</option>
                    <option>Technology risk assessment</option>
                    <option>Other commercial technology request</option>
                  </select>
                </label>

                <label>
                  Estimated quantity
                  <input
                    name="quantity"
                    type="text"
                    placeholder="Example: 17 systems"
                  />
                </label>

                <label>
                  Delivery location
                  <input
                    name="deliveryLocation"
                    type="text"
                    placeholder="City, state, and ZIP code"
                  />
                </label>

                <label>
                  Required timeline
                  <input
                    name="timeline"
                    type="text"
                    placeholder="Example: Within 14 days"
                  />
                </label>
              </div>

              <label className="messageField">
                Specifications and project requirements
                <textarea
                  name="message"
                  rows="8"
                  placeholder="Include processor, memory, storage, display, operating system, warranty, security, network, delivery, or installation requirements."
                  required
                />
              </label>

              <button type="submit">
                Submit Commercial Quote Request
              </button>

              <p className="formNote">
                Your request will be sent securely to SecureVolt for review.
              </p>
            </form>

            <aside className="contactCard">
              <span className="cardLabel">What Happens Next</span>

              <h2>A clear commercial sourcing process</h2>

              <div className="step">
                <strong>01</strong>

                <div>
                  <h3>Requirements review</h3>

                  <p>
                    We review the requested equipment, quantity,
                    configuration, support coverage, and delivery
                    requirements.
                  </p>
                </div>
              </div>

              <div className="step">
                <strong>02</strong>

                <div>
                  <h3>Commercial sourcing</h3>

                  <p>
                    SecureVolt checks appropriate manufacturer and
                    distribution channels for matched inventory.
                  </p>
                </div>
              </div>

              <div className="step">
                <strong>03</strong>

                <div>
                  <h3>Complete quotation</h3>

                  <p>
                    You receive pricing, warranty details, estimated taxes,
                    delivery information, and applicable terms.
                  </p>
                </div>
              </div>

              <div className="directContact">
                <span>Direct email</span>

                <a href="mailto:dispatch@securevoltsolutions.com">
                  dispatch@securevoltsolutions.com
                </a>

                <p>
                  Nationwide hardware sourcing and delivery. Northeast Ohio
                  onsite technology and security services.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <footer>
          <div>
            <strong>SecureVolt Solutions Incorporated</strong>

            <span>
              Commercial Technology Procurement & Security Solutions
            </span>
          </div>

          <div>
            <span>Nationwide hardware sourcing and delivery</span>
            <span>Northeast Ohio onsite services</span>
          </div>
        </footer>
      </main>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(body) {
          margin: 0;
          background: #f4f7f5;
          color: #102018;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        :global(a) {
          color: inherit;
        }

        main {
          min-height: 100vh;
        }

        .siteHeader {
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          background: #050807;
        }

        .headerInner {
          width: min(1180px, calc(100% - 40px));
          min-height: 76px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .brand {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .brandLogo {
          position: relative;
          display: block;
          width: 190px;
          height: 52px;
          flex-shrink: 0;
        }

        .brandLogo :global(img) {
          object-fit: contain;
          object-position: left center;
        }

        nav {
          display: flex;
          align-items: center;
          gap: 27px;
        }

        nav a {
          color: #c9d2cc;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        nav a:hover {
          color: white;
        }

        nav .navButton {
          padding: 11px 18px;
          border-radius: 8px;
          background: #39ff14;
          color: #071008;
          font-weight: 850;
        }

        .hero {
          padding: 95px 20px 105px;
          background:
            radial-gradient(
              circle at top right,
              rgba(57, 255, 20, 0.16),
              transparent 34%
            ),
            linear-gradient(135deg, #050807, #101713 60%, #071008);
          color: white;
        }

        .heroInner {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .eyebrow,
        .formHeading > span,
        .cardLabel {
          color: #39ff14;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        h1 {
          max-width: 850px;
          margin: 20px 0 24px;
          font-size: clamp(48px, 7vw, 78px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }

        h1 span {
          display: block;
          color: #39ff14;
        }

        .hero p {
          max-width: 760px;
          margin: 0;
          color: #b5c4ba;
          font-size: 19px;
          line-height: 1.75;
        }

        .contactSection {
          padding: 90px 20px;
        }

        .contactGrid {
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns:
            minmax(0, 1.25fr)
            minmax(340px, 0.75fr);
          gap: 32px;
          align-items: start;
        }

        .quoteForm,
        .contactCard {
          border: 1px solid #dce6df;
          border-radius: 18px;
          background: white;
          box-shadow: 0 22px 60px rgba(17, 45, 28, 0.08);
        }

        .quoteForm {
          padding: 44px;
        }

        .formHeading h2,
        .contactCard h2 {
          margin: 12px 0 14px;
          color: #102018;
          font-size: 34px;
          line-height: 1.1;
          letter-spacing: -0.04em;
        }

        .formHeading p {
          margin: 0 0 35px;
          color: #66766c;
          line-height: 1.7;
        }

        .fieldGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #1a2b20;
          font-size: 13px;
          font-weight: 800;
        }

        input,
        select,
        textarea {
          width: 100%;
          border: 1px solid #cdd9d0;
          border-radius: 9px;
          background: #fbfdfb;
          color: #102018;
          font: inherit;
          font-weight: 500;
          outline: none;
        }

        input,
        select {
          min-height: 49px;
          padding: 0 14px;
        }

        textarea {
          padding: 14px;
          resize: vertical;
          line-height: 1.55;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #20d968;
          box-shadow: 0 0 0 3px rgba(32, 217, 104, 0.12);
        }

        .messageField {
          margin-top: 22px;
        }

        button {
          width: 100%;
          min-height: 54px;
          margin-top: 24px;
          border: 0;
          border-radius: 9px;
          background: linear-gradient(135deg, #39ff14, #20d968);
          color: #061008;
          cursor: pointer;
          font-size: 15px;
          font-weight: 900;
        }

        button:hover {
          transform: translateY(-1px);
        }

        .formNote {
          margin: 13px 0 0;
          color: #748078;
          font-size: 12px;
          text-align: center;
        }

        .contactCard {
          padding: 38px;
          background: #0b120e;
          color: white;
        }

        .contactCard h2 {
          margin-bottom: 30px;
          color: white;
        }

        .step {
          padding: 24px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.11);
          display: grid;
          grid-template-columns: 42px 1fr;
          gap: 15px;
        }

        .step > strong {
          color: #39ff14;
          font-size: 12px;
        }

        .step h3 {
          margin: 0 0 7px;
          font-size: 16px;
        }

        .step p {
          margin: 0;
          color: #aebbb2;
          font-size: 13px;
          line-height: 1.65;
        }

        .directContact {
          margin-top: 22px;
          padding: 24px;
          border-radius: 12px;
          background: rgba(57, 255, 20, 0.07);
        }

        .directContact > span {
          display: block;
          color: #39ff14;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .directContact a {
          margin-top: 10px;
          display: block;
          color: white;
          font-size: 15px;
          font-weight: 800;
          word-break: break-word;
        }

        .directContact p {
          margin: 15px 0 0;
          color: #aebbb2;
          font-size: 12px;
          line-height: 1.65;
        }

        footer {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 35px 0 45px;
          border-top: 1px solid #dce4df;
          display: flex;
          justify-content: space-between;
          gap: 30px;
          color: #65736a;
          font-size: 12px;
        }

        footer strong,
        footer span {
          display: block;
        }

        footer strong {
          margin-bottom: 6px;
          color: #102018;
          font-size: 14px;
        }

        footer > div:last-child {
          text-align: right;
          line-height: 1.8;
        }

        @media (max-width: 900px) {
          nav a:not(.navButton) {
            display: none;
          }

          .contactGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .headerInner {
            width: min(100% - 24px, 1180px);
          }

          .brandLogo {
            width: 120px;
          }

          .hero {
            padding-top: 70px;
            padding-bottom: 75px;
          }

          h1 {
            font-size: 47px;
          }

          .contactSection {
            padding: 55px 14px;
          }

          .quoteForm,
          .contactCard {
            padding: 26px;
          }

          .fieldGrid {
            grid-template-columns: 1fr;
          }

          footer {
            width: min(100% - 28px, 1180px);
            flex-direction: column;
          }

          footer > div:last-child {
            text-align: left;
          }
        }
      `}</style>
    </>
  );
}
