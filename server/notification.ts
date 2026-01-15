/**
 * Notification service for sending admin alerts
 * Uses the built-in notification API
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@makermart.com";
const NOTIFICATION_ENDPOINT = process.env.VITE_ANALYTICS_ENDPOINT;

interface NotificationPayload {
  type: "new_order" | "model_upload" | "payment_received";
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send notification to admin
 * Logs to console and can be extended to send emails
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
  
  // In production, this would send an email or push notification
  // For now, we log it and store in database for admin dashboard
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
}): Promise<void> {
  const orderType = data.isUserUploaded ? "User Uploaded Model" : "AI Generated Model";
  
  await notifyAdmin({
    type: "new_order",
    subject: `New Order #${data.orderId} - ${orderType}`,
    message: `
A new order has been submitted:

Order ID: ${data.orderId}
Project ID: ${data.projectId}
Type: ${orderType}
Customer Email: ${data.contactEmail}
Customer Phone: ${data.contactPhone || "Not provided"}

Modification Feedback:
${data.feedback || "No feedback provided"}

Please review the order in the admin dashboard.
    `.trim(),
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
}): Promise<void> {
  await notifyAdmin({
    type: "model_upload",
    subject: `New Model Upload - Project #${data.projectId}`,
    message: `
A user has uploaded their own 3D model:

Project ID: ${data.projectId}
File Name: ${data.fileName}
Customer Email: ${data.contactEmail}
Customer Phone: ${data.contactPhone || "Not provided"}

Notes:
${data.notes || "No notes provided"}

Please review the model and contact the customer.
    `.trim(),
    metadata: {
      projectId: data.projectId,
      fileName: data.fileName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    },
  });
}

/**
 * Notify admin when payment is received
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
    subject: `Payment Received - Order #${data.orderId}`,
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
