import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface EmailCredentialsOptions {
  toEmail: string;
  ownerName: string;
  clubName: string;
  password: string;
  loginUrl?: string;
  publicClubUrl?: string;
}

export async function sendOwnerCredentialsEmail({
  toEmail,
  ownerName,
  clubName,
  password,
  loginUrl = 'https://sistema-turnos-gilt.vercel.app/login',
  publicClubUrl,
}: EmailCredentialsOptions): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM || smtpUser || 'no-reply@padelhub.app';

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Credenciales PadelHub</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #06100e; color: #f1f5f3; margin: 0; padding: 24px; }
    .card { max-width: 520px; margin: 0 auto; background-color: #0c1517; border: 1px solid #16272a; border-radius: 16px; padding: 32px; }
    .badge { display: inline-block; background-color: rgba(0, 208, 132, 0.15); color: #00d084; border: 1px solid rgba(0, 208, 132, 0.3); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; color: #f1f5f3; margin: 0 0 8px 0; }
    p { color: #8a9b95; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0; }
    .box { background-color: #06100e; border: 1px solid #16272a; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #16272a; font-size: 13px; }
    .item:last-child { border-bottom: none; }
    .label { color: #8a9b95; }
    .value { color: #00d084; font-weight: 700; font-family: monospace; }
    .btn { display: block; width: 100%; text-align: center; background-color: #00d084; color: #06100e; font-weight: 800; font-size: 14px; padding: 14px 20px; border-radius: 12px; text-decoration: none; margin-bottom: 20px; box-sizing: border-box; }
    .footer { text-align: center; font-size: 11px; color: #8a9b95; border-top: 1px solid #16272a; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Bienvenido a PadelHub</div>
    <h1>Hola, ${ownerName}</h1>
    <p>Tu complejo <strong>${clubName}</strong> ha sido dado de alta en la plataforma. A continuacion tienes tus credenciales de acceso:</p>
    <div class="box">
      <div class="item"><span class="label">Email:</span><span class="value">${toEmail}</span></div>
      <div class="item"><span class="label">Password:</span><span class="value">${password}</span></div>
      <div class="item"><span class="label">Rol:</span><span class="value">Dueno / Administrador</span></div>
    </div>
    ${publicClubUrl ? `<div style="background-color:rgba(0,208,132,0.05);border:1px dashed rgba(0,208,132,0.3);border-radius:12px;padding:12px;text-align:center;margin-bottom:20px;"><p style="margin:0;font-size:12px;color:#8a9b95;">Link Publico:</p><a href="${publicClubUrl}" style="color:#4ade80;font-weight:bold;font-size:13px;">${publicClubUrl}</a></div>`: ''}
    <a href="${loginUrl}" class="btn">Ingresar al Panel</a>
    <div class="footer"><p>PadelHub - Gestion Integral de Complejos</p></div>
  </div>
</body>
</html>
`;

  if (!smtpUser || !smtpPass) {
    console.log('[EmailService] SMTP credentials not set. Simulated email to:', toEmail);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"PadelHub Core" <${fromEmail}>`,
      to: toEmail,
      subject: `Tus credenciales de acceso a PadelHub - ${clubName}`,
      html: htmlContent,
      text: `Hola ${ownerName},\n\nTu complejo ${clubName} ha sido dado de alta.\n\nUsuario: ${toEmail}\nPassword: ${password}\nlogin: ${loginUrl}\n`,
    });

    console.log('[EmailService] Email sent successfully to', toEmail);
    return true;
  } catch (error) {
    console.error('[EmailService] Failed to send email:', error);
    return false;
  }
}
