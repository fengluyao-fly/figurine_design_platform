/**
 * Notification service for sending admin alerts via email
 * Uses Resend API for email delivery
 */

const ADMIN_EMAIL = "fengluyao1@hotmail.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "orders@makermart.art";

interface NotificationPayload {
  type: "new_order" | "model_upload" | "payment_received";
  subject: string;
  message: string;
  html?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send email notification using Resend API
 */
async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
  // Log notification regardless of email service availability
  console.log(`[Email Notification] To: ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Message: ${text.substring(0, 200)}...`);
  
  if (!RESEND_API_KEY) {
    console.log(`[Email] Resend API key not configured, logging only`);
    return false;
  }
  
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        text,
        html: html || text.replace(/\n/g, "<br>"),
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`[Email] Failed to send: ${error}`);
      return false;
    }
    
    console.log(`[Email] Successfully sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email] Error sending email:`, error);
    return false;
  }
}

/**
 * Send notification to admin
 */
export async function notifyAdmin(payload: NotificationPayload): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // Log notification
  console.log(`[Notification] ${timestamp}`);
  console.log(`  Type: ${payload.type}`);
  console.log(`  Subject: ${payload.subject}`);
  console.log(`  Message: ${payload.message}`);
  if (payload.metadata) {
    console.log(`  Metadata:`, JSON.stringify(payload.metadata, null, 2));
  }
  
  // Send email to admin
  await sendEmail(ADMIN_EMAIL, payload.subject, payload.message, payload.html);
}

/**
 * Notify admin when a new order is submitted
 */
export async function notifyNewOrder(data: {
  orderId: number;
  projectId: number;
  contactEmail: string;
  contactPhone?: string;
  feedback?: string;
  isUserUploaded?: boolean;
  modelUrl?: string;
}): Promise<void> {
  const orderType = data.isUserUploaded ? "User Uploaded Model" : "AI Generated Model";
  const siteUrl = process.env.VITE_SITE_URL || "https://makermart.art";
  
  const message = `
A new order has been submitted:

Order ID: ${data.orderId}
Project ID: ${data.projectId}
Type: ${orderType}
Customer Email: ${data.contactEmail}
Customer Phone: ${data.contactPhone || "Not provided"}

Modification Feedback:
${data.feedback || "No feedback provided"}

${data.modelUrl ? `Model URL: ${data.modelUrl}` : ""}

View project: ${siteUrl}/project/${data.projectId}
  `.trim();

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #7c3aed;">🎉 New Order Received!</h2>
  
  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Order Details</h3>
    <p><strong>Order ID:</strong> #${data.orderId}</p>
    <p><strong>Project ID:</strong> #${data.projectId}</p>
    <p><strong>Type:</strong> ${orderType}</p>
  </div>
  
  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Customer Contact</h3>
    <p><strong>Email:</strong> <a href="mailto:${data.contactEmail}">${data.contactEmail}</a></p>
    <p><strong>Phone:</strong> ${data.contactPhone || "Not provided"}</p>
  </div>
  
  <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Modification Feedback</h3>
    <p>${data.feedback || "No feedback provided"}</p>
  </div>
  
  ${data.modelUrl ? `<p><a href="${data.modelUrl}" style="color: #7c3aed;">Download 3D Model</a></p>` : ""}
  
  <p style="margin-top: 30px;">
    <a href="${siteUrl}/project/${data.projectId}" 
       style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
      View Project
    </a>
  </p>
</div>
  `.trim();

  await notifyAdmin({
    type: "new_order",
    subject: `[Maker Mart] New Order #${data.orderId} - ${orderType}`,
    message,
    html,
    metadata: {
      orderId: data.orderId,
      projectId: data.projectId,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      isUserUploaded: data.isUserUploaded,
    },
  });
}

/**
 * Notify admin when a user uploads their own 3D model
 */
export async function notifyModelUpload(data: {
  projectId: number;
  fileName: string;
  contactEmail: string;
  contactPhone?: string;
  notes?: string;
  modelUrl?: string;
}): Promise<void> {
  const siteUrl = process.env.VITE_SITE_URL || "https://makermart.art";
  
  const message = `
A user has uploaded their own 3D model:

Project ID: ${data.projectId}
File Name: ${data.fileName}
Customer Email: ${data.contactEmail}
Customer Phone: ${data.contactPhone || "Not provided"}

Notes:
${data.notes || "No notes provided"}

${data.modelUrl ? `Model URL: ${data.modelUrl}` : ""}

Please review the model and contact the customer.
  `.trim();

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #7c3aed;">📦 New Model Upload!</h2>
  
  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Upload Details</h3>
    <p><strong>Project ID:</strong> #${data.projectId}</p>
    <p><strong>File Name:</strong> ${data.fileName}</p>
  </div>
  
  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Customer Contact</h3>
    <p><strong>Email:</strong> <a href="mailto:${data.contactEmail}">${data.contactEmail}</a></p>
    <p><strong>Phone:</strong> ${data.contactPhone || "Not provided"}</p>
  </div>
  
  <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Customer Notes</h3>
    <p>${data.notes || "No notes provided"}</p>
  </div>
  
  ${data.modelUrl ? `<p><a href="${data.modelUrl}" style="color: #7c3aed;">Download 3D Model</a></p>` : ""}
</div>
  `.trim();

  await notifyAdmin({
    type: "model_upload",
    subject: `[Maker Mart] New Model Upload - Project #${data.projectId}`,
    message,
    html,
    metadata: {
      projectId: data.projectId,
      fileName: data.fileName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    },
  });
}

/**
 * Notify admin when payment is received (kept for future use)
 */
export async function notifyPaymentReceived(data: {
  orderId: number;
  projectId: number;
  amount: number;
  currency: string;
  customerEmail: string;
}): Promise<void> {
  await notifyAdmin({
    type: "payment_received",
    subject: `[Maker Mart] Payment Received - Order #${data.orderId}`,
    message: `
Payment has been received:

Order ID: ${data.orderId}
Project ID: ${data.projectId}
Amount: ${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}
Customer Email: ${data.customerEmail}

The order is now confirmed. Please proceed with the design review.
    `.trim(),
    metadata: {
      orderId: data.orderId,
      projectId: data.projectId,
      amount: data.amount,
      currency: data.currency,
      customerEmail: data.customerEmail,
    },
  });
}
