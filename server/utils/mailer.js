import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

// Primary target admin email
export const PRIMARY_ADMIN_EMAIL = "santoshvarma01814@gmail.com";

// Create nodemailer transporter
function createTransporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_PASS;

  if (user && pass) {
    if (process.env.SMTP_HOST) {
      const port = parseInt(process.env.SMTP_PORT || "465", 10);
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    }

    // Default to official Gmail service preset
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });
  }

  return null;
}

/**
 * Send OTP Verification Email
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6 digit verification code
 * @param {string} purpose - 'profile_update' | 'password_change'
 * @param {string} adminName - Name of the admin
 */
export async function sendOtpEmail({ toEmail, otp, purpose, adminName = "Admin" }) {
  const targetEmail = toEmail || PRIMARY_ADMIN_EMAIL;
  const purposeTitle =
    purpose === "password_change"
      ? "Change Admin Password"
      : purpose === "forgot_password"
      ? "Reset Forgotten Password"
      : "Update Admin Profile (Username/Email)";

  const subject = `🔐 Kheti Se Verification Code: ${otp} (for ${purposeTitle})`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f4423 0%, #1b8143 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 0; font-size: 14px; opacity: 0.9; color: #bbf7d0; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
        .description { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #166534; font-weight: 700; margin-bottom: 6px; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #15803d; font-family: monospace; }
        .expiry-badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 10px; }
        .warning { font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; }
        .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌾 Kheti Se Admin Panel</h1>
          <p>Seedha Khet Se, Aapke Ghar Tak</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${adminName},</div>
          <div class="description">
            We received a request to <strong>${purposeTitle}</strong> on your Kheti Se Admin Account.
            Please use the One-Time Password (OTP) below to complete the verification:
          </div>
          
          <div class="otp-box">
            <div class="otp-label">Your One-Time Password</div>
            <div class="otp-code">${otp}</div>
            <div class="expiry-badge">⏱️ Valid for 10 minutes</div>
          </div>

          <div class="warning">
            🛡️ <strong>Security Tip:</strong> Never share this OTP with anyone. If you did not initiate this request, please change your admin password immediately and check your server logs.
          </div>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Kheti Se Admin System. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();

  if (!transporter) {
    console.log(`====================================================`);
    console.log(`📧 [EMAIL OTP SIMULATION - SMTP NOT CONFIGURED]`);
    console.log(`To: ${targetEmail}`);
    console.log(`Purpose: ${purposeTitle}`);
    console.log(`🔑 Verification Code (OTP): ${otp}`);
    console.log(`⏱️ Expiry: 10 minutes`);
    console.log(`Configure SMTP_USER & SMTP_PASS in server/.env to send real emails.`);
    console.log(`====================================================`);
    return { success: true, simulated: true, otp };
  }

  try {
    const fromAddress = process.env.SMTP_FROM || `"Kheti Se Admin Security" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`;
    const info = await transporter.sendMail({
      from: fromAddress,
      to: targetEmail,
      subject,
      html: htmlContent
    });

    console.log(`✅ OTP email sent to ${targetEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${targetEmail}:`, error.message);
    // Fallback log to console so developer is not locked out
    console.log(`🔑 Fallback OTP for verification: ${otp}`);
    return { success: false, error: error.message, fallbackOtp: otp };
  }
}
