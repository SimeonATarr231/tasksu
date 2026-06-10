const nodemailer = require('nodemailer');

/* Create the email transporter using Gmail */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});


/* Send Verification */
const sendVerificationEmail = async (toEmail, username, token) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"TaskSy" <${process.env.FROM_EMAIL}>`,
    to: toEmail,
    subject: 'Verify your TaskSy account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;">
          <div style="max-width:560px;margin:40px auto;padding:40px;border:1px solid #2a2a2a;">

            <div style="font-size:1.1rem;font-weight:800;letter-spacing:0.2em;
                        text-transform:uppercase;color:#ff4d00;margin-bottom:32px;">
              TaskSy
            </div>

            <h1 style="color:#f5f0e8;font-size:1.5rem;font-weight:700;margin:0 0 12px 0;">
              Welcome, ${username}.
            </h1>

            <p style="color:#666;font-size:0.85rem;line-height:1.7;margin:0 0 32px 0;">
              You are one step away from accessing your TaskSy account.
              Click the button below to verify your email address.
              This link expires in <strong style="color:#f5f0e8;">24 hours</strong>.
            </p>

            <a href="${verifyUrl}"
               style="display:inline-block;background:#ff4d00;color:#0a0a0a;
                      text-decoration:none;font-weight:700;font-size:0.85rem;
                      text-transform:uppercase;letter-spacing:0.15em;
                      padding:14px 28px;">
              Verify Email Address
            </a>

            <p style="color:#444;font-size:0.75rem;margin:32px 0 0 0;line-height:1.6;">
              If you did not create a TaskSy account, you can safely ignore this email.
            </p>

            <div style="border-top:1px solid #2a2a2a;margin-top:32px;padding-top:20px;">
              <p style="color:#444;font-size:0.7rem;margin:0;">
                TaskSy — Stay sharp. Stay free.
              </p>
            </div>

          </div>
        </body>
      </html>
    `
  });
};


/* Send Password Reset Email */
const sendPasswordResetEmail = async (toEmail, username, token) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const resetUrl = `${baseUrl}/reset-password.html?token=${token}`;

  await transporter.sendMail({
    from: `"TaskSy" <${process.env.FROM_EMAIL}>`,
    to: toEmail,
    subject: 'Reset your TaskSy password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;">
          <div style="max-width:560px;margin:40px auto;padding:40px;border:1px solid #2a2a2a;">

            <div style="font-size:1.1rem;font-weight:800;letter-spacing:0.2em;
                        text-transform:uppercase;color:#ff4d00;margin-bottom:32px;">
              TaskSy
            </div>

            <h1 style="color:#f5f0e8;font-size:1.5rem;font-weight:700;margin:0 0 12px 0;">
              Password Reset
            </h1>

            <p style="color:#666;font-size:0.85rem;line-height:1.7;margin:0 0 8px 0;">
              Hi ${username}, we received a request to reset your password.
            </p>

            <p style="color:#666;font-size:0.85rem;line-height:1.7;margin:0 0 32px 0;">
              Click the button below to set a new password.
              This link expires in <strong style="color:#f5f0e8;">1 hour</strong>.
            </p>

            <a href="${resetUrl}"
               style="display:inline-block;background:#ff4d00;color:#0a0a0a;
                      text-decoration:none;font-weight:700;font-size:0.85rem;
                      text-transform:uppercase;letter-spacing:0.15em;
                      padding:14px 28px;">
              Reset Password
            </a>

            <p style="color:#444;font-size:0.75rem;margin:32px 0 0 0;line-height:1.6;">
              If you did not request a password reset, you can safely ignore this email.
              Your password will not change.
            </p>

            <div style="border-top:1px solid #2a2a2a;margin-top:32px;padding-top:20px;">
              <p style="color:#444;font-size:0.7rem;margin:0;">
                TaskSy — Stay sharp. Stay free.
              </p>
            </div>

          </div>
        </body>
      </html>
    `
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };