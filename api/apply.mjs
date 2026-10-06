/*
  POST /api/apply — receives a careers application from index.html and emails it,
  with the resume attached, from a Microsoft 365 mailbox through Microsoft Graph.

  Set these in Vercel → Project → Settings → Environment Variables:
    MS_TENANT_ID       Directory (tenant) ID of the Entra app registration
    MS_CLIENT_ID       Application (client) ID of that app registration
    MS_CLIENT_SECRET   Client secret value. It expires (24 months at most): renew it in
                       Entra and update this variable before then, or the form stops sending.
    CAREERS_SENDER     mailbox the app sends from, e.g. "info@crystronmat.com"
    CAREERS_TO         comma-separated recipients, e.g. "a@crystronmat.com, b@crystronmat.com, c@crystronmat.com"

  The app may only send as CAREERS_SENDER: Exchange Online grants it the
  "Application Mail.Send" role scoped to that one mailbox (no Mail.Send consent in Entra).
*/

// Graph rejects requests over 4 MB, and base64 encoding grows attachments by a third.
const MAX_ATTACHMENT_BYTES = 2.5 * 1024 * 1024;

// First bytes of each allowed file type, so a renamed executable can't pass as a resume.
const FILE_TYPES = {
  pdf: { signature: [0x25, 0x50, 0x44, 0x46], contentType: "application/pdf" }, // %PDF
  docx: {
    signature: [0x50, 0x4b, 0x03, 0x04], // ZIP container
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  doc: { signature: [0xd0, 0xcf, 0x11, 0xe0], contentType: "application/msword" }, // legacy Word (OLE)
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Finds addresses in CAREERS_TO whether they're split by commas, semicolons, or spaces.
const EMAILS_IN_TEXT = /[^\s@<>,;"']+@[^\s@<>,;"']+\.[^\s@<>,;"']+/g;
const FALLBACK_CONTACT = "info@crystronmat.com";
const REQUIRED_SETTINGS = ["MS_TENANT_ID", "MS_CLIENT_ID", "MS_CLIENT_SECRET", "CAREERS_SENDER", "CAREERS_TO"];

let cachedToken = null; // reused while the function instance stays warm

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return reply({ error: "Method not allowed." }, 405, { Allow: "POST" });
    }

    const missing = REQUIRED_SETTINGS.filter((name) => !setting(name));
    const recipients = (setting("CAREERS_TO").match(EMAILS_IN_TEXT) || []).filter(
      (address, i, all) => all.findIndex((other) => other.toLowerCase() === address.toLowerCase()) === i
    );
    if (missing.length || recipients.length === 0) {
      console.error(
        missing.length
          ? `Careers form is not configured. Missing Vercel environment variables for this deployment: ${missing.join(", ")}`
          : "Careers form is not configured. CAREERS_TO doesn't contain any valid email addresses."
      );
      return reply({ error: `Applications are temporarily unavailable. Please email ${FALLBACK_CONTACT}.` }, 500);
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      return reply({ error: "We couldn't read that submission. Please try again." }, 400);
    }

    // Honeypot: real visitors never see this field, bots tend to fill it in.
    if (text(form, "company_website")) return reply({ ok: true });

    const application = {
      roleId: text(form, "role_id", 80),
      roleTitle: text(form, "role_title", 150) || "General application",
      name: text(form, "name", 120),
      email: text(form, "email", 200),
      phone: text(form, "phone", 40),
      link: text(form, "link", 300),
      message: text(form, "message", 4000),
    };

    if (!application.name) return reply({ error: "Please enter your full name." }, 400);
    if (!EMAIL_PATTERN.test(application.email)) {
      return reply({ error: "Please enter a valid email address." }, 400);
    }

    const resume = upload(form, "resume");
    const extra = upload(form, "additional_document");
    if (!resume) return reply({ error: "Please attach your resume." }, 400);
    if (resume.size + (extra?.size || 0) > MAX_ATTACHMENT_BYTES) {
      return reply({ error: "Attachments must be 2.5 MB or less in total." }, 413);
    }

    const attachments = [];
    for (const [file, label] of [[resume, "Resume"], [extra, "Additional document"]]) {
      if (!file) continue;
      const attachment = await toAttachment(file, `${safeFileName(application.name)} - ${label}`);
      if (!attachment) {
        return reply({ error: `${label} must be a PDF or Word document (.pdf, .doc, .docx).` }, 400);
      }
      attachments.push(attachment);
    }

    const sendFailed = () =>
      reply({ error: `We couldn't send your application. Please try again, or email ${FALLBACK_CONTACT}.` }, 502);
    const token = await getGraphToken();
    if (!token) return sendFailed();

    const sender = setting("CAREERS_SENDER");
    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          subject: `Application: ${application.roleTitle} — ${application.name}`,
          body: { contentType: "HTML", content: emailHtml(application, resume, extra, new URL(request.url).origin) },
          toRecipients: recipients.map((address) => ({ emailAddress: { address } })),
          replyTo: [{ emailAddress: { address: application.email, name: application.name } }],
          attachments,
        },
      }),
    });

    if (!response.ok) {
      const hint =
        response.status === 403
          ? " (403: the Exchange role assignment hasn't taken effect yet, which can take up to 2 hours, or it doesn't cover CAREERS_SENDER)"
          : "";
      console.error(`Microsoft Graph rejected the careers email${hint}:`, response.status, await response.text());
      return sendFailed();
    }

    return reply({ ok: true });
  },
};

