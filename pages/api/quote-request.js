import { randomUUID } from "crypto";

const HUBSPOT_BASE_URL = "https://api.hubapi.com";

/* =========================================================
   QUOTE FORM SECURITY / VALIDATION
========================================================= */

const ALLOWED_REQUEST_TYPES = new Set([
  "Volume laptops and computers",
  "Workstations, servers, or displays",
  "Network and connectivity equipment",
  "Commercial camera or security system",
  "Technology risk assessment",
  "Other commercial technology request",
]);

const LIMITS = {
  name: 100,
  company: 150,
  email: 254,
  phone: 40,
  requestType: 100,
  quantity: 40,
  deliveryLocation: 150,
  timeline: 120,
  requirements: 5000,
};

/*
 * Once formStartedAt is added to the contact page,
 * submissions faster than this are rejected.
 *
 * A legitimate person cannot realistically load,
 * read, complete, and submit the commercial form
 * in under 2.5 seconds.
 */
const MIN_FORM_COMPLETION_MS = 2500;

/*
 * Reject obviously stale/replayed form timestamps.
 */
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

function isBlank(value) {
  return (
    typeof value !== "string" ||
    value.trim() === ""
  );
}

function cleanText(value, maxLength) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function normalizeEmail(value) {
  return cleanText(value, LIMITS.email).toLowerCase();
}

function isValidEmail(email) {
  if (!email || email.length > LIMITS.email) {
    return false;
  }

  /*
   * Intentionally practical rather than RFC-maximal.
   * We want normal business email addresses.
   */
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
    email
  );
}

function normalizePhone(value) {
  return cleanText(value, LIMITS.phone);
}

function isValidPhone(phone) {
  if (!phone) {
    return true;
  }

  const digits = phone.replace(/\D/g, "");

  return digits.length >= 7 && digits.length <= 15;
}

/*
 * Accept:
 *
 * 17
 * 17 units
 * 17 systems
 * 17 devices
 * 17 pcs
 *
 * Reject:
 *
 * bUXCNXBrUbKJyhbZ
 * seventeen
 * 17x
 */
function parseQuantity(quantity) {
  const value = cleanText(
    quantity,
    LIMITS.quantity
  );

  if (!value) {
    return undefined;
  }

  const match = value.match(
    /^(\d{1,6})(?:\s*(?:units?|systems?|devices?|pcs?|pieces?))?$/i
  );

  if (!match) {
    return undefined;
  }

  const parsed = Number(match[1]);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed <= 0 ||
    parsed > 100000
  ) {
    return undefined;
  }

  return parsed;
}

/*
 * Catch the type of random machine-generated strings
 * that just hit the form:
 *
 * FEPYgrSPQkspkNFBsblKYe
 * mmEodeNyrIYFddktaXpZR
 *
 * We keep this conservative to avoid rejecting normal
 * company names or technical requirements.
 */
function looksLikeBotToken(value) {
  const text = String(value || "").trim();

  if (text.length < 18) {
    return false;
  }

  /*
   * Normal sentences, names with spaces, addresses,
   * punctuation, etc. are not treated as bot tokens.
   */
  if (/\s/.test(text)) {
    return false;
  }

  if (!/^[A-Za-z0-9]+$/.test(text)) {
    return false;
  }

  const hasUpper = /[A-Z]/.test(text);
  const hasLower = /[a-z]/.test(text);
  const hasDigit = /\d/.test(text);

  let caseTransitions = 0;

  for (let i = 1; i < text.length; i += 1) {
    const previous = text[i - 1];
    const current = text[i];

    const previousUpper =
      previous >= "A" && previous <= "Z";

    const currentUpper =
      current >= "A" && current <= "Z";

    if (
      /[A-Za-z]/.test(previous) &&
      /[A-Za-z]/.test(current) &&
      previousUpper !== currentUpper
    ) {
      caseTransitions += 1;
    }
  }

  return (
    hasUpper &&
    hasLower &&
    (hasDigit || caseTransitions >= 4)
  );
}

function splitName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/);

  return {
    firstname: parts[0] || "",
    lastname: parts.slice(1).join(" ") || "",
  };
}

function normalizeSubmission(body = {}) {
  const numericQuantity =
    parseQuantity(body.quantity);

  return {
    name: cleanText(
      body.name,
      LIMITS.name
    ),

    company: cleanText(
      body.company,
      LIMITS.company
    ),

    email: normalizeEmail(
      body.email
    ),

    phone: normalizePhone(
      body.phone
    ),

    requestType: cleanText(
      body.requestType,
      LIMITS.requestType
    ),

    /*
     * Downstream systems receive a clean integer string.
     */
    quantity:
      numericQuantity === undefined
        ? cleanText(
            body.quantity,
            LIMITS.quantity
          )
        : String(numericQuantity),

    numericQuantity,

    deliveryLocation: cleanText(
      body.deliveryLocation,
      LIMITS.deliveryLocation
    ),

    timeline: cleanText(
      body.timeline,
      LIMITS.timeline
    ),

    requirements: cleanText(
      body.requirements,
      LIMITS.requirements
    ),

    /*
     * Hidden anti-bot field.
     *
     * A human should never populate this.
     */
    website: cleanText(
      body.website,
      250
    ),

    /*
     * Browser timestamp generated when the form loads.
     */
    formStartedAt:
      body.formStartedAt === null ||
      body.formStartedAt === undefined
        ? ""
        : String(body.formStartedAt),
  };
}

