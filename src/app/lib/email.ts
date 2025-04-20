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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <!-- Header with Logo -->
      <div style="background: linear-gradient(to right, #FF4D8B, #B64FAA); text-align: center; padding: 30px 20px;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Comfort Stay PG</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Premium Accommodation Services</p>
      </div>
      
      <!-- Main Content -->
      <div style="background-color: white; padding: 30px; border-bottom: 1px solid #f0f0f0;">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">Registration Received</h2>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;">Dear ${name},</p>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;">Thank you for registering with Comfort Stay PG. We're excited to have you join our community!</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FF4D8B;">
          <p style="margin: 0; color: #444; font-size: 16px;"><strong>Status:</strong> Your registration is currently under review</p>
        </div>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;">Our admin team will review your application shortly. Once approved, you will receive your login credentials via email.</p>
        
        <div style="margin: 30px 0;">
          <p style="color: #555; line-height: 1.6; font-size: 16px;">If you have any questions about your registration or our services, please don't hesitate to contact us.</p>
        </div>
      </div>
      
      <!-- Features Section -->
      <div style="background-color: #FAFAFA; padding: 30px;">
        <h3 style="color: #333; font-size: 18px; margin-top: 0;">What to expect at Comfort Stay PG:</h3>
        
        <div style="display: table; width: 100%; margin: 20px 0;">
          <div style="display: table-row;">
            <div style="display: table-cell; padding: 10px; width: 33%; text-align: center;">
              <div style="background-color: rgba(255, 77, 139, 0.1); border-radius: 50%; width: 60px; height: 60px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: #FF4D8B; font-size: 24px;">🏠</span>
              </div>
              <p style="margin: 10px 0 0; color: #444; font-weight: 600;">Comfortable Rooms</p>
            </div>
            
            <div style="display: table-cell; padding: 10px; width: 33%; text-align: center;">
              <div style="background-color: rgba(182, 79, 170, 0.1); border-radius: 50%; width: 60px; height: 60px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: #B64FAA; font-size: 24px;">🍲</span>
              </div>
              <p style="margin: 10px 0 0; color: #444; font-weight: 600;">Nutritious Meals</p>
            </div>
            
            <div style="display: table-cell; padding: 10px; width: 33%; text-align: center;">
              <div style="background-color: rgba(255, 77, 139, 0.1); border-radius: 50%; width: 60px; height: 60px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: #FF4D8B; font-size: 24px;">🔒</span>
              </div>
              <p style="margin: 10px 0 0; color: #444; font-weight: 600;">24/7 Security</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #333; color: white; padding: 30px; text-align: center;">
        <p style="margin: 0 0 15px; font-size: 14px;">© ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
        
        <div style="margin-bottom: 20px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: white; text-decoration: none; margin: 0 10px; font-size: 14px;">Website</a>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: white; text-decoration: none; margin: 0 10px; font-size: 14px;">Contact Us</a>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/about" style="color: white; text-decoration: none; margin: 0 10px; font-size: 14px;">About Us</a>
        </div>
        
        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7);">123 PG Street, City, State, India - 123456</p>
      </div>
    </div>
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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <!-- Header with Logo -->
      <div style="background: linear-gradient(to right, #FF4D8B, #B64FAA); text-align: center; padding: 30px 20px;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Comfort Stay PG</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Premium Accommodation Services</p>
      </div>
      
      <!-- Main Content -->
      <div style="background-color: white; padding: 30px; border-bottom: 1px solid #f0f0f0;">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">Welcome to Comfort Stay PG!</h2>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;">Dear ${name},</p>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;">We're thrilled to inform you that your registration has been approved! You can now access our resident portal with the following credentials:</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FF4D8B;">
          <p style="margin: 0 0 10px; color: #444; font-size: 16px;"><strong>Your Email (Login ID):</strong> ${email}</p>
          <p style="margin: 0 0 10px; color: #444; font-size: 16px;"><strong>Your PG ID (for reference only):</strong> ${pgId}</p>
          <p style="margin: 0; color: #444; font-size: 16px;"><strong>Password:</strong> ${password}</p>
        </div>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;"><strong>Important:</strong> Please use your email address as your login ID when signing in to the portal.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="background: linear-gradient(to right, #FF4D8B, #B64FAA); color: white; text-decoration: none; padding: 12px 25px; border-radius: 50px; font-weight: 600; display: inline-block;">Login to Your Account</a>
        </div>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;">For security reasons, we recommend changing your password after your first login.</p>
      </div>
      
      <!-- Features Section -->
      <div style="background-color: #FAFAFA; padding: 30px;">
        <h3 style="color: #333; font-size: 18px; margin-top: 0;">What you can do with your account:</h3>
        
        <ul style="color: #555; line-height: 1.6; padding-left: 20px;">
          <li style="margin-bottom: 10px;">View your room details and payment history</li>
          <li style="margin-bottom: 10px;">Submit maintenance requests</li>
          <li style="margin-bottom: 10px;">Access meal schedules and menus</li>
          <li style="margin-bottom: 10px;">Communicate with management</li>
        </ul>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #333; color: white; padding: 30px; text-align: center;">
        <p style="margin: 0 0 15px; font-size: 14px;">© ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
        
        <div style="margin-bottom: 20px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: white; text-decoration: none; margin: 0 10px; font-size: 14px;">Website</a>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: white; text-decoration: none; margin: 0 10px; font-size: 14px;">Contact Us</a>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/about" style="color: white; text-decoration: none; margin: 0 10px; font-size: 14px;">About Us</a>
        </div>
        
        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7);">123 PG Street, City, State, India - 123456</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html, userId });
}

