import { Resend } from "resend";
import { connectToDatabase } from "./db";
import { Notification } from "../api/models";
import mongoose from "mongoose";

// Create a Resend instance
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailData {
  to: string;
  subject: string;
  html: string;
  userId?: string | mongoose.Types.ObjectId;
  saveNotification?: boolean;
  notificationType?:
    | "Payment"
    | "Complaint"
    | "RoomChange"
    | "System"
    | "Email"
    | "Other";
  relatedId?: string | mongoose.Types.ObjectId;
  relatedModel?:
    | "Payment"
    | "Complaint"
    | "RoomChangeRequest"
    | "User"
    | "Room";
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  userId,
  saveNotification = true,
  notificationType = "Email",
  relatedId,
  relatedModel,
}: EmailData) {
  try {
    const data = await resend.emails.send({
      from:
        process.env.NEXT_PUBLIC_EMAIL_FROM ||
        "Comfort Stay PG <dev@ravindrachoudhary.in>",
      to,
      subject,
      html,
    });

    // Save notification if userId is provided and saveNotification is true
    if (userId && saveNotification) {
      try {
        await connectToDatabase();

        // Create a new notification
        await Notification.create({
          userId,
          title: subject,
          message: `Email sent: ${subject}`,
          type: notificationType,
          isRead: false,
          isEmailSent: true,
          emailDetails: {
            to,
            subject,
            sentAt: new Date(),
            success: true,
          },
          relatedId: relatedId || null,
          relatedModel: relatedModel || null,
          isActive: true,
        });
      } catch (notificationError) {
        console.error("Error saving notification:", notificationError);
        // Continue even if notification saving fails
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);

    // Save failed notification if userId is provided and saveNotification is true
    if (userId && saveNotification) {
      try {
        await connectToDatabase();

        // Create a new notification for failed email
        await Notification.create({
          userId,
          title: `Failed to send: ${subject}`,
          message: `Email failed to send: ${subject}`,
          type: notificationType,
          isRead: false,
          isEmailSent: false,
          emailDetails: {
            to,
            subject,
            sentAt: new Date(),
            success: false,
          },
          relatedId: relatedId || null,
          relatedModel: relatedModel || null,
          isActive: true,
        });
      } catch (notificationError) {
        console.error("Error saving notification:", notificationError);
        // Continue even if notification saving fails
      }
    }

    return { success: false, error };
  }
}

/**
 * Send registration confirmation email
 */
export async function sendRegistrationConfirmationEmail(
  name: string,
  email: string,
  userId?: string | mongoose.Types.ObjectId
) {
  const subject = "Registration Received - Comfort Stay PG";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <!--[if mso]>
      <style type="text/css">
        table {border-collapse: collapse;}
        .button {padding: 12px 24px !important;}
        .gradient-bg {background: #FF92B7 !important;}
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #fff5f8; color: #4a4a4a;">
      <center>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px;">
          <!-- Header -->
          <tr>
            <td style="padding: 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background: linear-gradient(90deg, #FF92B7 0%, #FFC0D6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600;">Comfort Stay PG</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="color: #FF92B7; font-size: 22px; margin: 0 0 20px; font-weight: 600;">Registration Received</h2>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px;">Dear ${name},</p>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">Thank you for registering with Comfort Stay PG. We're excited about your interest in our premium accommodation services!</p>
              
              <!-- Status Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffeef5; border-radius: 8px; margin: 0 0 25px;">
                <tr>
                  <td style="padding: 20px 25px;">
                    <p style="font-size: 16px; margin: 0; font-weight: 500;">
                      <span style="display: inline-block; width: 12px; height: 12px; background-color: #FFC0D6; border-radius: 50%; margin-right: 8px;"></span>
                      Your registration is currently under review
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">Our administrative team is reviewing your application and will process it shortly. Upon approval, we'll send you your login credentials via email.</p>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 25px;">If you have any questions about your registration, feel free to contact our support team.</p>
              
              <!-- Rules and Regulations Section -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td>
                    <h3 style="color: #d53f8c; font-size: 18px; margin: 0 0 15px;">Important Rules & Regulations:</h3>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin: 0 0 20px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h4 style="color: #d53f8c; font-size: 16px; margin: 0 0 10px;">General Rules:</h4>
                          <ul style="margin: 0; padding-left: 20px; color: #4a4a4a;">
                            <li style="margin-bottom: 8px;">No outside visitors without prior approval</li>
                            <li style="margin-bottom: 8px;">Meals only in the dining area</li>
                            <li style="margin-bottom: 8px;">Maintain cleanliness in rooms and common areas</li>
                            <li style="margin-bottom: 8px;">Noise control and peaceful environment</li>
                            <li style="margin-bottom: 0;">No gathering near the main gate</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin: 0 0 20px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h4 style="color: #d53f8c; font-size: 16px; margin: 0 0 10px;">Safety & Security:</h4>
                          <ul style="margin: 0; padding-left: 20px; color: #4a4a4a;">
                            <li style="margin-bottom: 8px;">Keep belongings safe and lock rooms when not in use</li>
                            <li style="margin-bottom: 8px;">No smoking, alcohol, or narcotics on premises</li>
                            <li style="margin-bottom: 8px;">Report maintenance issues promptly</li>
                            <li style="margin-bottom: 0;">Respectful behavior with roommates and staff</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h4 style="color: #d53f8c; font-size: 16px; margin: 0 0 10px;">Payment Rules:</h4>
                          <ul style="margin: 0; padding-left: 20px; color: #4a4a4a;">
                            <li style="margin-bottom: 8px;">Monthly rent due by the 5th of each month</li>
                            <li style="margin-bottom: 8px;">5% late payment penalty per week</li>
                            <li style="margin-bottom: 0;">15-day notice period for vacating</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Rules and Regulations Buttons -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rules-regulations" target="_blank" style="background: linear-gradient(90deg, #FF92B7 0%, #FFC0D6 100%); color: white; text-decoration: none; font-weight: 600; padding: 14px 30px; border-radius: 6px; font-size: 16px; display: inline-block; text-align: center; margin: 0 10px;">View Full Rules & Regulations</a>
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rules-regulations#download" target="_blank" style="background: white; color: #FF92B7; text-decoration: none; font-weight: 600; padding: 14px 30px; border-radius: 6px; font-size: 16px; display: inline-block; text-align: center; border: 2px solid #FF92B7; margin: 0 10px;">Download Rules PDF</a>
                  </td>
                </tr>
              </table>
              
              <!-- Features Section -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 25px;">
                <tr>
                  <td>
                    <h3 style="color: #d53f8c; font-size: 18px; margin: 0 0 15px;">What to expect at Comfort Stay PG:</h3>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="25" valign="top" style="padding-right: 10px; padding-bottom: 12px;">
                          <div style="width: 8px; height: 8px; background-color: #FF92B7; border-radius: 50%; margin-top: 6px;"></div>
                        </td>
                        <td style="font-size: 15px; padding-bottom: 12px;">Modern and comfortable accommodation with all amenities</td>
                      </tr>
                      <tr>
                        <td width="25" valign="top" style="padding-right: 10px; padding-bottom: 12px;">
                          <div style="width: 8px; height: 8px; background-color: #FF92B7; border-radius: 50%; margin-top: 6px;"></div>
                        </td>
                        <td style="font-size: 15px; padding-bottom: 12px;">Nutritious and delicious meals served three times daily</td>
                      </tr>
                      <tr>
                        <td width="25" valign="top" style="padding-right: 10px; padding-bottom: 12px;">
                          <div style="width: 8px; height: 8px; background-color: #FF92B7; border-radius: 50%; margin-top: 6px;"></div>
                        </td>
                        <td style="font-size: 15px; padding-bottom: 12px;">High-speed WiFi and fully furnished rooms</td>
                      </tr>
                      <tr>
                        <td width="25" valign="top" style="padding-right: 10px;">
                          <div style="width: 8px; height: 8px; background-color: #FF92B7; border-radius: 50%; margin-top: 6px;"></div>
                        </td>
                        <td style="font-size: 15px;">24/7 security with biometric access for your safety</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rules-regulations" target="_blank" style="background: linear-gradient(90deg, #FF92B7 0%, #FFC0D6 100%); color: white; text-decoration: none; font-weight: 600; padding: 14px 30px; border-radius: 6px; font-size: 16px; display: inline-block; text-align: center;">View Full Rules & Regulations</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background-color: #f9f9f9; padding: 20px 40px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #eee;">
                    <p style="font-size: 14px; color: #666; margin: 0 0 10px;">© ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
                    <p style="font-size: 14px; color: #666; margin: 0 0 5px;">Hinjewadi Phase 1 Rd, Mukai Nagar, Pune, Maharashtra 411057</p>
                    <p style="font-size: 14px; margin: 15px 0 0;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">Website</a> |
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">Contact</a> |
                      <a href="tel:+919922538989" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">+91 9922 538 989</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html, userId });
}

/**
 * Send welcome email with login credentials
 */
export async function sendWelcomeEmail(
  name: string,
  email: string,
  pgId: string,
  password: string,
  userId?: string | mongoose.Types.ObjectId
) {
  const subject = "Welcome to Comfort Stay PG - Your Login Credentials";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <!--[if mso]>
      <style type="text/css">
        table {border-collapse: collapse;}
        .button {padding: 12px 24px !important;}
        .gradient-bg {background: #FF92B7 !important;}
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #fff5f8; color: #4a4a4a;">
      <center>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px;">
          <!-- Header -->
          <tr>
            <td style="padding: 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background: linear-gradient(90deg, #FF92B7 0%, #FFC0D6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600;">Welcome to Comfort Stay PG!</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px;">Dear ${name},</p>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">We're thrilled to welcome you to Comfort Stay PG! Your registration has been approved, and we've created your account. Below are your login credentials to access our resident portal:</p>
              
              <!-- Credentials Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffeef5; border-radius: 8px; margin: 0 0 25px;">
                <tr>
                  <td style="padding: 20px 25px;">
                    <p style="font-size: 15px; margin: 0 0 10px;"><strong style="color: #d53f8c;">Email (Login ID):</strong> ${email}</p>
                    <p style="font-size: 15px; margin: 0 0 10px;"><strong style="color: #d53f8c;">PG ID:</strong> ${pgId}</p>
                    <p style="font-size: 15px; margin: 0 0 10px;"><strong style="color: #d53f8c;">Password:</strong> ${password}</p>
                    <p style="font-size: 14px; color: #666; margin: 15px 0 0; font-style: italic;">For security, please change your password after your first login.</p>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 25px;"><strong>Note:</strong> Please use your email address as your login ID when signing in.</p>
              
              <!-- Rules and Regulations Section -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td>
                    <h3 style="color: #d53f8c; font-size: 18px; margin: 0 0 15px;">Important Rules & Regulations:</h3>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin: 0 0 20px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h4 style="color: #d53f8c; font-size: 16px; margin: 0 0 10px;">General Rules:</h4>
                          <ul style="margin: 0; padding-left: 20px; color: #4a4a4a;">
                            <li style="margin-bottom: 8px;">No outside visitors without prior approval</li>
                            <li style="margin-bottom: 8px;">Meals only in the dining area</li>
                            <li style="margin-bottom: 8px;">Maintain cleanliness in rooms and common areas</li>
                            <li style="margin-bottom: 8px;">Noise control and peaceful environment</li>
                            <li style="margin-bottom: 0;">No gathering near the main gate</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin: 0 0 20px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h4 style="color: #d53f8c; font-size: 16px; margin: 0 0 10px;">Safety & Security:</h4>
                          <ul style="margin: 0; padding-left: 20px; color: #4a4a4a;">
                            <li style="margin-bottom: 8px;">Keep belongings safe and lock rooms when not in use</li>
                            <li style="margin-bottom: 8px;">No smoking, alcohol, or narcotics on premises</li>
                            <li style="margin-bottom: 8px;">Report maintenance issues promptly</li>
                            <li style="margin-bottom: 0;">Respectful behavior with roommates and staff</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h4 style="color: #d53f8c; font-size: 16px; margin: 0 0 10px;">Payment Rules:</h4>
                          <ul style="margin: 0; padding-left: 20px; color: #4a4a4a;">
                            <li style="margin-bottom: 8px;">Monthly rent due by the 5th of each month</li>
                            <li style="margin-bottom: 8px;">5% late payment penalty per week</li>
                            <li style="margin-bottom: 0;">15-day notice period for vacating</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Rules and Regulations Buttons -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/rules-regulations" target="_blank" style="background: linear-gradient(90deg, #FF92B7 0%, #FFC0D6 100%); color: white; text-decoration: none; font-weight: 600; padding: 14px 30px; border-radius: 6px; font-size: 16px; display: inline-block; text-align: center; margin: 0 10px;">View Full Rules & Regulations</a>
                  </td>
                </tr>
              </table>
              
              <!-- Features Section -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 10px;">
                <tr>
                  <td>
                    <h3 style="color: #d53f8c; font-size: 18px; margin: 0 0 15px;">What you can do with your account:</h3>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: separate; border-spacing: 0 12px;">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #FF92B7 0%, #FFC0D6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; text-align: center;">1</div>
                        </td>
                        <td style="font-size: 15px;">View your room details and payment history</td>
                      </tr>
                      <tr>
                        <td width="36" valign="top">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #FF92B7 0%, #FFC0D6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; text-align: center;">2</div>
                        </td>
                        <td style="font-size: 15px;">Submit maintenance requests and track their status</td>
                      </tr>
                      <tr>
                        <td width="36" valign="top">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #FF92B7 0%, #FFC0D6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; text-align: center;">3</div>
                        </td>
                        <td style="font-size: 15px;">Access meal schedules and daily menus</td>
                      </tr>
                      <tr>
                        <td width="36" valign="top">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #FF92B7 0%, #FFC0D6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; text-align: center;">4</div>
                        </td>
                        <td style="font-size: 15px;">Communicate directly with management</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 25px 0 10px;">We're delighted to have you as part of our community! If you have any questions, please don't hesitate to reach out to us.</p>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0;">Warm Regards,<br>
              <strong>The Comfort Stay PG Team</strong></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background-color: #f9f9f9; padding: 20px 40px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #eee;">
                    <p style="font-size: 14px; color: #666; margin: 0 0 10px;">© ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
                    <p style="font-size: 14px; color: #666; margin: 0 0 5px;">Hinjewadi Phase 1 Rd, Mukai Nagar, Pune, Maharashtra 411057</p>
                    <p style="font-size: 14px; margin: 15px 0 0;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">Website</a> |
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">Contact</a> |
                      <a href="tel:+919922538989" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">+91 9922 538 989</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html, userId });
}

/**
 * Send reset credentials email
 */
export async function sendResetCredentialsEmail(
  name: string,
  email: string,
  pgId: string,
  password: string,
  userId?: string | mongoose.Types.ObjectId
) {
  const subject = "Your Comfort Stay PG Account Has Been Reset";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <!--[if mso]>
      <style type="text/css">
        table {border-collapse: collapse;}
        .button {padding: 12px 24px !important;}
        .gradient-bg {background: #FF92B7 !important;}
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #fff5f8; color: #4a4a4a;">
      <center>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px;">
          <!-- Header -->
          <tr>
            <td style="padding: 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background: linear-gradient(90deg, #FF92B7 0%, #FFC0D6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600;">Account Credentials Reset</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px;">Dear ${name},</p>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">Your account credentials have been reset as requested. Below are your new login details:</p>
              
              <!-- Credentials Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffeef5; border-radius: 8px; margin: 0 0 25px;">
                <tr>
                  <td style="padding: 20px 25px;">
                    <p style="font-size: 15px; margin: 0 0 10px;"><strong style="color: #d53f8c;">Email (Login ID):</strong> ${email}</p>
                    <p style="font-size: 15px; margin: 0 0 10px;"><strong style="color: #d53f8c;">PG ID:</strong> ${pgId}</p>
                    <p style="font-size: 15px; margin: 0;"><strong style="color: #d53f8c;">New Password:</strong> ${password}</p>
                    <p style="font-size: 14px; color: #666; margin: 15px 0 0; font-style: italic;">For security, please change your password immediately after logging in.</p>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff8e1; border-radius: 8px; border-left: 4px solid #ffc107; margin: 0 0 25px;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="font-size: 15px; margin: 0; color: #856404;"><strong>Security Notice:</strong> If you did not request this password reset, please contact our support team immediately.</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" target="_blank" style="background: linear-gradient(90deg, #FF92B7 0%, #FFC0D6 100%); color: white; text-decoration: none; font-weight: 600; padding: 12px 30px; border-radius: 6px; font-size: 16px; display: inline-block; text-align: center;">Login with New Password</a>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 10px;">If you need any assistance, don't hesitate to reach out to our support team.</p>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0;">Warm Regards,<br>
              <strong>The Comfort Stay PG Team</strong></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background-color: #f9f9f9; padding: 20px 40px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #eee;">
                    <p style="font-size: 14px; color: #666; margin: 0 0 10px;">© ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
                    <p style="font-size: 14px; color: #666; margin: 0 0 5px;">Hinjewadi Phase 1 Rd, Mukai Nagar, Pune, Maharashtra 411057</p>
                    <p style="font-size: 14px; margin: 15px 0 0;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">Website</a> |
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">Contact</a> |
                      <a href="tel:+919922538989" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">+91 9922 538 989</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html, userId });
}

/**
 * Send rejection email
 */
export async function sendRejectionEmail(
  name: string,
  email: string,
  reason: string = "",
  userId?: string | mongoose.Types.ObjectId
) {
  const subject = "Application Status Update - Comfort Stay PG";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <!--[if mso]>
      <style type="text/css">
        table {border-collapse: collapse;}
        .button {padding: 12px 24px !important;}
        .gradient-bg {background: #FF92B7 !important;}
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #fff5f8; color: #4a4a4a;">
      <center>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px;">
          <!-- Header -->
          <tr>
            <td style="padding: 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background: linear-gradient(90deg, #FF92B7 0%, #FFC0D6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600;">Application Status Update</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px;">Dear ${name},</p>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">Thank you for your interest in Comfort Stay PG. We appreciate the time you took to submit your application.</p>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">After careful review of your application, we regret to inform you that we are unable to proceed with your registration at this time.</p>
              
              ${
                reason
                  ? `
              <!-- Reason Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin: 0 0 25px;">
                <tr>
                  <td style="padding: 20px 25px;">
                    <p style="font-size: 15px; margin: 0 0 5px;"><strong style="color: #d53f8c;">Reason:</strong></p>
                    <p style="font-size: 15px; margin: 0; line-height: 1.5;">${reason}</p>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">This decision was made based on our current accommodation availability and specific requirements. We encourage you to consider alternative housing options that may better suit your needs.</p>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 25px;">If you believe there's been an error or would like to discuss this further, please feel free to contact our support team.</p>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" target="_blank" style="background: linear-gradient(90deg, #FF92B7 0%, #FFC0D6 100%); color: white; text-decoration: none; font-weight: 600; padding: 12px 30px; border-radius: 6px; font-size: 16px; display: inline-block; text-align: center;">Contact Support</a>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 0;">Warm Regards,<br>
              <strong>The Comfort Stay PG Team</strong></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background-color: #f9f9f9; padding: 20px 40px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #eee;">
                    <p style="font-size: 14px; color: #666; margin: 0 0 10px;">© ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
                    <p style="font-size: 14px; color: #666; margin: 0 0 5px;">Hinjewadi Phase 1 Rd, Mukai Nagar, Pune, Maharashtra 411057</p>
                    <p style="font-size: 14px; margin: 15px 0 0;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">Website</a> |
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">Contact</a> |
                      <a href="tel:+919922538989" style="color: #FF92B7; text-decoration: none; margin: 0 10px;">+91 9922 538 989</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html, userId });
}