function validateSubmission(data) {
  const errors = [];

  /* -----------------------------------------------------
     Required fields
  ----------------------------------------------------- */

  if (isBlank(data.name)) {
    errors.push("Name is required.");
  }

  if (isBlank(data.company)) {
    errors.push("Company is required.");
  }

  if (isBlank(data.email)) {
    errors.push("Email is required.");
  }

  if (isBlank(data.requestType)) {
    errors.push("Request type is required.");
  }

  if (isBlank(data.requirements)) {
    errors.push(
      "Project requirements are required."
    );
  }

  /* -----------------------------------------------------
     Length / format
  ----------------------------------------------------- */

  if (
    data.name &&
    data.name.length < 2
  ) {
    errors.push("Name is too short.");
  }

  if (
    data.company &&
    data.company.length < 2
  ) {
    errors.push("Company is too short.");
  }

  if (
    data.requirements &&
    data.requirements.length < 4
  ) {
    errors.push(
      "Please provide additional project requirements."
    );
  }

  if (
    data.email &&
    !isValidEmail(data.email)
  ) {
    errors.push(
      "Please provide a valid email address."
    );
  }

  if (
    data.phone &&
    !isValidPhone(data.phone)
  ) {
    errors.push(
      "Please provide a valid phone number."
    );
  }

  /* -----------------------------------------------------
     Request-type allowlist

     This exactly matches the current contact form.
  ----------------------------------------------------- */

  if (
    data.requestType &&
    !ALLOWED_REQUEST_TYPES.has(
      data.requestType
    )
  ) {
    errors.push(
      "Please select a valid request type."
    );
  }

  /* -----------------------------------------------------
     Quantity validation

     Quantity remains optional, but if someone supplies
     it, it must actually represent a quantity.
  ----------------------------------------------------- */

  if (
    data.quantity &&
    data.numericQuantity === undefined
  ) {
    errors.push(
      "Estimated quantity must be a number such as 17 or 17 systems."
    );
  }

  /* -----------------------------------------------------
     Garbage-string detection
  ----------------------------------------------------- */

  if (looksLikeBotToken(data.name)) {
    errors.push(
      "The submitted name could not be validated."
    );
  }

  if (
    data.timeline &&
    looksLikeBotToken(data.timeline)
  ) {
    errors.push(
      "The submitted timeline could not be validated."
    );
  }

  if (
    data.deliveryLocation &&
    looksLikeBotToken(
      data.deliveryLocation
    )
  ) {
    errors.push(
      "The submitted delivery location could not be validated."
    );
  }

  if (
    data.requirements &&
    looksLikeBotToken(
      data.requirements
    )
  ) {
    errors.push(
      "The submitted project requirements could not be validated."
    );
  }

  return errors;
}

/* =========================================================
   BOT / HONEYPOT CHECKS
========================================================= */

function isHoneypotTriggered(data) {
  /*
   * The field is hidden from legitimate users.
   * Bots commonly populate every available input.
   */
  return Boolean(data.website);
}

function checkSubmissionSpeed(data) {
  /*
   * IMPORTANT:
   *
   * Current contact.js does not yet send formStartedAt.
   * Therefore the API remains backward-compatible today.
   *
   * As soon as we add formStartedAt to contact.js,
   * this check activates automatically.
   */
  if (!data.formStartedAt) {
    return {
      checked: false,
      valid: true,
    };
  }

  const startedAt = Number(
    data.formStartedAt
  );

  if (
    !Number.isFinite(startedAt) ||
    startedAt <= 0
  ) {
    return {
      checked: true,
      valid: false,
      reason: "invalid_timestamp",
    };
  }

  const elapsed =
    Date.now() - startedAt;

  if (elapsed < MIN_FORM_COMPLETION_MS) {
    return {
      checked: true,
      valid: false,
      reason: "submitted_too_fast",
      elapsed,
    };
  }

  if (elapsed > MAX_FORM_AGE_MS) {
    return {
      checked: true,
      valid: false,
      reason: "stale_form",
      elapsed,
    };
  }

  return {
    checked: true,
    valid: true,
    elapsed,
  };
}

/* =========================================================
   HUBSPOT
========================================================= */