/**
 * Send email with reset credentials
 */
export async function sendResetCredentialsEmail(
  name: string,
  email: string,
  pgId: string,
  password: string,
  userId?: string | mongoose.Types.ObjectId
) {
  const subject = "Comfort Stay PG - Your Reset Login Credentials";

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <!-- Header with Logo -->
      <div style="background: linear-gradient(to right, #FF4D8B, #B64FAA); text-align: center; padding: 30px 20px;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Comfort Stay PG</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Premium Accommodation Services</p>
      </div>
      
      <!-- Main Content -->
      <div style="background-color: white; padding: 30px; border-bottom: 1px solid #f0f0f0;">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">Password Reset Completed</h2>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;">Dear ${name},</p>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;">Your login credentials have been reset. Here are your new login details:</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FF4D8B;">
          <p style="margin: 0 0 10px; color: #444; font-size: 16px;"><strong>Your Email (Login ID):</strong> ${email}</p>
          <p style="margin: 0 0 10px; color: #444; font-size: 16px;"><strong>Your PG ID (for reference only):</strong> ${pgId}</p>
          <p style="margin: 0; color: #444; font-size: 16px;"><strong>New Password:</strong> ${password}</p>
        </div>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;"><strong>Important:</strong> Please use your email address as your login ID when signing in to the portal.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="background: linear-gradient(to right, #FF4D8B, #B64FAA); color: white; text-decoration: none; padding: 12px 25px; border-radius: 50px; font-weight: 600; display: inline-block;">Login to Your Account</a>
        </div>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;">For security reasons, we recommend changing your password after your first login.</p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #333; color: white; padding: 30px; text-align: center;">
        <p style="margin: 0 0 15px; font-size: 14px;">© ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
        
        <div style="margin-bottom: 20px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: white; text-decoration: none; margin: 0 10px; font-size: 14px;">Website</a>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: white; text-decoration: none; margin: 0 10px; font-size: 14px;">Contact Us</a>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/about" style="color: white; text-decoration: none; margin: 0 10px; font-size: 14px;">About Us</a>
        </div>
        
        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7);">123 PG Street, City, State, India - 123456</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html, userId });
}

/**
 * Send email for rejected application
 */
export async function sendRejectionEmail(
  name: string,
  email: string,
  reason: string = "",
  userId?: string | mongoose.Types.ObjectId
) {
  const subject = "Comfort Stay PG - Registration Status Update";

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <!-- Header with Logo -->
      <div style="background: linear-gradient(to right, #FF4D8B, #B64FAA); text-align: center; padding: 30px 20px;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Comfort Stay PG</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Premium Accommodation Services</p>
      </div>
      
      <!-- Main Content -->
      <div style="background-color: white; padding: 30px; border-bottom: 1px solid #f0f0f0;">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">Registration Status Update</h2>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;">Dear ${name},</p>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;">Thank you for your interest in Comfort Stay PG. We have reviewed your registration application.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FF4D8B;">
          <p style="margin: 0; color: #444; font-size: 16px;"><strong>Status:</strong> We are unable to approve your application at this time.</p>
          ${reason ? `<p style="margin: 10px 0 0; color: #444; font-size: 16px;"><strong>Reason:</strong> ${reason}</p>` : ""}
        </div>
        
        <p style="color: #555; line-height: 1.6; font-size: 16px;">We appreciate your understanding and encourage you to contact us if you have any questions or would like to discuss other options.</p>
        
        <div style="margin: 30px 0;">
          <p style="color: #555; line-height: 1.6; font-size: 16px;">Thank you for considering Comfort Stay PG.</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #333; color: white; padding: 30px; text-align: center;">
        <p style="margin: 0 0 15px; font-size: 14px;">© ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
        
        <div style="margin-bottom: 20px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: white; text-decoration: none; margin: 0 10px; font-size: 14px;">Website</a>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: white; text-decoration: none; margin: 0 10px; font-size: 14px;">Contact Us</a>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/about" style="color: white; text-decoration: none; margin: 0 10px; font-size: 14px;">About Us</a>
        </div>
        
        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7);">123 PG Street, City, State, India - 123456</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html, userId });
}
