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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
      <!-- Header -->
      <div style="background-color: #1a365d; padding: 20px; text-align: center; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Comfort Stay PG</h1>
      </div>
      
      <!-- Main Content -->
      <div style="background-color: white; padding: 30px 25px;">
        <h2 style="color: #1a365d; margin-top: 0; font-size: 20px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Registration Confirmation</h2>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">Dear ${name},</p>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">Thank you for registering with Comfort Stay PG. We appreciate your interest in our accommodation services.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #1a365d; margin: 20px 0;">
          <p style="margin: 0; color: #333; font-size: 15px;"><strong>Status:</strong> Your registration is currently under review</p>
        </div>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">Our administrative team will assess your application shortly. Upon approval, you will receive your login credentials via email.</p>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">If you have any questions regarding your registration or our services, please contact our support team.</p>
      </div>
      
      <!-- Features Section -->
      <div style="background-color: #f8f9fa; padding: 20px 25px;">
        <h3 style="color: #1a365d; font-size: 16px; margin-top: 0;">What to expect at Comfort Stay PG:</h3>
        
        <ul style="color: #333; line-height: 1.5; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Comfortable and well-maintained accommodation</li>
          <li style="margin-bottom: 8px;">Nutritious and balanced meals</li>
          <li style="margin-bottom: 8px;">24/7 security services</li>
          <li style="margin-bottom: 8px;">Clean and hygienic environment</li>
        </ul>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #1a365d; color: white; padding: 20px; text-align: center; font-size: 12px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;">
        <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
        <div style="margin-bottom: 10px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: white; text-decoration: none; margin: 0 10px;">Website</a> |
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: white; text-decoration: none; margin: 0 10px;">Contact Us</a> |
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="color: white; text-decoration: none; margin: 0 10px;">Login</a>
        </div>
        <p style="margin: 0;">123 PG Street, City, State, India - 123456</p>
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
      <!-- Header -->
      <div style="background-color: #1a365d; padding: 20px; text-align: center; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Comfort Stay PG</h1>
      </div>
      
      <!-- Main Content -->
      <div style="background-color: white; padding: 30px 25px;">
        <h2 style="color: #1a365d; margin-top: 0; font-size: 20px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Welcome to Comfort Stay PG</h2>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">Dear ${name},</p>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">We are pleased to inform you that your registration has been approved. Below are your login credentials for accessing our resident portal:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #1a365d; margin: 20px 0;">
          <p style="margin: 0 0 8px; color: #333; font-size: 15px;"><strong>Email (Login ID):</strong> ${email}</p>
          <p style="margin: 0 0 8px; color: #333; font-size: 15px;"><strong>PG ID (for reference only):</strong> ${pgId}</p>
          <p style="margin: 0; color: #333; font-size: 15px;"><strong>Password:</strong> ${password}</p>
        </div>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;"><strong>Important:</strong> Please use your email address as your login ID when signing in to the portal.</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="background-color: #1a365d; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: 500; display: inline-block; font-size: 15px;">Login to Your Account</a>
        </div>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">For security purposes, we recommend changing your password after your first login.</p>
      </div>
      
      <!-- Features Section -->
      <div style="background-color: #f8f9fa; padding: 20px 25px;">
        <h3 style="color: #1a365d; font-size: 16px; margin-top: 0;">What you can do with your account:</h3>
        
        <ul style="color: #333; line-height: 1.5; padding-left: 20px;">
          <li style="margin-bottom: 8px;">View your room details and payment history</li>
          <li style="margin-bottom: 8px;">Submit maintenance requests</li>
          <li style="margin-bottom: 8px;">Access meal schedules and menus</li>
          <li style="margin-bottom: 8px;">Communicate with management</li>
        </ul>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #1a365d; color: white; padding: 20px; text-align: center; font-size: 12px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;">
        <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
        <div style="margin-bottom: 10px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: white; text-decoration: none; margin: 0 10px;">Website</a> |
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: white; text-decoration: none; margin: 0 10px;">Contact Us</a> |
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="color: white; text-decoration: none; margin: 0 10px;">Login</a>
        </div>
        <p style="margin: 0;">123 PG Street, City, State, India - 123456</p>
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
      <!-- Header -->
      <div style="background-color: #1a365d; padding: 20px; text-align: center; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Comfort Stay PG</h1>
      </div>
      
      <!-- Main Content -->
      <div style="background-color: white; padding: 30px 25px;">
        <h2 style="color: #1a365d; margin-top: 0; font-size: 20px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Password Reset Completed</h2>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">Dear ${name},</p>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">Your login credentials have been reset successfully. Please find your new login details below:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #1a365d; margin: 20px 0;">
          <p style="margin: 0 0 8px; color: #333; font-size: 15px;"><strong>Email (Login ID):</strong> ${email}</p>
          <p style="margin: 0 0 8px; color: #333; font-size: 15px;"><strong>PG ID (for reference only):</strong> ${pgId}</p>
          <p style="margin: 0; color: #333; font-size: 15px;"><strong>New Password:</strong> ${password}</p>
        </div>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;"><strong>Important:</strong> Please use your email address as your login ID when signing in to the portal.</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="background-color: #1a365d; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: 500; display: inline-block; font-size: 15px;">Login to Your Account</a>
        </div>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">For security purposes, we strongly recommend changing your password after your first login.</p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #1a365d; color: white; padding: 20px; text-align: center; font-size: 12px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;">
        <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
        <div style="margin-bottom: 10px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: white; text-decoration: none; margin: 0 10px;">Website</a> |
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: white; text-decoration: none; margin: 0 10px;">Contact Us</a> |
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="color: white; text-decoration: none; margin: 0 10px;">Login</a>
        </div>
        <p style="margin: 0;">123 PG Street, City, State, India - 123456</p>
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
      <!-- Header -->
      <div style="background-color: #1a365d; padding: 20px; text-align: center; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Comfort Stay PG</h1>
      </div>
      
      <!-- Main Content -->
      <div style="background-color: white; padding: 30px 25px;">
        <h2 style="color: #1a365d; margin-top: 0; font-size: 20px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Registration Status Update</h2>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">Dear ${name},</p>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">Thank you for your interest in Comfort Stay PG. We have carefully reviewed your registration application.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #1a365d; margin: 20px 0;">
          <p style="margin: 0; color: #333; font-size: 15px;"><strong>Status:</strong> We regret to inform you that we are unable to approve your application at this time.</p>
          ${reason ? `<p style="margin: 10px 0 0; color: #333; font-size: 15px;"><strong>Reason:</strong> ${reason}</p>` : ""}
        </div>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">We appreciate your understanding and encourage you to contact our support team if you have any questions or would like to discuss alternative options.</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="background-color: #1a365d; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: 500; display: inline-block; font-size: 15px;">Contact Support</a>
        </div>
        
        <p style="color: #333; line-height: 1.5; font-size: 15px;">Thank you for considering Comfort Stay PG.</p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #1a365d; color: white; padding: 20px; text-align: center; font-size: 12px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;">
        <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Comfort Stay PG. All rights reserved.</p>
        <div style="margin-bottom: 10px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: white; text-decoration: none; margin: 0 10px;">Website</a> |
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: white; text-decoration: none; margin: 0 10px;">Contact Us</a> |
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="color: white; text-decoration: none; margin: 0 10px;">Login</a>
        </div>
        <p style="margin: 0;">123 PG Street, City, State, India - 123456</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html, userId });
}
