import { Resend } from "resend";

// Create a Resend instance
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html }: EmailData) {
  try {
    const data = await resend.emails.send({
      from: "Comfort Stay PG <no-reply@comfortpg.com>",
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

/**
 * Send welcome email with login credentials
 */
export async function sendWelcomeEmail(
  name: string,
  email: string,
  pgId: string,
  password: string
) {
  const subject = "Welcome to Comfort Stay PG - Your Login Credentials";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 5px;">
      <div style="text-align: center; padding: 10px; background-color: #FF92B7; color: white; border-radius: 5px 5px 0 0;">
        <h1 style="margin: 0;">Welcome to Comfort Stay PG</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Dear ${name},</p>
        
        <p>Welcome to Comfort Stay PG! We're delighted to have you join our community.</p>
        
        <p>Your login credentials are as follows:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Login ID (PG ID):</strong> ${pgId}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        
        <p>Please keep these credentials safe. You can use them to log into our PG management portal at <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="color: #FF92B7;">${process.env.NEXT_PUBLIC_SITE_URL}/login</a></p>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our management team.</p>
        
        <p>Best regards,<br>Comfort Stay PG Management</p>
      </div>
      
      <div style="text-align: center; padding: 10px; background-color: #f0f0f0; color: #666; border-radius: 0 0 5px 5px; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send email with reset credentials
 */
export async function sendResetCredentialsEmail(
  name: string,
  email: string,
  pgId: string,
  password: string
) {
  const subject = "Comfort Stay PG - Your Reset Login Credentials";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 5px;">
      <div style="text-align: center; padding: 10px; background-color: #FF92B7; color: white; border-radius: 5px 5px 0 0;">
        <h1 style="margin: 0;">Comfort Stay PG</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Dear ${name},</p>
        
        <p>Your login credentials have been reset. Here are your new login details:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Login ID (PG ID):</strong> ${pgId}</p>
          <p><strong>New Password:</strong> ${password}</p>
        </div>
        
        <p>Please keep these credentials safe. You can use them to log into our PG management portal at <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="color: #FF92B7;">${process.env.NEXT_PUBLIC_SITE_URL}/login</a></p>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our management team.</p>
        
        <p>Best regards,<br>Comfort Stay PG Management</p>
      </div>
      
      <div style="text-align: center; padding: 10px; background-color: #f0f0f0; color: #666; border-radius: 0 0 5px 5px; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}
