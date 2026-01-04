/**
 * Email Service - Handles sending emails via Resend API or SMTP
 * 
 * For autonomous email sending, you need to configure:
 * 1. RESEND_API_KEY - API key from resend.com
 * 2. Verify your domain (marlos.com.br) in Resend dashboard
 * 
 * Alternative: Use SMTP with:
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */

import { getEmailConfig } from "../db";

// Default sender email
const DEFAULT_SENDER = "marlos@marlos.com.br";
const DEFAULT_SENDER_NAME = "Conselho IA Geopolítica FGV";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Replace template variables in email content
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

/**
 * Send email using Resend API
 */
async function sendWithResend(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not configured");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options.from || `${DEFAULT_SENDER_NAME} <${DEFAULT_SENDER}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Email] Resend API error:", errorData);
      return { 
        success: false, 
        error: errorData.message || `HTTP ${response.status}` 
      };
    }

    const data = await response.json();
    console.log("[Email] Sent successfully via Resend:", data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("[Email] Error sending via Resend:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Main email sending function using Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // Always use the default sender
  const emailOptions = {
    ...options,
    from: `${DEFAULT_SENDER_NAME} <${DEFAULT_SENDER}>`,
  };

  // Use Resend API
  if (process.env.RESEND_API_KEY) {
    return sendWithResend(emailOptions);
  }

  console.warn("[Email] RESEND_API_KEY not configured");
  return { 
    success: false, 
    error: "RESEND_API_KEY not configured. Configure in Settings > Secrets." 
  };
}

/**
 * Send email using a configured template
 */
export async function sendTemplatedEmail(
  configKey: string,
  to: string | string[],
  variables: Record<string, string>
): Promise<EmailResult> {
  const config = await getEmailConfig(configKey);
  
  if (!config) {
    console.warn(`[Email] Config not found for key: ${configKey}`);
    return { success: false, error: `Email config not found: ${configKey}` };
  }

  if (!config.sendEmails) {
    console.log(`[Email] Sending disabled for: ${configKey}`);
    return { success: true, messageId: "disabled" };
  }

  const subject = config.emailSubject 
    ? replaceTemplateVariables(config.emailSubject, variables)
    : `[Conselho IA Geopolítica FGV] Notificação`;

  const html = config.emailBody
    ? replaceTemplateVariables(config.emailBody, variables)
    : `<p>${variables.content || 'Notificação do sistema'}</p>`;

  return sendEmail({
    to,
    subject,
    html,
  });
}

/**
 * Send analysis completion notification
 */
export async function sendAnalysisCompleteEmail(
  userEmail: string,
  userName: string,
  analysisTitle: string,
  dashboardUrl: string
): Promise<EmailResult> {
  return sendTemplatedEmail("analysis_complete", userEmail, {
    userName,
    title: analysisTitle,
    dashboardUrl,
  });
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  analysisQuota: number,
  systemUrl: string
): Promise<EmailResult> {
  return sendTemplatedEmail("new_user_welcome", userEmail, {
    userName,
    analysisQuota: String(analysisQuota),
    systemUrl,
  });
}

/**
 * Send contact form notification to admin
 */
export async function sendContactFormEmail(
  senderName: string,
  senderEmail: string,
  subject: string,
  message: string
): Promise<EmailResult> {
  const config = await getEmailConfig("contact_form");
  const adminEmail = config?.configValue || "marlos@marlos.com.br";

  return sendTemplatedEmail("contact_form", adminEmail, {
    senderName,
    senderEmail,
    subject,
    message,
  });
}

/**
 * Send admin notification
 */
export async function sendAdminNotification(
  title: string,
  content: string
): Promise<EmailResult> {
  const config = await getEmailConfig("admin_notification");
  const adminEmail = config?.configValue || "marlos@marlos.com.br";

  return sendTemplatedEmail("admin_notification", adminEmail, {
    title,
    content,
  });
}
