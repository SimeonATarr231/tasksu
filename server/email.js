// server/email.js
const { BrevoClient } = require('@getbrevo/brevo');

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY
});

async function sendVerificationEmail(toEmail, token) {
  const verifyUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

  await client.transactionalEmails.sendTransacEmail({
    to: [{ email: toEmail }],
    sender: { name: 'TasksU', email: process.env.FROM_EMAIL },
    subject: 'Confirm your TasksU account',
    htmlContent: `
      <div style="font-family: 'Courier New', monospace; background-color: #0a0a0a; padding: 48px 40px; max-width: 520px; margin: 0 auto;">
        <p style="font-size: 22px; font-weight: 800; color: #ff4d00; margin: 0 0 32px 0; letter-spacing: -0.5px;">TasksU</p>

        <h1 style="font-size: 20px; font-weight: 700; color: #f5f0e8; margin: 0 0 12px 0;">Confirm your email address</h1>
        <p style="font-size: 14px; color: #999; line-height: 1.7; margin: 0 0 32px 0;">
          You signed up for TasksU. Click the button below to confirm your email address and activate your account.
          This link expires in <strong style="color: #f5f0e8;">24 hours</strong>.
        </p>

        <a href="${verifyUrl}"
           style="display: inline-block; background-color: #ff4d00; color: #ffffff;
                  padding: 13px 28px; text-decoration: none;
                  font-size: 14px; font-weight: 700; letter-spacing: 0.03em;
                  border-radius: 0;">
          Verify Email Address
        </a>

        <hr style="border: none; border-top: 1px solid #1a1a1a; margin: 40px 0;" />

        <p style="font-size: 12px; color: #444; line-height: 1.6; margin: 0;">
          If you didn't create a TasksU account, you can safely ignore this email.<br>
          This link will expire after 24 hours and cannot be reused.
        </p>
      </div>
    `
  });
}

async function sendPasswordResetEmail(toEmail, token) {
  const resetUrl = `${process.env.BASE_URL}/reset-password.html?token=${token}`;

  await client.transactionalEmails.sendTransacEmail({
    to: [{ email: toEmail }],
    sender: { name: 'TasksU', email: process.env.FROM_EMAIL },
    subject: 'Reset your TasksU password',
    htmlContent: `
      <div style="font-family: 'Courier New', monospace; background-color: #0a0a0a; padding: 48px 40px; max-width: 520px; margin: 0 auto;">
        <p style="font-size: 22px; font-weight: 800; color: #ff4d00; margin: 0 0 32px 0; letter-spacing: -0.5px;">TasksU</p>

        <h1 style="font-size: 20px; font-weight: 700; color: #f5f0e8; margin: 0 0 12px 0;">Reset your password</h1>
        <p style="font-size: 14px; color: #999; line-height: 1.7; margin: 0 0 32px 0;">
          We received a request to reset the password for your TasksU account.
          Click the button below to choose a new password.
          This link expires in <strong style="color: #f5f0e8;">1 hour</strong>.
        </p>

        <a href="${resetUrl}"
           style="display: inline-block; background-color: #ff4d00; color: #ffffff;
                  padding: 13px 28px; text-decoration: none;
                  font-size: 14px; font-weight: 700; letter-spacing: 0.03em;
                  border-radius: 0;">
          Reset Password
        </a>

        <hr style="border: none; border-top: 1px solid #1a1a1a; margin: 40px 0;" />

        <p style="font-size: 12px; color: #444; line-height: 1.6; margin: 0;">
          If you didn't request a password reset, ignore this email — your password will not change.<br>
          This link will expire after 1 hour and cannot be reused.
        </p>
      </div>
    `
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };