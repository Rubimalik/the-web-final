import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { safeReadRequestJson } from "@/lib/safe-json";

function readString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeReadRequestJson<Record<string, unknown>>(
      req,
      "POST /api/contact",
    );
    if (!body) {
      return NextResponse.json({ error: "Invalid or empty request body" }, { status: 400 });
    }

    const name = readString(body, "name");
    const email = readString(body, "email");
    const phone = readString(body, "phone");
    const subject = readString(body, "subject");
    const message = readString(body, "message");

    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("[POST /api/contact] RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 },
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

    await resend.emails.send({
      from: "BuySupply Contact <noreply@buysupply.me>",
      to: "sales@buysupply.me",
      replyTo: email,
      subject: `New contact enquiry - ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111;">
          <h2>New Contact Enquiry</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <div style="margin-top:20px;padding:16px;border:1px solid #ddd;border-radius:8px;">
            ${safeMessage}
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 },
    );
  }
}
