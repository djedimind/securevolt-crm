import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const capabilities = [
  {
    title: "Commercial Hardware Procurement",
    text: "Business laptops, desktops, workstations, servers, displays, phones, and employee technology packages.",
  },
  {
    title: "Security Infrastructure",
    text: "Commercial cameras, video-recording systems, access control, alarm equipment, and security-system assessments.",
  },
  {
    title: "Network & Connectivity",
    text: "Firewalls, switches, wireless infrastructure, structured cabling, internet connectivity, and business communications.",
  },
  {
    title: "Technology Risk Assessments",
    text: "Identify equipment gaps, security blind spots, aging infrastructure, connectivity problems, and operational exposure.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Submit Your Requirements",
    text: "Tell us the quantity, specifications, delivery location, warranty requirements, and desired timeline.",
  },
  {
    number: "02",
    title: "We Source the Solution",
    text: "SecureVolt works through manufacturer and distribution channels to locate matched commercial equipment.",
  },
  {
    number: "03",
    title: "Receive a Complete Quote",
    text: "Your quote includes equipment, warranty options, delivery details, estimated taxes, and applicable services.",
  },
  {
    number: "04",
    title: "Order Coordination",
    text: "We manage distributor communication, order validation, delivery tracking, and project coordination.",
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>
          SecureVolt Solutions | Commercial Technology Procurement & Security
        </title>

        <meta
          name="description"
          content="SecureVolt Solutions provides commercial technology procurement, business hardware sourcing, security systems, network infrastructure, and technology risk assessments."
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
              <a href="#solutions">Solutions</a>
              <a href="#process">Process</a>
              <a href="#about">About</a>
              <Link className="navButton" href="/contact">
                Request a Quote
              </Link>
            </nav>
          </div>
        </header>

        <section className="hero">
          <div className="heroGlow heroGlowOne" />
          <div className="heroGlow heroGlowTwo" />

          <div className="heroInner">
            <div className="heroContent">
              <div className="eyebrow">
                Commercial Technology Procurement & Security Solutions
              </div>

              <h1>
                Technology sourced for your business—
                <span>without the procurement headache.</span>
              </h1>

              <p className="heroText">
                SecureVolt helps organizations source commercial hardware,
                coordinate volume purchases, strengthen security systems, and
                reduce technology-related operational risk.
              </p>

              <div className="heroActions">
                <Link className="primaryButton" href="/contact">
                  Request a Volume Quote
                </Link>

                <a
                  className="secondaryButton"
                  href="mailto:dispatch@securevoltsolutions.com?subject=Commercial%20Technology%20Request"
                >
                  Email SecureVolt
                </a>
              </div>

              <div className="heroDetails">
                <span>Volume hardware sourcing</span>
                <span>Matched configurations</span>
                <span>Warranty coordination</span>
                <span>Commercial delivery support</span>
              </div>
            </div>

            <div className="heroPanel">
              <div className="panelLabel">Built for business purchasing</div>

              <h2>Need multiple identical systems?</h2>

              <p>
                Finding one device is easy. Sourcing an entire fleet with the
                same specifications, warranty coverage, inventory availability,
                and delivery requirements takes commercial coordination.
              </p>

              <div className="panelStats">
                <div>
                  <strong>1–500+</strong>
                  <span>Device sourcing</span>
                </div>

                <div>
                  <strong>Business</strong>
                  <span>Grade equipment</span>
                </div>

                <div>
                  <strong>Nationwide</strong>
                  <span>Hardware delivery</span>
                </div>

                <div>
                  <strong>End-to-end</strong>
                  <span>Order management</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="trustStrip">
          <div>
            <strong>SecureVolt coordinates the entire purchasing process.</strong>
            <span>
              Requirements • Sourcing • Quoting • Warranty • Delivery
            </span>
          </div>
        </section>

        <section className="section" id="solutions">
          <div className="sectionHeading">
            <span>What We Provide</span>
            <h2>Commercial technology solutions built around your operation</h2>

            <p>
              We help businesses purchase the right equipment, strengthen their
              infrastructure, and make informed technology decisions.
            </p>
          </div>

          <div className="capabilityGrid">
            {capabilities.map((capability, index) => (
              <article className="capabilityCard" key={capability.title}>
                <span className="cardNumber">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3>{capability.title}</h3>
                <p>{capability.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="procurementSection">
          <div className="procurementInner">
            <div>
              <span className="sectionLabel">Volume Procurement</span>

              <h2>Stop piecing major purchases together from retail websites.</h2>

              <p>
                SecureVolt helps businesses source consistent configurations
                through commercial technology channels. That means fewer
                substitutions, fewer fragmented shipments, and a clearer path
                from quote to delivery.
              </p>

              <ul>
                <li>Business laptops and AI PCs</li>
                <li>Desktop and workstation refreshes</li>
                <li>Employee onboarding technology packages</li>
                <li>Servers, firewalls, switches, and wireless equipment</li>
                <li>Commercial cameras and recording systems</li>
                <li>Manufacturer warranty and support options</li>
              </ul>
            </div>

            <aside className="quoteBox">
              <span>Common quote information</span>

              <h3>What should you send us?</h3>

              <div className="quoteItem">
                <strong>Quantity</strong>
                <p>How many units are required?</p>
              </div>

              <div className="quoteItem">
                <strong>Specifications</strong>
                <p>Processor, memory, storage, display, and operating system.</p>
              </div>

              <div className="quoteItem">
                <strong>Support</strong>
                <p>Warranty duration and onsite-service requirements.</p>
              </div>

              <div className="quoteItem">
                <strong>Delivery</strong>
                <p>Ship-to location and required delivery timeline.</p>
              </div>

              <Link href="/contact">Start a quote request →</Link>
            </aside>
          </div>
        </section>

        <section className="section" id="process">
          <div className="sectionHeading">
            <span>Our Process</span>
            <h2>A clear path from requirement to delivery</h2>
          </div>

          <div className="processGrid">
            {processSteps.map((step) => (
              <article className="processCard" key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="aboutSection" id="about">
          <div className="aboutInner">
            <div>
              <span className="sectionLabel">About SecureVolt</span>

              <h2>Technology procurement informed by field experience</h2>
            </div>

            <div>
              <p>
                SecureVolt Solutions Incorporated combines commercial
                technology sourcing with practical experience across network,
                security, communications, and business infrastructure
                environments.
              </p>

              <p>
                Our role is to help organizations identify what they need,
                source appropriate solutions, and coordinate the details
                required to move from a technical requirement to a completed
                commercial purchase.
              </p>
            </div>
          </div>
        </section>

        <section className="finalCta">
          <div>
            <span>Planning a technology purchase?</span>
            <h2>Tell us what your organization needs.</h2>

            <p>
              Send the quantity, specifications, delivery location, and desired
              timeline. SecureVolt will review the request and begin sourcing.
            </p>
          </div>

          <div className="finalCtaActions">
            <Link className="primaryButton lightButton" href="/contact">
              Request a Commercial Quote
            </Link>

            <a
              className="textLink"
              href="mailto:dispatch@securevoltsolutions.com"
            >
              dispatch@securevoltsolutions.com
            </a>
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

        :global(html) {
          scroll-behavior: smooth;
        }

        :global(body) {
          margin: 0;
          background: #f7f9fc;
          color: #102033;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        :global(a) {
          color: inherit;
        }

        main {
          min-height: 100vh;
          overflow: hidden;
        }

        .siteHeader {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(5, 8, 7, 0.96);
          backdrop-filter: blur(14px);
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
          color: white;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brandLogo {
          position: relative;
          display: block;
          width: 180px;
          height: 58px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .brandLogo :global(img) {
          object-fit: contain;
          object-position: left center;
          transform: scale(2.2);
          transform-origin: left center;
        }

        .brand strong,
        .brand small {
          display: block;
        }

        .brand strong {
          font-size: 19px;
          letter-spacing: -0.02em;
        }

        .brand small {
          margin-top: 2px;
          color: #9fb0c5;
          font-size: 10px;
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }

        nav {
          display: flex;
          align-items: center;
          gap: 27px;
        }

        nav a {
          color: #cbd5e1;
          text-decoration: none;
          font-size: 14px;
          font-weight: 650;
        }

        nav a:hover {
          color: white;
        }

        nav .navButton {
          padding: 11px 18px;
          border-radius: 8px;
          background: #39ff14;
          color: #071008 !important;
          font-weight: 850;
          box-shadow: 0 8px 24px rgba(57, 255, 20, 0.2);
        }

        .hero {
          position: relative;
          background:
            radial-gradient(
              circle at top right,
              rgba(57, 255, 20, 0.14),
              transparent 32%
            ),
            linear-gradient(135deg, #050807, #101713 58%, #071008);
          color: white;
        }

        .heroGlow {
          position: absolute;
          border-radius: 999px;
          filter: blur(10px);
          pointer-events: none;
        }

        .heroGlowOne {
          width: 320px;
          height: 320px;
          top: -150px;
          right: 12%;
          background: rgba(57, 255, 20, 0.12);
        }

        .heroGlowTwo {
          width: 240px;
          height: 240px;
          bottom: -120px;
          left: 3%;
          background: rgba(32, 217, 104, 0.10);
        }

        .heroInner {
          position: relative;
          z-index: 2;
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 105px 0 110px;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
          align-items: center;
          gap: 70px;
        }

        .eyebrow,
        .sectionLabel {
          color: #39ff14;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        h1 {
          max-width: 760px;
          margin: 22px 0 25px;
          font-size: clamp(46px, 6vw, 76px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }

        h1 span {
          display: block;
          color: #39ff14;
        }

        .heroText {
          max-width: 680px;
          margin: 0;
          color: #b9c7d8;
          font-size: 19px;
          line-height: 1.75;
        }

        .heroActions {
          margin-top: 36px;
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .primaryButton,
        .secondaryButton {
          min-height: 52px;
          padding: 0 22px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
        }

        .primaryButton {
          background: linear-gradient(135deg, #39ff14, #20d968);
          color: white;
          box-shadow: 0 14px 38px rgba(57, 255, 20, 0.20);
        }

        .primaryButton:hover {
          transform: translateY(-1px);
        }

        .secondaryButton {
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .heroDetails {
          margin-top: 34px;
          display: flex;
          flex-wrap: wrap;
          gap: 14px 24px;
          color: #8fa4bc;
          font-size: 12px;
          font-weight: 700;
        }

        .heroDetails span::before {
          content: "✓";
          margin-right: 7px;
          color: #39ff14;
        }

        .heroPanel {
          padding: 34px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.055);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(16px);
        }

        .panelLabel {
          color: #39ff14;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .heroPanel h2 {
          margin: 14px 0;
          font-size: 31px;
          line-height: 1.12;
          letter-spacing: -0.035em;
        }

        .heroPanel > p {
          margin: 0;
          color: #b3c1d2;
          line-height: 1.7;
        }

        .panelStats {
          margin-top: 28px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-top: 1px solid rgba(255, 255, 255, 0.11);
          border-left: 1px solid rgba(255, 255, 255, 0.11);
        }

        .panelStats div {
          min-height: 104px;
          padding: 20px;
          border-right: 1px solid rgba(255, 255, 255, 0.11);
          border-bottom: 1px solid rgba(255, 255, 255, 0.11);
        }

        .panelStats strong,
        .panelStats span {
          display: block;
        }

        .panelStats strong {
          font-size: 20px;
        }

        .panelStats span {
          margin-top: 5px;
          color: #91a4b9;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .trustStrip {
          padding: 24px 20px;
          border-bottom: 1px solid #dce5ef;
          background: white;
          text-align: center;
        }

        .trustStrip strong,
        .trustStrip span {
          display: block;
        }

        .trustStrip strong {
          font-size: 15px;
        }

        .trustStrip span {
          margin-top: 7px;
          color: #63758a;
          font-size: 12px;
          letter-spacing: 0.05em;
        }

        .section {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 100px 0;
        }

        .sectionHeading {
          max-width: 760px;
        }

        .sectionHeading > span {
          color: #0d8f4f;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .sectionHeading h2,
        .procurementSection h2,
        .aboutSection h2,
        .finalCta h2 {
          margin: 14px 0 18px;
          font-size: clamp(34px, 5vw, 52px);
          line-height: 1.07;
          letter-spacing: -0.045em;
        }

        .sectionHeading p {
          margin: 0;
          color: #607186;
          font-size: 18px;
          line-height: 1.7;
        }

        .capabilityGrid {
          margin-top: 52px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .capabilityCard {
          position: relative;
          min-height: 245px;
          padding: 34px;
          border: 1px solid #dbe5ef;
          border-radius: 15px;
          background: white;
          box-shadow: 0 16px 40px rgba(20, 48, 82, 0.055);
        }

        .cardNumber {
          color: #20d968;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .capabilityCard h3 {
          margin: 35px 0 13px;
          font-size: 23px;
          letter-spacing: -0.025em;
        }

        .capabilityCard p {
          margin: 0;
          color: #63758a;
          line-height: 1.7;
        }

        .procurementSection {
          padding: 100px 20px;
          background: #0b120e;
          color: white;
        }

        .procurementInner {
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.75fr);
          gap: 80px;
          align-items: start;
        }

        .procurementSection p {
          max-width: 690px;
          color: #aebed0;
          font-size: 17px;
          line-height: 1.75;
        }

        .procurementSection ul {
          margin: 30px 0 0;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px 30px;
          list-style: none;
        }

        .procurementSection li {
          color: #d8e2ed;
          font-size: 14px;
        }

        .procurementSection li::before {
          content: "✓";
          margin-right: 9px;
          color: #49b5ff;
          font-weight: 900;
        }

        .quoteBox {
          padding: 34px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
        }

        .quoteBox > span {
          color: #39ff14;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }

        .quoteBox h3 {
          margin: 12px 0 24px;
          font-size: 28px;
        }

        .quoteItem {
          padding: 17px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .quoteItem strong {
          font-size: 14px;
        }

        .quoteItem p {
          margin: 5px 0 0;
          font-size: 13px;
          line-height: 1.5;
        }

        .quoteBox > a {
          margin-top: 15px;
          display: inline-block;
          color: #39ff14;
          font-weight: 800;
          text-decoration: none;
        }

        .processGrid {
          margin-top: 50px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .processCard {
          padding: 28px;
          border-top: 3px solid #20d968;
          background: white;
          box-shadow: 0 15px 38px rgba(20, 48, 82, 0.06);
        }

        .processCard > span {
          color: #20d968;
          font-size: 12px;
          font-weight: 900;
        }

        .processCard h3 {
          margin: 27px 0 12px;
          font-size: 19px;
        }

        .processCard p {
          margin: 0;
          color: #65768a;
          font-size: 14px;
          line-height: 1.68;
        }

        .aboutSection {
          padding: 100px 20px;
          background: #eaf1f8;
        }

        .aboutInner {
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 80px;
        }

        .aboutInner p {
          margin: 0 0 19px;
          color: #52677d;
          font-size: 17px;
          line-height: 1.78;
        }

        .finalCta {
          width: min(1180px, calc(100% - 40px));
          margin: 90px auto;
          padding: 55px;
          border-radius: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 50px;
          background: linear-gradient(135deg, #0d5c36, #050807);
          color: white;
          box-shadow: 0 25px 70px rgba(20, 82, 156, 0.24);
        }

        .finalCta > div:first-child {
          max-width: 710px;
        }

        .finalCta > div > span {
          color: #b9ddff;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .finalCta h2 {
          margin-top: 12px;
        }

        .finalCta p {
          margin: 0;
          color: #d8e8f8;
          line-height: 1.7;
        }

        .finalCtaActions {
          min-width: 265px;
          text-align: center;
        }

        .lightButton {
          width: 100%;
          background: white;
          color: #123c70;
          box-shadow: none;
        }

        .textLink {
          margin-top: 14px;
          display: block;
          color: #d9ecff;
          font-size: 12px;
          text-decoration: none;
        }

        footer {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 34px 0 45px;
          border-top: 1px solid #dce4ed;
          display: flex;
          justify-content: space-between;
          gap: 30px;
          color: #64758a;
          font-size: 12px;
        }

        footer strong,
        footer span {
          display: block;
        }

        footer strong {
          margin-bottom: 6px;
          color: #122237;
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

          .heroInner,
          .procurementInner,
          .aboutInner {
            grid-template-columns: 1fr;
          }

          .heroInner {
            padding: 80px 0;
          }

          .heroPanel {
            max-width: 650px;
          }

          .processGrid {
            grid-template-columns: 1fr 1fr;
          }

          .finalCta {
            align-items: flex-start;
            flex-direction: column;
          }

          .finalCtaActions {
            width: 100%;
          }
        }

        @media (max-width: 620px) {
          .headerInner {
            width: min(100% - 24px, 1180px);
          }

          .brand small {
            display: none;
          }

          .heroInner,
          .section,
          .finalCta,
          footer {
            width: min(100% - 28px, 1180px);
          }

          .heroInner {
            gap: 45px;
          }

          h1 {
            font-size: 45px;
          }

          .capabilityGrid,
          .processGrid,
          .procurementSection ul {
            grid-template-columns: 1fr;
          }

          .heroPanel,
          .capabilityCard,
          .quoteBox {
            padding: 25px;
          }

          .section,
          .procurementSection,
          .aboutSection {
            padding-top: 75px;
            padding-bottom: 75px;
          }

          .finalCta {
            margin: 65px auto;
            padding: 35px 25px;
          }

          footer {
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