async function hubspotRequest(
  path,
  options = {}
) {
  const response = await fetch(
    `${HUBSPOT_BASE_URL}${path}`,
    {
      ...options,

      headers: {
        Authorization:
          `Bearer ${process.env.HUBSPOT_SERVICE_KEY}`,

        "Content-Type":
          "application/json",

        ...(options.headers || {}),
      },
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      `HubSpot request failed: ${response.status}`
    );

    error.details = data;

    throw error;
  }

  return data;
}

async function findContactByEmail(
  email
) {
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

async function findCompanyByName(
  company
) {
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

  const {
    firstname,
    lastname,
  } = splitName(name);

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

async function createOrUpdateCompany(
  company
) {
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
          dealname:
            `${company} — ${requestType}`,

          pipeline: "default",

          /*
           * Existing HubSpot stage mapping:
           * New Opportunity
           */
          dealstage:
            "appointmentscheduled",

          description,

          request_type:
            requestType,

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

  const deal =
    await createHubSpotDeal({
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

      contactId:
        contact.id,

      companyId:
        hubspotCompany.id,
    });

  return {
    contactId:
      contact.id,

    companyId:
      hubspotCompany.id,

    dealId:
      deal.id,
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
        apikey:
          secretKey,

        "Content-Type":
          "application/json",

        Accept:
          "application/json",
      },

      body: JSON.stringify({
        p_request_id:
          requestId,

        p_name:
          name,

        p_company:
          company,

        p_email:
          email,

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
   RESEND
========================================================= */

async function sendQuoteEmail({
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
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

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

        reply_to:
          email,

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
    const error = new Error(
      `Resend request failed: ${resendResponse.status}`
    );

    error.details =
      resendData;

    throw error;
  }

  return resendData;
}

/* =========================================================
   API ROUTE
========================================================= */

export default async function handler(
  req,
  res
) {
  if (req.method !== "POST") {
    res.setHeader(
      "Allow",
      "POST"
    );

    return res.status(405).json({
      error:
        "Method not allowed",
    });
  }

  try {
    const submission =
      normalizeSubmission(
        req.body || {}
      );

    /* =====================================================
       HONEYPOT

       A legitimate user never sees/fills "website".

       We intentionally return a normal-looking success
       response to bots so they do not learn which check
       blocked them.

       NOTHING is sent to Resend, HubSpot, or Supabase.
    ===================================================== */

    if (
      isHoneypotTriggered(
        submission
      )
    ) {
      console.warn(
        "Quote request blocked by honeypot."
      );

      return res.status(200).json({
        success: true,
        message:
          "Quote request received.",
      });
    }

    /* =====================================================
       SUBMISSION SPEED
    ===================================================== */

    const speedCheck =
      checkSubmissionSpeed(
        submission
      );

    if (!speedCheck.valid) {
      console.warn(
        "Quote request blocked by submission-speed check:",
        {
          reason:
            speedCheck.reason,

          elapsed:
            speedCheck.elapsed,
        }
      );

      return res.status(400).json({
        error:
          "Please reload the form and try again.",
      });
    }

    /* =====================================================
       SERVER-SIDE FIELD VALIDATION
    ===================================================== */

    const validationErrors =
      validateSubmission(
        submission
      );

    if (
      validationErrors.length > 0
    ) {
      console.warn(
        "Quote request rejected by validation:",
        {
          errors:
            validationErrors,

          requestType:
            submission.requestType,

          emailDomain:
            submission.email.includes("@")
              ? submission.email
                  .split("@")[1]
              : null,
        }
      );

      return res.status(400).json({
        error:
          validationErrors[0],

        /*
         * Keep the complete list available to our
         * own frontend while we are developing.
         */
        validationErrors,
      });
    }

    const {
      name,
      company,
      email,
      phone,
      requestType,
      numericQuantity,
      deliveryLocation,
      timeline,
      requirements,
    } = submission;

    /*
     * Use the normalized numeric quantity everywhere
     * downstream.
     */
    const quantity =
      numericQuantity === undefined
        ? ""
        : String(
            numericQuantity
          );

    /*
     * One correlation ID for:
     *
     * Resend
     * HubSpot
     * SecureVolt CRM
     */
    const requestId =
      randomUUID();

    /* =====================================================
       RESEND FIRST

       Email remains our first durable notification.
       If this fails, we do not tell the customer the
       request succeeded.
    ===================================================== */

    try {
      await sendQuoteEmail({
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
      });
    } catch (error) {
      console.error(
        "Resend error:",
        error?.details ||
          error
      );

      return res.status(500).json({
        error:
          "Unable to send quote request.",
      });
    }

    /* =====================================================
       CRM SYNCS

       Email already succeeded.

       HubSpot and native SecureVolt CRM now run
       independently.

       A CRM failure must NOT make the customer submit
       the same lead twice.
    ===================================================== */

    const [
      hubspotResult,
      secureVoltCRMResult,
    ] =
      await Promise.allSettled([
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