async function getGraphToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const response = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(setting("MS_TENANT_ID"))}/oauth2/v2.0/token`,
    {
      method: "POST",
      body: new URLSearchParams({
        client_id: setting("MS_CLIENT_ID"),
        client_secret: setting("MS_CLIENT_SECRET"),
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );
  if (!response.ok) {
    console.error(
      "Microsoft sign-in failed (check MS_TENANT_ID and MS_CLIENT_ID, and whether MS_CLIENT_SECRET has expired):",
      response.status,
      await response.text()
    );
    return null;
  }
  const { access_token: value, expires_in: expiresIn } = await response.json();
  cachedToken = { value, expiresAt: Date.now() + expiresIn * 1000 };
  return value;
}

// Values pasted into Vercel sometimes keep stray spaces or wrapping quotes.
function setting(name) {
  return (process.env[name] || "").trim().replace(/^["']|["']$/g, "").trim();
}

function reply(body, status = 200, headers = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function text(form, key, maxLength = 500) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function upload(form, key) {
  const value = form.get(key);
  return value && typeof value === "object" && value.size > 0 ? value : null;
}

async function toAttachment(file, baseName) {
  const extension = (file.name.split(".").pop() || "").toLowerCase();
  const type = FILE_TYPES[extension];
  if (!type) return null;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!type.signature.every((byte, i) => bytes[i] === byte)) return null;
  return {
    "@odata.type": "#microsoft.graph.fileAttachment",
    name: `${baseName}.${extension}`,
    contentType: type.contentType,
    contentBytes: bytes.toString("base64"),
  };
}

function safeFileName(value) {
  return value.replace(/[^\p{L}\p{N} .'-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 60) || "Applicant";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function fileSummary(file) {
  return `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`;
}

// siteOrigin is the site the form was submitted from (www.crystrontech.com, or a preview URL).
function emailHtml(application, resume, extra, siteOrigin) {
  const rows = [
    ["Role", application.roleTitle],
    ["Name", application.name],
    ["Email", application.email],
    ["Phone", application.phone],
    ["LinkedIn / portfolio", application.link],
    ["Resume", fileSummary(resume)],
    ["Additional document", extra ? fileSummary(extra) : ""],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => {
      let cell = escapeHtml(value);
      if (label === "Email") cell = `<a href="mailto:${cell}">${cell}</a>`;
      if (label === "LinkedIn / portfolio" && /^https?:\/\//i.test(value)) cell = `<a href="${cell}">${cell}</a>`;
      return `<tr><td style="padding:6px 16px 6px 0;color:#647586;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;color:#1a202c">${cell}</td></tr>`;
    })
    .join("");
  const message = application.message
    ? `<h3 style="margin:24px 0 8px;font-size:15px;color:#1a202c">Message from the applicant</h3><p style="margin:0;white-space:pre-wrap;color:#1a202c">${escapeHtml(application.message)}</p>`
    : "";
  const roleLink = application.roleId
    ? `<p style="margin:24px 0 0;font-size:12px;color:#647586">Posting: ${escapeHtml(siteOrigin)}/#careers/${encodeURIComponent(application.roleId)} · Reply to this email to respond to the applicant.</p>`
    : "";
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;max-width:640px">
<h2 style="margin:0 0 4px;font-size:20px;color:#1a202c">New application: ${escapeHtml(application.roleTitle)}</h2>
<p style="margin:0 0 16px;color:#647586">Submitted through the Crystron careers page. Attachments are included below.</p>
<table style="border-collapse:collapse">${rows}</table>${message}${roleLink}</div>`;
}
