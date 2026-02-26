/**
 * HEALO: Inquiry confirmation email
 * 
 * Currently logs to console. When an email provider (Resend, SendGrid, etc.)
 * is configured, update the `sendEmail` function to use it.
 * 
 * Environment: RESEND_API_KEY or SENDGRID_API_KEY
 */

interface ConfirmationEmailData {
  to: string;
  firstName?: string | null;
  inquiryId: number;
  treatmentType?: string | null;
  language?: string;
}

const TEMPLATES = {
  en: {
    subject: "Your HEALO Inquiry Has Been Received",
    body: (data: ConfirmationEmailData) => `
Dear ${data.firstName || "Patient"},

Thank you for reaching out to HEALO. Your inquiry (#${data.inquiryId}) has been received.

${data.treatmentType ? `Treatment of interest: ${data.treatmentType}` : ""}

What happens next:
1. Our team will review your inquiry within 24 hours.
2. We'll match you with the best-suited partner hospitals.
3. You'll receive personalized treatment plans and price quotes.

If you have any questions, please contact us at contact@healo.com.

Best regards,
HEALO Medical Concierge Team
    `.trim(),
  },
  ja: {
    subject: "HEALOへのお問い合わせを受け付けました",
    body: (data: ConfirmationEmailData) => `
${data.firstName || "患者"}様

HEALOにお問い合わせいただきありがとうございます。お問い合わせ(#${data.inquiryId})を受け付けました。

${data.treatmentType ? `ご関心の施術: ${data.treatmentType}` : ""}

今後の流れ:
1. 24時間以内にチームがお問い合わせを確認いたします。
2. 最適なパートナー病院をマッチングいたします。
3. オーダーメイドの治療プランとお見積もりをお届けします。

ご質問がございましたら、contact@healo.comまでご連絡ください。

HEALO メディカルコンシェルジュチーム
    `.trim(),
  },
};

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  
  if (resendKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "HEALO <noreply@healo.com>",
          to: [to],
          subject,
          text: body,
        }),
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("[email] Resend API error:", errData);
        return false;
      }
      
      console.log(`[email] Sent confirmation to ${to.charAt(0)}***@${to.split("@")[1]}`);
      return true;
    } catch (err) {
      console.error("[email] Resend send failed:", err);
      return false;
    }
  }
  
  // Fallback: log only (no email provider configured)
  console.log(`[email] (no provider) Would send confirmation to ${to.charAt(0)}***@${to.split("@")[1]}`);
  console.log(`[email] Subject: ${subject}`);
  return false;
}

export async function sendConfirmationEmail(data: ConfirmationEmailData): Promise<boolean> {
  const lang = data.language === "ja" ? "ja" : "en";
  const template = TEMPLATES[lang];
  
  try {
    return await sendEmail(data.to, template.subject, template.body(data));
  } catch (err) {
    console.error("[email] sendConfirmationEmail failed:", err);
    return false;
  }
}
