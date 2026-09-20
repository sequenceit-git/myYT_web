import { Resend } from 'resend';
import { config } from '../config';

const resend = new Resend(config.resendApiKey);

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends a 6-digit password reset verification email using Resend
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  resetCode: string,
  userName?: string
): Promise<SendEmailResult> {
  try {
    const fromAddress = config.resendFromEmail?.includes('<')
      ? config.resendFromEmail
      : `ytCash Security <${config.resendFromEmail || 'onboarding@resend.dev'}>`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Code - ytCash</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 24px;
      color: #1e293b;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 32px 24px;
      text-align: center;
      border-bottom: 3px solid #0284c7;
    }
    .logo-badge {
      display: inline-block;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #38bdf8;
      text-transform: uppercase;
    }
    .logo-sub {
      color: #94a3b8;
      font-size: 13px;
      margin-top: 4px;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 17px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .code-wrapper {
      background: #f1f5f9;
      border: 2px dashed #0284c7;
      border-radius: 14px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .code-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .code-value {
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #0369a1;
      font-family: 'Courier New', Courier, monospace;
      user-select: all;
    }
    .info-box {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 13px;
      color: #92400e;
      margin: 20px 0;
    }
    .footer {
      background: #f8fafc;
      padding: 20px 24px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">YTCASH SECURITY</div>
      <div class="logo-sub">Account Protection & Access Verification</div>
    </div>
    <div class="content">
      <div class="greeting">Hello ${userName ? userName.trim() : 'there'},</div>
      <div class="message">
        We received a request to reset your password for your <strong>ytCash</strong> account.
        Use the 6-digit verification code below to authorize your password change.
      </div>
      
      <div class="code-wrapper">
        <div class="code-label">Password Reset Verification Code</div>
        <div class="code-value">${resetCode}</div>
      </div>

      <div class="info-box">
        <strong>Important:</strong> This verification code will expire in <strong>15 minutes</strong>. Never share this code with anyone.
      </div>

      <div class="message" style="font-size: 13px; color: #64748b; margin-top: 20px;">
        If you did not request this password reset, please ignore this email or review your account security settings. Your current password remains unchanged.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ytCash Platform. All rights reserved.<br>
      This is an automated security transmission. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `ytCash Password Reset\n\nYour 6-digit verification code is: ${resetCode}\n\nThis code expires in 15 minutes. If you did not request this, please ignore this email.\n\nytCash Security`;

    const result = await resend.emails.send({
      from: fromAddress,
      to: toEmail,
      subject: `Your ytCash Password Reset Code: ${resetCode}`,
      html: htmlContent,
      text: textContent,
    });

    if (result.error) {
      console.warn(`[Resend Email] API responded with error for ${toEmail}:`, result.error);
      return {
        success: false,
        error: result.error.message || 'Failed to send reset email',
      };
    }

    console.log(`[Resend Email] Password reset code sent successfully to ${toEmail}. Message ID: ${result.data?.id}`);
    return {
      success: true,
      id: result.data?.id,
    };
  } catch (err: any) {
    console.error(`[Resend Email] Exception while sending email to ${toEmail}:`, err);
    return {
      success: false,
      error: err.message || 'Error occurred while sending email',
    };
  }
}
