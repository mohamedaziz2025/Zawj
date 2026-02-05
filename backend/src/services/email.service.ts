import nodemailer from 'nodemailer'

// Configuration Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"ZAWJ - Plateforme Matrimoniale" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Email Template: Payment Failed
export function getPaymentFailedEmailHTML(
  userName: string,
  plan: string,
  expirationDate: Date
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ff6b6b 0%, #ff4d4d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background: #ff007f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">⚠️ Échec de Paiement</h1>
      <p style="margin: 10px 0 0;">Plateforme ZAWJ</p>
    </div>
    <div class="content">
      <h2>As-salamu alaykum ${userName},</h2>
      <p>
        Nous avons rencontré un problème lors du traitement de votre paiement pour votre abonnement <strong>${plan}</strong>.
      </p>
      
      <div class="warning-box">
        <p><strong>⚠️ Action requise</strong></p>
        <p>Votre abonnement expirera le <strong>${expirationDate.toLocaleDateString('fr-FR')}</strong> si le paiement n'est pas résolu.</p>
      </div>

      <p>
        <strong>Que faire maintenant ?</strong>
      </p>
      <ul>
        <li>Vérifiez que votre carte bancaire est valide et dispose de fonds suffisants</li>
        <li>Mettez à jour vos informations de paiement dans votre compte</li>
        <li>Contactez notre support si le problème persiste</li>
      </ul>

      <center>
        <a href="${process.env.FRONTEND_URL}/settings" class="button">
          Mettre à jour le paiement
        </a>
      </center>

      <div class="footer">
        <p>Besoin d'aide ? Contactez-nous à support@zawj.com</p>
        <p>&copy; 2026 ZAWJ - Plateforme Matrimoniale Halal</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

// Email Template: Notification Wali - Nouveau Message
export function getWaliNewMessageEmailHTML(
  waliName: string,
  protectedName: string,
  senderName: string,
  messagePreview: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ff007f 0%, #ff4d9f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .message-box { background: white; border-left: 4px solid #ff007f; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background: #ff007f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔔 Notification Wali</h1>
      <p style="margin: 10px 0 0;">Plateforme ZAWJ</p>
    </div>
    <div class="content">
      <h2>As-salamu alaykum ${waliName},</h2>
      <p>
        Vous recevez cette notification car <strong>${protectedName}</strong>, dont vous êtes le tuteur légal (Wali), 
        a reçu un nouveau message sur la plateforme ZAWJ.
      </p>
      
      <div class="message-box">
        <p><strong>Expéditeur:</strong> ${senderName}</p>
        <p><strong>Aperçu du message:</strong></p>
        <p style="color: #666; font-style: italic;">"${messagePreview}"</p>
      </div>

      <p>
        <strong>Important:</strong> En tant que Wali, votre rôle est de superviser et protéger ${protectedName} 
        dans sa recherche d'un conjoint respectueux de nos valeurs islamiques.
      </p>

      <center>
        <a href="${process.env.FRONTEND_URL}/wali-dashboard" class="button">
          Voir le Dashboard Wali
        </a>
      </center>

      <div class="footer">
        <p>Vous recevez cet email car vous êtes enregistré comme Wali sur ZAWJ.</p>
        <p>Pour gérer vos préférences de notification, connectez-vous au Dashboard Wali.</p>
        <p>&copy; 2026 ZAWJ - Plateforme Matrimoniale Halal</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

// Email Template: Notification Wali - Nouveau Match
export function getWaliNewMatchEmailHTML(
  waliName: string,
  protectedName: string,
  matchName: string,
  matchAge: number,
  matchCity: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ff007f 0%, #ff4d9f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .match-card { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .button { display: inline-block; background: #ff007f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">💕 Nouveau Match!</h1>
      <p style="margin: 10px 0 0;">Plateforme ZAWJ</p>
    </div>
    <div class="content">
      <h2>As-salamu alaykum ${waliName},</h2>
      <p>
        Excellente nouvelle! <strong>${protectedName}</strong> a un nouveau match mutuel sur ZAWJ.
      </p>
      
      <div class="match-card">
        <h3 style="color: #ff007f; margin-top: 0;">Profil du Match</h3>
        <p><strong>Nom:</strong> ${matchName}</p>
        <p><strong>Âge:</strong> ${matchAge} ans</p>
        <p><strong>Ville:</strong> ${matchCity}</p>
      </div>

      <p>
        Ce match indique un intérêt mutuel. Nous vous encourageons à superviser les échanges 
        pour assurer qu'ils se déroulent dans le respect des valeurs islamiques.
      </p>

      <center>
        <a href="${process.env.FRONTEND_URL}/wali-dashboard" class="button">
          Voir les Détails
        </a>
      </center>

      <div class="footer">
        <p>&copy; 2026 ZAWJ - Plateforme Matrimoniale Halal</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

export async function sendWaliNewMessageNotification(
  waliEmail: string,
  waliName: string,
  protectedName: string,
  senderName: string,
  messagePreview: string
): Promise<boolean> {
  return sendEmail({
    to: waliEmail,
    subject: `🔔 ${protectedName} a reçu un nouveau message - ZAWJ`,
    html: getWaliNewMessageEmailHTML(waliName, protectedName, senderName, messagePreview),
    text: `As-salamu alaykum ${waliName}, ${protectedName} a reçu un message de ${senderName}: "${messagePreview}". Consultez votre dashboard Wali: ${process.env.FRONTEND_URL}/wali-dashboard`,
  })
}

export async function sendWaliNewMatchNotification(
  waliEmail: string,
  waliName: string,
  protectedName: string,
  matchName: string,
  matchAge: number,
  matchCity: string
): Promise<boolean> {
  return sendEmail({
    to: waliEmail,
    subject: `💕 Nouveau match pour ${protectedName} - ZAWJ`,
    html: getWaliNewMatchEmailHTML(waliName, protectedName, matchName, matchAge, matchCity),
    text: `As-salamu alaykum ${waliName}, ${protectedName} a un nouveau match avec ${matchName} (${matchAge} ans, ${matchCity}). Consultez le dashboard: ${process.env.FRONTEND_URL}/wali-dashboard`,
  })
}

// Email Template: Account Suspended
export function getAccountSuspendedEmailHTML(
  userName: string,
  reason: string,
  suspendUntil: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
    .warning-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">⚠️ Suspension de Compte</h1>
    </div>
    <div class="content">
      <p>As-salamu alaykum ${userName},</p>
      
      <p>Nous vous informons que votre compte ZAWJ a été temporairement suspendu.</p>
      
      <div class="warning-box">
        <strong>Raison de la suspension :</strong><br>
        ${reason}
      </div>
      
      <p><strong>Durée de la suspension :</strong> jusqu'au ${suspendUntil}</p>
      
      <p>Après cette date, votre compte sera automatiquement réactivé. Nous vous rappelons l'importance de respecter nos conditions d'utilisation et notre code de conduite islamique.</p>
      
      <p>Si vous pensez qu'il s'agit d'une erreur, vous pouvez contacter notre équipe de support.</p>
      
      <p>Qu'Allah vous guide vers la voie droite.</p>
      
      <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe ZAWJ</strong></p>
    </div>
    <div class="footer">
      <p>© 2024 ZAWJ - Plateforme Matrimoniale Musulmane</p>
    </div>
  </div>
</body>
</html>
  `
}
