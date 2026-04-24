

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { safeReadRequestJson } from "@/lib/safe-json";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await safeReadRequestJson<Record<string, string>>(req, "POST /api/sell-enquiry");
    if (!body) {
      return NextResponse.json(
        { error: "Invalid or empty request body" },
        { status: 400 },
      );
    }
    const {
      // Equipment
      make, productType, model, quantity, condition, status, notes,
      // Contact
      name, company, email, phone,
    } = body;

    // Basic validation
    if (!make || !model || !quantity || !condition || !status || !name || !email || !phone) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    const row = (label: string, value: string) => `
      <tr>
        <td style="padding:10px 0;color:#666;font-size:13px;width:140px;border-bottom:1px solid #1a1a1a;">${label}</td>
        <td style="padding:10px 0;color:#fff;font-size:13px;border-bottom:1px solid #1a1a1a;text-transform:capitalize;">${value}</td>
      </tr>`;

    // ── Notification email to BuySupply team ──────────────────────────────
    await resend.emails.send({
      from:    "BuySupply Enquiries <noreply@buysupply.me>",
      to:      "sales@buysupply.me",
      replyTo: email,
      subject: `New Equipment Enquiry — ${make} ${model} from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:#111;padding:24px 32px;border-bottom:1px solid #222;">
            <h2 style="margin:0;font-size:20px;color:#fff;">New Equipment Sell Enquiry</h2>
            <p style="margin:4px 0 0;color:#666;font-size:13px;">Submitted via buysupply.me</p>
          </div>

          <div style="padding:32px;">

            <h3 style="color:#888;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">Equipment Details</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
              ${row("Make",         make)}
              ${row("Product Type", productType || "—")}
              ${row("Model",        model)}
              ${row("Quantity",     quantity)}
              ${row("Condition",    condition)}
              ${row("Status",       status)}
            </table>

            ${notes ? `
            <h3 style="color:#888;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Additional Notes</h3>
            <p style="background:#1a1a1a;padding:16px;border-radius:8px;color:#ccc;font-size:13px;line-height:1.6;margin-bottom:28px;">${notes}</p>
            ` : ""}

            <h3 style="color:#888;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">Contact Details</h3>
            <table style="width:100%;border-collapse:collapse;">
              ${row("Name",    name)}
              ${row("Company", company || "—")}
              ${row("Email",   `<a href="mailto:${email}" style="color:#aaa;">${email}</a>`)}
              ${row("Phone",   `<a href="tel:${phone}" style="color:#aaa;">${phone}</a>`)}
            </table>

            <div style="margin-top:28px;padding:16px;background:#1a1a1a;border-radius:8px;text-align:center;">
              <a href="mailto:${email}" style="color:#fff;font-size:13px;text-decoration:none;">
                Reply to ${name} →
              </a>
            </div>
          </div>
        </div>
      `,
    });

    // ── Confirmation email to customer ────────────────────────────────────
    await resend.emails.send({
      from:    "BuySupply <noreply@buysupply.me>",
      to:      email,
      subject: "We've received your equipment enquiry — BuySupply",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:#111;padding:24px 32px;border-bottom:1px solid #222;">
            <h2 style="margin:0;font-size:20px;">Thanks, ${name}!</h2>
            <p style="margin:4px 0 0;color:#666;font-size:13px;">We've received your enquiry</p>
          </div>
          <div style="padding:32px;">
            <p style="color:#ccc;font-size:14px;line-height:1.7;">
              Thank you for submitting your equipment details. Our team will review your enquiry
              and get back to you with a valuation as soon as possible.
            </p>
            <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin:24px 0;">
              <p style="margin:0 0 8px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your Submission</p>
              <p style="margin:0;color:#fff;font-size:14px;">
                <strong>${make} ${model}</strong> — ${quantity} unit(s) — ${condition} condition
              </p>
            </div>
            <p style="color:#666;font-size:13px;">
              If you have any questions in the meantime, please don't hesitate to contact us:<br/>
              📞 01753 971125<br/>
              📧 sales@buysupply.me
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[POST /api/sell-enquiry]", err);
    return NextResponse.json(
      { error: "Failed to send enquiry. Please try again." },
      { status: 500 },
    );
  }
}