import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP)
  // For production, use real SMTP credentials
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development fallback - log to console
  return {
    sendMail: async (mailOptions) => {
      console.log('\n==================== EMAIL ====================');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Content:');
      console.log(mailOptions.html || mailOptions.text);
      console.log('===============================================\n');
      return { messageId: 'dev-' + Date.now() };
    }
  };
};

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
export const sendVerificationEmail = async (email, username, token) => {
  const transporter = createTransporter();
  
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'Mita <noreply@mita.app>',
    to: email,
    subject: 'Verifikasi Email Anda - Mita',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #042C71 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #CE4912; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Selamat Datang di Mita!</h1>
          </div>
          <div class="content">
            <h2>Halo, ${username}!</h2>
            <p>Terima kasih telah mendaftar di Mita. Untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verifikasi Email</a>
            </div>
            
            <p>Atau copy dan paste link ini ke browser Anda:</p>
            <p style="background: white; padding: 15px; border-radius: 5px; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <p><strong>Link ini akan kadaluarsa dalam 24 jam.</strong></p>
            
            <p>Jika Anda tidak mendaftar di Mita, abaikan email ini.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Mita by Twenti Studio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, username, token) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'Mita <noreply@mita.app>',
    to: email,
    subject: 'Reset Password - Mita',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #042C71 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #CE4912; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Reset Password</h1>
          </div>
          <div class="content">
            <h2>Halo, ${username}!</h2>
            <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Atau copy dan paste link ini ke browser Anda:</p>
            <p style="background: white; padding: 15px; border-radius: 5px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <p><strong>Link ini akan kadaluarsa dalam 1 jam.</strong></p>
            
            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Mita by Twenti Studio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
