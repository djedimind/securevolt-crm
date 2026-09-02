const HUBSPOT_BASE_URL = "https://api.hubapi.com";

async function hubspotRequest(path, options = {}) {
  const response = await fetch(`${HUBSPOT_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(`HubSpot request failed: ${response.status}`);
    error.details = data;
    throw error;
  }

  return data;
}

async function findContactByEmail(email) {
  const data = await hubspotRequest("/crm/v3/objects/contacts/search", {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email,
            },
          ],
        },
      ],
      properties: ["email", "firstname", "lastname", "phone"],
      limit: 1,
    }),
  });

  return data.results?.[0] || null;
}

async function findCompanyByName(company) {
  const data = await hubspotRequest("/crm/v3/objects/companies/search", {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "name",
              operator: "EQ",
              value: company,
            },
          ],
        },
      ],
      properties: ["name"],
      limit: 1,
    }),
  });

  return data.results?.[0] || null;
}

function splitName(name) {
  const parts = name.trim().split(/\s+/);

  return {
    firstname: parts[0] || "",
    lastname: parts.slice(1).join(" ") || "",
  };
}

async function createOrUpdateContact({ name, email, phone }) {
  const existingContact = await findContactByEmail(email);
  const { firstname, lastname } = splitName(name);

  const properties = {
    email,
    firstname,
    lastname,
  };

  if (phone) {
    properties.phone = phone;
  }

  if (existingContact) {
    return hubspotRequest(
      `/crm/v3/objects/contacts/${existingContact.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      }
    );
  }

  return hubspotRequest("/crm/v3/objects/contacts", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
}

async function createOrUpdateCompany(company) {
  const existingCompany = await findCompanyByName(company);

  if (existingCompany) {
    return hubspotRequest(
      `/crm/v3/objects/companies/${existingCompany.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          properties: {
            name: company,
          },
        }),
      }
    );
  }

  return hubspotRequest("/crm/v3/objects/companies", {
    method: "POST",
    body: JSON.stringify({
      properties: {
        name: company,
      },
    }),
  });
}

async function createDeal({
  name,
  company,
  email,
  phone,
  requestType,
  quantity,
  deliveryLocation,
  timeline,
  requirements,
  contactId,
  companyId,
}) {
  const description = `
SECUREVOLT WEBSITE QUOTE REQUEST

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

Source: securevoltsolutions.com
  `.trim();

  return hubspotRequest("/crm/v3/objects/deals", {
    method: "POST",
    body: JSON.stringify({
      properties: {
  dealname: `${company} — ${requestType}`,
  pipeline: "default",

  // Internal HubSpot stage ID displayed as "New Opportunity".
  dealstage: "appointmentscheduled",

  // Full submission retained as a readable deal summary.
  description,

  // SecureVolt custom deal properties.
  request_type: requestType,
  procurement_volume: quantity ? Number(quantity) : undefined,
  delivery_location: deliveryLocation || "",
  required_timeline: timeline || "",
  project_requirements: requirements,
},
      associations: [
        {
          to: {
            id: contactId,
          },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 3,
            },
          ],
        },
        {
          to: {
            id: companyId,
          },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 5,
            },
          ],
        },
      ],
    }),
  });
}

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

    // Keep the existing Resend notification flow.
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

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", resendData);

      return res.status(500).json({
        error: "Unable to send quote request.",
      });
    }

    // The customer's request has already been safely delivered by email.
    // CRM synchronization happens next. A HubSpot problem should not force
    // the customer to resubmit and potentially create duplicate requests.
    try {
      const [contact, hubspotCompany] = await Promise.all([
        createOrUpdateContact({
          name,
          email,
          phone,
        }),
        createOrUpdateCompany(company),
      ]);

      const deal = await createDeal({
        name,
        company,
        email,
        phone,
        requestType,
        quantity,
        deliveryLocation,
        timeline,
        requirements,
        contactId: contact.id,
        companyId: hubspotCompany.id,
      });

      console.log("HubSpot lead created:", {
        contactId: contact.id,
        companyId: hubspotCompany.id,
        dealId: deal.id,
      });
    } catch (hubspotError) {
      console.error(
        "HubSpot sync error:",
        hubspotError.details || hubspotError
      );
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
