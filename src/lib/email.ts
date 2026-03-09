import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordEmail(to: string, password: string, name: string) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!from || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      "Email not configured. Set SMTP_USER, SMTP_PASS, and optionally EMAIL_FROM in .env"
    );
  }

  await transporter.sendMail({
    from,
    to,
    subject: "Your Class Management System Password",
    text: `Hi ${name},\n\nYou requested your password. Here it is:\n\nPassword: ${password}\n\nYou can now log in with this email and password.\n\n— Class Management System`,
    html: `
      <p>Hi ${name},</p>
      <p>You requested your password. Here it is:</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>You can now log in with this email and password.</p>
      <p>— Class Management System</p>
    `,
  });
}
