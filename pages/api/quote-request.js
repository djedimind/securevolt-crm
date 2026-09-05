import { randomUUID } from "crypto";

const HUBSPOT_BASE_URL = "https://api.hubapi.com";

/* =========================================================
   SHARED HELPERS
========================================================= */

function splitName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/);

  return {
    firstname: parts[0] || "",
    lastname: parts.slice(1).join(" ") || "",
  };
}

function parseQuantity(quantity) {
  const value = String(quantity || "").trim();

  if (!/^\d+$/.test(value)) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function isBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}

/* =========================================================
   HUBSPOT
========================================================= */

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
    const error = new Error(
      `HubSpot request failed: ${response.status}`
    );

    error.details = data;
    throw error;
  }

  return data;
}

async function findContactByEmail(email) {
  const data = await hubspotRequest(
    "/crm/v3/objects/contacts/search",
    {
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
        properties: [
          "email",
          "firstname",
          "lastname",
          "phone",
        ],
        limit: 1,
      }),
    }
  );

  return data.results?.[0] || null;
}

async function findCompanyByName(company) {
  const data = await hubspotRequest(
    "/crm/v3/objects/companies/search",
    {
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
    }
  );

  return data.results?.[0] || null;
}

async function createOrUpdateContact({
  name,
  email,
  phone,
}) {
  const existingContact =
    await findContactByEmail(email);

  const { firstname, lastname } =
    splitName(name);

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
        body: JSON.stringify({
          properties,
        }),
      }
    );
  }

  return hubspotRequest(
    "/crm/v3/objects/contacts",
    {
      method: "POST",
      body: JSON.stringify({
        properties,
      }),
    }
  );
}

async function createOrUpdateCompany(company) {
  const existingCompany =
    await findCompanyByName(company);

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

  return hubspotRequest(
    "/crm/v3/objects/companies",
    {
      method: "POST",
      body: JSON.stringify({
        properties: {
          name: company,
        },
      }),
    }
  );
}

async function createHubSpotDeal({
  requestId,
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
  const numericQuantity =
    parseQuantity(quantity);

  const description = `
SECUREVOLT WEBSITE QUOTE REQUEST

REQUEST ID
${requestId}

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

  return hubspotRequest(
    "/crm/v3/objects/deals",
    {
      method: "POST",
      body: JSON.stringify({
        properties: {
          dealname: `${company} — ${requestType}`,

          pipeline: "default",

          // Internal HubSpot stage ID that displays
          // as "New Opportunity".
          dealstage: "appointmentscheduled",

          description,

          request_type: requestType,

          procurement_volume:
            numericQuantity,

          delivery_location:
            deliveryLocation || "",

          required_timeline:
            timeline || "",

          project_requirements:
            requirements,
        },

        associations: [
          {
            to: {
              id: contactId,
            },
            types: [
              {
                associationCategory:
                  "HUBSPOT_DEFINED",
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
                associationCategory:
                  "HUBSPOT_DEFINED",
                associationTypeId: 5,
              },
            ],
          },
        ],
      }),
    }
  );
}

async function syncHubSpotLead({
  requestId,
  name,
  company,
  email,
  phone,
  requestType,
  quantity,
  deliveryLocation,
  timeline,
  requirements,
}) {
  const [
    contact,
    hubspotCompany,
  ] = await Promise.all([
    createOrUpdateContact({
      name,
      email,
      phone,
    }),

    createOrUpdateCompany(company),
  ]);

  const deal = await createHubSpotDeal({
    requestId,
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

  return {
    contactId: contact.id,
    companyId: hubspotCompany.id,
    dealId: deal.id,
  };
}

/* =========================================================
   NATIVE SECUREVOLT CRM / SUPABASE
========================================================= */

async function ingestIntoSecureVoltCRM({
  requestId,
  name,
  company,
  email,
  phone,
  requestType,
  quantity,
  deliveryLocation,
  timeline,
  requirements,
}) {
  const supabaseUrl =
    process.env.SUPABASE_URL?.replace(
      /\/+$/,
      ""
    );

  const secretKey =
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "SUPABASE_URL is not configured."
    );
  }

  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not configured."
    );
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/rpc/ingest_website_quote`,
    {
      method: "POST",

      headers: {
        apikey: secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        p_request_id: requestId,

        p_name: name,

        p_company: company,

        p_email: email,

        p_phone:
          phone || "",

        p_request_type:
          requestType,

        p_quantity:
          quantity
            ? String(quantity)
            : "",

        p_delivery_location:
          deliveryLocation || "",

        p_timeline:
          timeline || "",

        p_requirements:
          requirements,
      }),
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const error = new Error(
      `SecureVolt CRM request failed: ${response.status}`
    );

    error.details = data;

    throw error;
  }

  return data;
}

