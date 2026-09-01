export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      company,
      email,
      phone,
      requestType,
      quantity,
      deliveryLocation,
      timeline,
      requirements,
    } = req.body;

    if (!name || !company || !email || !requestType || !requirements) {
      return res.status(400).json({
        error: "Please complete all required fields.",
      });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SecureVolt Website <quotes@securevoltsolutions.com>",
        to: ["dispatch@securevoltsolutions.com"],
        reply_to: email,
        subject: `New Commercial Quote Request — ${company}`,
        text: `
NEW SECUREVOLT COMMERCIAL QUOTE REQUEST

CONTACT
Name: ${name}
Company: ${company}
Email: ${email}
Phone: ${phone || "Not provided"}

REQUEST
Request Type: ${requestType}
Estimated Quantity: ${quantity || "Not provided"}
Delivery Location: ${deliveryLocation || "Not provided"}
Required Timeline: ${timeline || "Not provided"}

PROJECT REQUIREMENTS
${requirements}

Submitted through securevoltsolutions.com
        `.trim(),
      }),
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", data);

      return res.status(500).json({
        error: "Unable to send quote request.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quote request received.",
    });
  } catch (error) {
    console.error("Quote request error:", error);

    return res.status(500).json({
      error: "Something went wrong while submitting the request.",
    });
  }
}
