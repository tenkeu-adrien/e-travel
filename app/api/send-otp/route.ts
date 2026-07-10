import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.SMTP_FROM || "noreply@e-travel.cm";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    if (!SMTP_USER || !SMTP_PASS) {
      return NextResponse.json({
        error: "SMTP non configuré. Contactez l'administrateur.",
      }, { status: 500 });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"e-travel" <${FROM_EMAIL}>`,
      to: email,
      subject: "🔐 Code de réinitialisation - e-travel",
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:30px 20px; background:#f5f7fa; border-radius:12px;">
          <div style="text-align:center; margin-bottom:30px;">
            <span style="font-size:28px; font-weight:900; color:#0A1628;">e-<span style="color:#1DB954;">travel</span></span>
          </div>
          <h2 style="color:#0A1628; font-size:22px; text-align:center;">🔐 Réinitialisation de mot de passe</h2>
          <p style="color:#555; font-size:15px; text-align:center; line-height:1.6;">
            Voici votre code de réinitialisation. Il expire dans <strong>10 minutes</strong>.
          </p>
          <div style="text-align:center; margin:30px 0;">
            <span style="display:inline-block; background:#0A1628; color:#1DB954; font-size:36px; font-weight:900; letter-spacing:8px; padding:16px 32px; border-radius:10px;">${otp}</span>
          </div>
          <p style="color:#888; font-size:13px; text-align:center;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
          <hr style="border:none; border-top:1px solid #e0e0e0; margin:30px 0;">
          <p style="color:#aaa; font-size:12px; text-align:center;">
            e-travel Cameroun · Réservation de bus en ligne<br>
            Cet email est généré automatiquement.
          </p>
        </div>
      `,
    });

    // Store OTP in Firestore via REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/passwordResets/${encodeURIComponent(email)}`;
    const body = {
      fields: {
        otp: { stringValue: otp },
        expiresAt: { integerValue: expiresAt },
        used: { booleanValue: false },
        createdAt: { timestampValue: new Date().toISOString() },
      },
    };

    const fbRes = await fetch(firestoreUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!fbRes.ok) {
      console.warn("Firestore write warning:", await fbRes.text());
    }

    return NextResponse.json({ success: true, message: "OTP envoyé" });
  } catch (err: any) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: err.message || "Erreur d'envoi" }, { status: 500 });
  }
}
