import nodemailer from 'nodemailer';

interface SendCredentialsOptions {
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
}: SendCredentialsOptions): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || '';
  const fromEmail = process.env.SMTP_FROM || smtpUser || 'no-reply@padelsaas.com';

  console.log(`[EmailService] Preparing welcome email for ${toEmail} (${clubName})`);

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a PádelHub</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #06100E; color: #F1F5F3; margin: 0; padding: 20px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #0C1517; border: 1px solid #16272a; border-radius: 20px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { text-align: center; margin-bottom: 28px; }
    .logo { display: inline-block; background-color: rgba(0, 208, 132, 0.1); border: 1px solid rgba(0, 208, 132, 0.3); border-radius: 14px; padding: 12px 18px; color: #00D084; font-size: 20px; font-weight: 800; }
    h1 { color: #F1F5F3; font-size: 22px; font-weight: 800; margin-top: 16px; margin-bottom: 6px; }
    p { color: #8A9B95; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
    .card { background-color: #06100E; border: 1px solid #1a2e32; border-radius: 14px; padding: 20px; margin: 24px 0; }
    .card-title { color: #00D084; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .cred-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .cred-label { color: #8A9B95; font-weight: 500; }
    .cred-value { color: #F1F5F3; font-weight: 700; font-family: monospace; }
    .btn { display: block; width: 100%; text-align: center; background-color: #00D084; color: #06100E; font-weight: 800; font-size: 15px; padding: 14px; border-radius: 12px; text-decoration: none; margin-top: 24px; box-sizing: border-box; }
    .footer { text-align: center; margin-top: 28px; border-top: 1px solid #16272a; padding-top: 20px; font-size: 12px; color: #8A9B95; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">?? PádelHub Core</div>
      <h1>¡Bienvenido a PádelHub, ${ownerName || 'Administrador'}!</h1>
      <p>Tu complejo <strong>${clubName}</strong> ha sido dado de alta exitosamente en la plataforma.</p>
    </div>

    <div class="card">
      <div class="card-title">Tus Credenciales de Acceso</div>
      <div class="cred-row">
        <span class="cred-label">Usuario / Email:</span>
        <span class="cred-value">${toEmail}</span>
      </div>
      <div class="cred-row">
        <span class="cred-label">Contraseña:</span>
        <span class="cred-value">${password}</span>
      </div>
      <div class="cred-row" style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #16272a;">
        <span class="cred-label">Panel de Control:</span>
        <span class="cred-value" style="color: #00D084;"><a href="${loginUrl}" style="color: #00D084; text-decoration: none;">Ingresar al Panel</a></span>
      </div>
    </div>

    ${publicClubUrl ? `
    <div style="background-color: rgba(0, 208, 132, 0.05); border: 1px dashed rgba(0, 208, 132, 0.3); border-radius: 12px; padding: 14px; text-align: center; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 12px; color: #8A9B95;">Tu Link Público para Jugadores:</p>
      <a href="${publicClubUrl}" style="color: #4ADE80; font-weight: bold; font-size: 13px; word-break: break-all;">${publicClubUrl}</a>
    </div>
    ` : ''}

    <a href="${loginUrl}" class="btn">Iniciar Sesión en tu Panel</a>

    <div class="footer">
      <p>PádelHub — Gestión integral y automatización para complejos de pádel.</p>
    </div>
  </div>
</body>
</html>
`;

  if (!smtpUser || !smtpPass) {
    console.log('[EmailService] SMTP credentials not configured in env. Simulated dispatch:', {
      to: toEmail,
      subject: `Tus credenciales de acceso a PádelHub - ${clubName}`,
      ownerName,
      clubName,
      password,
      loginUrl,
    });
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"PádelHub Core" <${fromEmail}>`,
      to: toEmail,
      subject: `?? Tus credenciales de acceso a PádelHub - ${clubName}`,
      html: htmlContent,
      text: `Hola ${ownerName},\n\nTu complejo ${clubName} ha sido dado de alta en PádelHub.\n\nUsuario: ${toEmail}\nContraseña: ${password}\n\nIngresá aquí: ${loginUrl}\n`,
    });

    console.log(`[EmailService] Email successfully sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Failed to send email via SMTP:', error);
    return false;
  }
}
