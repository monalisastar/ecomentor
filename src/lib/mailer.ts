import nodemailer from "nodemailer";

/**
 * 🌿 Eco-Mentor Mailer System
 * -------------------------------------------------------
 * Unified email handler for:
 *  • Staff onboarding credentials
 *  • Certificate notifications
 *  • Password reset requests
 * 
 * 💡 Uses Gmail SMTP — App Password required for production
 * -------------------------------------------------------
 */

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🌍 Shared styling — ensures consistent theme & dark-mode safety
const baseEmailTemplate = (content: string) => `
  <html>
    <head>
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f8f9fa;
          color: #1b4332;
          padding: 30px;
        }
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #121212 !important;
            color: #e8f5e9 !important;
          }
          a {
            color: #a5d6a7 !important;
          }
        }
        .card {
          background: #ffffff;
          border-radius: 12px;
          max-width: 600px;
          margin: auto;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        @media (prefers-color-scheme: dark) {
          .card {
            background: #1e1e1e !important;
            box-shadow: 0 0 10px rgba(255,255,255,0.05);
          }
        }
        .button {
          display: inline-block;
          background-color: #1b4332;
          color: #fff !important;
          padding: 10px 18px;
          border-radius: 8px;
          text-decoration: none;
          margin-top: 20px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <img src="https://eco-mentor.vercel.app/logo.webp" width="120" alt="Eco-Mentor Logo" style="margin-bottom: 20px;" />
        ${content}
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;" />
        <p style="font-size: 0.9rem; color: #555;">
          Eco-Mentor LMS • Climate Education & Training Platform<br/>
          <a href="https://eco-mentor.vercel.app" style="color: #1b4332;">eco-mentor.vercel.app</a>
        </p>
      </div>
    </body>
  </html>
`;

//
// 🧩 sendStaffCredentials()
// -------------------------------------------------------
export async function sendStaffCredentials({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const loginUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`;

  const html = baseEmailTemplate(`
    <h2>Welcome to Eco-Mentor, ${name}!</h2>
    <p>Your staff account has been created successfully. Below are your login details:</p>

    <table style="margin: 20px 0; border-collapse: collapse;">
      <tr><td style="padding: 8px 12px; border: 1px solid #ccc;"><b>Email</b></td>
          <td style="padding: 8px 12px; border: 1px solid #ccc;">${email}</td></tr>
      <tr><td style="padding: 8px 12px; border: 1px solid #ccc;"><b>Temporary Password</b></td>
          <td style="padding: 8px 12px; border: 1px solid #ccc;">${password}</td></tr>
    </table>

    <p>You can log in here:</p>
    <a href="${loginUrl}" class="button">Access Dashboard</a>

    <p style="margin-top: 20px;">
      <b>Next Steps:</b><br/>
      • Log in using your temporary password.<br/>
      • Update your password under your profile settings.<br/>
      • Begin managing your courses and students.
    </p>
  `);

  await transporter.sendMail({
    from: `"Eco-Mentor HR" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Eco-Mentor Staff Login Details",
    html,
  });
}

//
// 🧩 sendCertificateNotification()
// -------------------------------------------------------
export async function sendCertificateNotification({
  name,
  email,
  courseTitle,
  certificateUrl,
}: {
  name: string;
  email: string;
  courseTitle: string;
  certificateUrl: string;
}) {
  const html = baseEmailTemplate(`
    <h2>Congratulations, ${name}!</h2>
    <p>You have successfully completed the course:</p>
    <h3 style="color: #F4B940;">${courseTitle}</h3>
    <p>Your verified certificate is now available:</p>
    <a href="${certificateUrl}" class="button">Download Certificate</a>
  `);

  await transporter.sendMail({
    from: `"Eco-Mentor Certificates" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎓 Certificate of Completion — ${courseTitle}`,
    html,
  });
}

//
// 🧩 sendPasswordResetEmail()
// -------------------------------------------------------
export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}: {
  email: string;
  name: string;
  resetUrl: string;
}) {
  const html = baseEmailTemplate(`
    <h2>Password Reset Request</h2>
    <p>Hello ${name || "Eco-Mentor user"},</p>
    <p>
      We received a request to reset your Eco-Mentor password. Click the button below to create a new password.
    </p>

    <a href="${resetUrl}" class="button">Reset Password</a>

    <p>This link will expire in 30 minutes. If you didn’t request this reset, please ignore this email — your password will remain unchanged.</p>
  `);

  await transporter.sendMail({
    from: `"Eco-Mentor Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Eco-Mentor Password",
    html,
  });
}
