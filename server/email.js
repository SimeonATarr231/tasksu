// server/email.js
const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

async function sendVerificationEmail(toEmail, token) {
  const verifyUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

  await client.smtp.sendTransacEmail({
    to: [{ email: toEmail }],
    sender: { name: "TaskSU", email: process.env.FROM_EMAIL },
    subject: "Verify your TaskSU account",
    htmlContent: `
      <div style="font-family: monospace; background: #0a0a0a; color: #f5f0e8; padding: 40px; border-radius: 8px;">
        <h2 style="color: #ff4d00;">Verify your email</h2>
        <p>Thanks for signing up for TaskSU. Click the button below to verify your email address.</p>
        <a href="${verifyUrl}"
           style="display: inline-block; background: #ff4d00; color: #fff;
                  padding: 12px 24px; border-radius: 4px; text-decoration: none;
                  font-weight: bold; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 12px;">This link expires in 24 hours.<br>
        If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(toEmail, token) {
  const resetUrl = `${process.env.BASE_URL}/reset-password.html?token=${token}`;

  await client.smtp.sendTransacEmail({
    to: [{ email: toEmail }],
    sender: { name: "TaskSU", email: process.env.FROM_EMAIL },
    subject: "Reset your TaskSU password",
    htmlContent: `
      <div style="font-family: monospace; background: #0a0a0a; color: #f5f0e8; padding: 40px; border-radius: 8px;">
        <h2 style="color: #ff4d00;">Reset your password</h2>
        <p>We received a request to reset your TaskSU password. Click below to choose a new one.</p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #ff4d00; color: #fff;
                  padding: 12px 24px; border-radius: 4px; text-decoration: none;
                  font-weight: bold; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 12px;">This link expires in 1 hour.<br>
        If you didn't request this, ignore this email — your password won't change.</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
