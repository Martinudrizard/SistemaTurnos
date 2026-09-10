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

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendOwnerCredentialsEmail({
  toEmail,
  ownerName,
  clubName,
  password,
  loginUrl = 'https://sistema-turnos-gilt.vercel.app/login',
  publicClubUrl,
}: EmailCredentialsOptions): Promise<EmailResult> {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS || '';
  const smtpPass = rawPass.replace(/\s+/g, '').trim();
  const fromEmail = process.env.SMTP_FROM?.trim() || smtpUser || 'marudri58@gmail.com';

  console.log(`[EmailService] Intento de envío a: ${toEmail} para el club "${clubName}"`);
  console.log(`[EmailService] Configuración SMTP: host=${smtpHost}, user=${smtpUser ? smtpUser.replace(/(.{3}).*@/, '$1***@') : 'NO_CONFIGURADO'}, pass_len=${smtpPass.length}`);

  if (!smtpUser || !smtpPass) {
    const msg = 'SMTP_USER o SMTP_PASS no configurados en las variables de entorno de Railway.';
    console.warn(`[EmailService] ${msg}`);
    return { success: false, error: msg };
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Credenciales PadelHub</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #06100e; color: #f1f5f3; margin: 0; padding: 24px; }
    .card { max-width: 520px; margin: 0 auto; background-color: #0c1517; border: 1px solid #16272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
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
    <p>Tu complejo <strong>${clubName}</strong> ha sido dado de alta en la plataforma. A continuación tenés tus datos de acceso al panel de administración:</p>
    <div class="box">
      <div class="item"><span class="label">Email de Acceso:</span><span class="value">${toEmail}</span></div>
      <div class="item"><span class="label">Contraseña Inicial:</span><span class="value">${password}</span></div>
      <div class="item"><span class="label">Rol:</span><span class="value">Dueño / Administrador</span></div>
    </div>
    ${publicClubUrl ? `<div style="background-color:rgba(0,208,132,0.05);border:1px dashed rgba(0,208,132,0.3);border-radius:12px;padding:12px;text-align:center;margin-bottom:20px;"><p style="margin:0;font-size:12px;color:#8a9b95;">Link Público para Jugadores:</p><a href="${publicClubUrl}" style="color:#4ade80;font-weight:bold;font-size:13px;">${publicClubUrl}</a></div>`: ''}
    <a href="${loginUrl}" class="btn">Ingresar al Panel</a>
    <div class="footer"><p>PadelHub - Gestión Integral de Complejos de Pádel</p></div>
  </div>
</body>
</html>
`;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      // Force IPv4 to prevent ENETUNREACH on Railway/Cloud
      family: 4,
      tls: {
        rejectUnauthorized: false,
      },
    } as any);

    const info = await transporter.sendMail({
      from: `"PadelHub Core" <${fromEmail}>`,
      to: toEmail,
      subject: `Tus credenciales de acceso a PadelHub - ${clubName}`,
      html: htmlContent,
      text: `Hola ${ownerName},\n\nTu complejo ${clubName} ha sido dado de alta.\n\nUsuario: ${toEmail}\nPassword: ${password}\nIngresá aquí: ${loginUrl}\n`,
    });

    console.log(`[EmailService] ¡Correo enviado con éxito a ${toEmail}! MessageId:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    const errText = error.message || String(error);
    console.error('[EmailService] Error al enviar correo vía SMTP:', errText);
    return { success: false, error: errText };
  }
}