/* =========================================================
   API ROUTE
========================================================= */

export default async function handler(
  req,
  res
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
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
    } = req.body || {};

    /* -----------------------------------------------------
       Validate required website fields
    ----------------------------------------------------- */

    if (
      isBlank(name) ||
      isBlank(company) ||
      isBlank(email) ||
      isBlank(requestType) ||
      isBlank(requirements)
    ) {
      return res.status(400).json({
        error:
          "Please complete all required fields.",
      });
    }

    /*
     * One correlation ID for this website submission.
     *
     * This ID is stored in the native SecureVolt CRM
     * and included in our email/HubSpot records so the
     * same request can be traced across systems.
     */
    const requestId = randomUUID();

    /* =====================================================
       RESEND
       Email remains the first durable notification.
    ===================================================== */

    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${process.env.RESEND_API_KEY}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          from:
            "SecureVolt Website <quotes@securevoltsolutions.com>",

          to: [
            "dispatch@securevoltsolutions.com",
          ],

          reply_to: email,

          subject:
            `New Commercial Quote Request — ${company}`,

          text: `
NEW SECUREVOLT COMMERCIAL QUOTE REQUEST

REQUEST ID
${requestId}

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
      }
    );

    const resendData =
      await resendResponse
        .json()
        .catch(() => ({}));

    if (!resendResponse.ok) {
      console.error(
        "Resend error:",
        resendData
      );

      return res.status(500).json({
        error:
          "Unable to send quote request.",
      });
    }

    /*
     * Email delivery succeeded.
     *
     * HubSpot and SecureVolt CRM now sync independently.
     * A failure in either CRM must not cause the customer
     * to resubmit an already-delivered request.
     */

    const [
      hubspotResult,
      secureVoltCRMResult,
    ] = await Promise.allSettled([
      syncHubSpotLead({
        requestId,
        name,
        company,
        email,
        phone,
        requestType,
        quantity,
        deliveryLocation,
        timeline,
        requirements,
      }),

      ingestIntoSecureVoltCRM({
        requestId,
        name,
        company,
        email,
        phone,
        requestType,
        quantity,
        deliveryLocation,
        timeline,
        requirements,
      }),
    ]);

    /* -----------------------------------------------------
       HubSpot result
    ----------------------------------------------------- */

    if (
      hubspotResult.status ===
      "fulfilled"
    ) {
      console.log(
        "HubSpot lead created:",
        {
          requestId,

          contactId:
            hubspotResult.value
              .contactId,

          companyId:
            hubspotResult.value
              .companyId,

          dealId:
            hubspotResult.value
              .dealId,
        }
      );
    } else {
      console.error(
        "HubSpot sync error:",
        hubspotResult.reason
          ?.details ||
          hubspotResult.reason
      );
    }

    /* -----------------------------------------------------
       Native SecureVolt CRM result
    ----------------------------------------------------- */

    if (
      secureVoltCRMResult.status ===
      "fulfilled"
    ) {
      const secureVoltLead =
        secureVoltCRMResult.value;

      console.log(
        "SecureVolt CRM lead created:",
        {
          requestId,

          organizationId:
            secureVoltLead
              ?.organization_id,

          companyId:
            secureVoltLead
              ?.company_id,

          contactId:
            secureVoltLead
              ?.contact_id,

          dealId:
            secureVoltLead
              ?.deal_id,

          duplicate:
            secureVoltLead
              ?.duplicate,
        }
      );
    } else {
      console.error(
        "SecureVolt CRM sync error:",
        secureVoltCRMResult.reason
          ?.details ||
          secureVoltCRMResult.reason
      );
    }

    /* =====================================================
       CUSTOMER RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,
      requestId,
      message:
        "Quote request received.",
    });
  } catch (error) {
    console.error(
      "Quote request error:",
      error
    );

    return res.status(500).json({
      error:
        "Something went wrong while submitting the request.",
    });
  }
}
