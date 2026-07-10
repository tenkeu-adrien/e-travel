import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email et OTP requis" }, { status: 400 });
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "e-pharma-5fd18";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/passwordResets/${encodeURIComponent(email)}`;

    const fbRes = await fetch(url);
    if (!fbRes.ok) {
      return NextResponse.json({ error: "Aucune demande trouvée pour cet email" }, { status: 404 });
    }

    const data = await fbRes.json();
    const fields = data.fields || {};

    const storedOtp = fields.otp?.stringValue || "";
    const expiresAt = parseInt(fields.expiresAt?.integerValue || "0", 10);
    const used = fields.used?.booleanValue || false;

    if (used) {
      return NextResponse.json({ error: "Ce code a déjà été utilisé" }, { status: 400 });
    }

    if (storedOtp !== otp) {
      return NextResponse.json({ error: "Code OTP incorrect" }, { status: 400 });
    }

    if (Date.now() > expiresAt) {
      return NextResponse.json({ error: "Le code a expiré. Veuillez en demander un nouveau." }, { status: 400 });
    }

    // Mark OTP as used
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          used: { booleanValue: true },
          verifiedAt: { timestampValue: new Date().toISOString() },
        },
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Code OTP vérifié avec succès",
    });
  } catch (err: any) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: err.message || "Erreur de vérification" }, { status: 500 });
  }
}
