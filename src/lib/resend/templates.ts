// ---------------------------------------------------------------------------
// ManyHandz — Dark-themed HTML email templates
// ---------------------------------------------------------------------------
// All templates return raw HTML strings with inline CSS.  The colour palette
// mirrors the app's dark theme so that transactional emails feel cohesive.
// ---------------------------------------------------------------------------

const BRAND = {
  name: "ManyHandz",
  tagline: "Many hands make light work",
  logoUrl: "https://manyhandz.com/logo.png",
  primaryColor: "#6366f1",
  primaryHover: "#818cf8",
  bgPrimary: "#0a0e1a",
  bgSecondary: "#111827",
  bgTertiary: "#1f2937",
  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  successColor: "#34d399",
  warningColor: "#fbbf24",
  dangerColor: "#f87171",
  borderColor: "rgba(148, 163, 184, 0.12)",
} as const;

// ---------------------------------------------------------------------------
// Base template — wraps arbitrary HTML content in the branded email shell
// ---------------------------------------------------------------------------
export function baseTemplate(content: string, subject: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bgPrimary};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${BRAND.textPrimary};-webkit-font-smoothing:antialiased;">
  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bgPrimary};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <!-- Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${BRAND.bgSecondary};border-radius:12px;border:1px solid ${BRAND.borderColor};overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 16px;text-align:center;border-bottom:1px solid ${BRAND.borderColor};">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:${BRAND.primaryColor};letter-spacing:-0.02em;">
                ${BRAND.name}
              </h1>
              <p style="margin:4px 0 0;font-size:12px;color:${BRAND.textMuted};">${BRAND.tagline}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid ${BRAND.borderColor};text-align:center;">
              <p style="margin:0;font-size:12px;color:${BRAND.textMuted};line-height:1.6;">
                &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.<br />
                <a href="https://manyhandz.com/unsubscribe" style="color:${BRAND.textMuted};text-decoration:underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="https://manyhandz.com/privacy" style="color:${BRAND.textMuted};text-decoration:underline;">Privacy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
  <tr>
    <td style="background-color:${BRAND.primaryColor};border-radius:8px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:12px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:${BRAND.textPrimary};line-height:1.3;">${text}</h2>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;color:${BRAND.textSecondary};line-height:1.7;">${text}</p>`;
}

function statBox(label: string, value: string | number, color?: string): string {
  return `<td style="padding:12px;text-align:center;background-color:${BRAND.bgTertiary};border-radius:8px;">
  <div style="font-size:24px;font-weight:700;color:${color || BRAND.primaryColor};">${value}</div>
  <div style="font-size:11px;color:${BRAND.textMuted};margin-top:4px;text-transform:uppercase;letter-spacing:0.05em;">${label}</div>
</td>`;
}

// ---------------------------------------------------------------------------
// Template: Welcome
// ---------------------------------------------------------------------------
export function welcomeEmail(name: string): string {
  const content = `
    ${heading(`Welcome to ${BRAND.name}, ${name}!`)}
    ${paragraph("We're thrilled to have you on board. ManyHandz helps your household coordinate chores, track completion, and keep things fair for everyone.")}
    ${paragraph("Here's what you can do to get started:")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:12px 16px;background-color:${BRAND.bgTertiary};border-radius:8px;border-left:3px solid ${BRAND.primaryColor};margin-bottom:8px;">
          <p style="margin:0;font-size:14px;color:${BRAND.textPrimary};font-weight:600;">1. Create your household</p>
          <p style="margin:4px 0 0;font-size:13px;color:${BRAND.textSecondary};">Set up a household and invite your family or roommates.</p>
        </td>
      </tr>
      <tr><td style="height:8px;"></td></tr>
      <tr>
        <td style="padding:12px 16px;background-color:${BRAND.bgTertiary};border-radius:8px;border-left:3px solid ${BRAND.primaryColor};">
          <p style="margin:0;font-size:14px;color:${BRAND.textPrimary};font-weight:600;">2. Add your chores</p>
          <p style="margin:4px 0 0;font-size:13px;color:${BRAND.textSecondary};">Create chore templates and set up rotation schedules.</p>
        </td>
      </tr>
      <tr><td style="height:8px;"></td></tr>
      <tr>
        <td style="padding:12px 16px;background-color:${BRAND.bgTertiary};border-radius:8px;border-left:3px solid ${BRAND.primaryColor};">
          <p style="margin:0;font-size:14px;color:${BRAND.textPrimary};font-weight:600;">3. Track progress</p>
          <p style="margin:4px 0 0;font-size:13px;color:${BRAND.textSecondary};">Complete chores with photo proof and see fairness scores.</p>
        </td>
      </tr>
    </table>
    ${ctaButton("Go to your Dashboard", "https://manyhandz.com/dashboard")}
  `;
  return baseTemplate(content, `Welcome to ${BRAND.name}!`);
}

// ---------------------------------------------------------------------------
// Template: Weekly Digest
// ---------------------------------------------------------------------------
export function weeklyDigestEmail(data: {
  memberName: string;
  completions: number;
  streak: number;
  mvp: string;
}): string {
  const content = `
    ${heading(`Weekly Recap for ${data.memberName}`)}
    ${paragraph("Here's how your household did this week:")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="8" style="margin-bottom:24px;">
      <tr>
        ${statBox("Completions", data.completions, BRAND.successColor)}
        ${statBox("Day Streak", data.streak, BRAND.warningColor)}
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:16px;background-color:${BRAND.bgTertiary};border-radius:8px;text-align:center;">
          <p style="margin:0;font-size:12px;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.05em;">MVP of the Week</p>
          <p style="margin:8px 0 0;font-size:18px;font-weight:700;color:${BRAND.primaryColor};">${data.mvp}</p>
        </td>
      </tr>
    </table>
    ${paragraph("Keep up the great work! Every completed chore brings your household closer to a balanced, happy home.")}
    ${ctaButton("View Full Report", "https://manyhandz.com/dashboard/analytics")}
  `;
  return baseTemplate(content, "Your Weekly Household Recap");
}

// ---------------------------------------------------------------------------
// Template: Approval Request
// ---------------------------------------------------------------------------
export function approvalRequestEmail(data: {
  parentName: string;
  kidName: string;
  choreName: string;
  url: string;
}): string {
  const content = `
    ${heading("Chore Approval Needed")}
    ${paragraph(`Hi ${data.parentName},`)}
    ${paragraph(`<strong style="color:${BRAND.textPrimary};">${data.kidName}</strong> has submitted photo proof for <strong style="color:${BRAND.textPrimary};">${data.choreName}</strong> and is waiting for your approval.`)}
    ${ctaButton("Review & Approve", data.url)}
    ${paragraph("If you don't recognize this submission, you can ignore it safely.")}
  `;
  return baseTemplate(content, `${data.kidName} completed ${data.choreName}`);
}

// ---------------------------------------------------------------------------
// Template: Overdue Alert
// ---------------------------------------------------------------------------
export function overdueAlertEmail(data: {
  memberName: string;
  choreName: string;
  url: string;
}): string {
  const content = `
    ${heading("Overdue Chore Reminder")}
    ${paragraph(`Hey ${data.memberName},`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:16px;background-color:rgba(248,113,113,0.08);border-radius:8px;border-left:3px solid ${BRAND.dangerColor};">
          <p style="margin:0;font-size:14px;color:${BRAND.textPrimary};font-weight:600;">${data.choreName}</p>
          <p style="margin:4px 0 0;font-size:13px;color:${BRAND.dangerColor};">This chore is past its due date.</p>
        </td>
      </tr>
    </table>
    ${paragraph("Don't worry, there's still time to get it done! Completing it now will keep your streak alive.")}
    ${ctaButton("Mark as Done", data.url)}
  `;
  return baseTemplate(content, `Reminder: ${data.choreName} is overdue`);
}

// ---------------------------------------------------------------------------
// Template: Trial Ending
// ---------------------------------------------------------------------------
export function trialEndingEmail(data: {
  name: string;
  daysRemaining: number;
  url: string;
}): string {
  const daysText = data.daysRemaining === 1 ? "1 day" : `${data.daysRemaining} days`;
  const content = `
    ${heading("Your Free Trial is Ending Soon")}
    ${paragraph(`Hi ${data.name},`)}
    ${paragraph(`Your ManyHandz free trial ends in <strong style="color:${BRAND.warningColor};">${daysText}</strong>. Subscribe now to keep all your household data and continue enjoying seamless chore coordination.`)}
    ${paragraph("With a subscription you get:")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:12px 16px;background-color:${BRAND.bgTertiary};border-radius:8px;">
          <ul style="margin:0;padding:0 0 0 16px;font-size:13px;color:${BRAND.textSecondary};line-height:2;">
            <li>Unlimited chores &amp; assignments</li>
            <li>Auto-rotation scheduling</li>
            <li>Photo proof &amp; AI verification</li>
            <li>Fairness scoring &amp; analytics</li>
            <li>Gamification &amp; rewards</li>
          </ul>
        </td>
      </tr>
    </table>
    ${ctaButton("Subscribe Now", data.url)}
  `;
  return baseTemplate(content, `Your trial ends in ${daysText}`);
}

// ---------------------------------------------------------------------------
// Template: Payment Failed
// ---------------------------------------------------------------------------
export function paymentFailedEmail(data: {
  name: string;
  url: string;
}): string {
  const content = `
    ${heading("Payment Issue with Your Account")}
    ${paragraph(`Hi ${data.name},`)}
    ${paragraph("We weren't able to process your latest payment for ManyHandz. This could be due to an expired card or insufficient funds.")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:16px;background-color:rgba(248,113,113,0.08);border-radius:8px;border-left:3px solid ${BRAND.dangerColor};">
          <p style="margin:0;font-size:14px;color:${BRAND.dangerColor};font-weight:600;">Action Required</p>
          <p style="margin:4px 0 0;font-size:13px;color:${BRAND.textSecondary};">Please update your payment method to avoid service interruption.</p>
        </td>
      </tr>
    </table>
    ${ctaButton("Update Payment Method", data.url)}
    ${paragraph("If you believe this is an error, please contact our support team.")}
  `;
  return baseTemplate(content, "Payment issue — action required");
}

// ---------------------------------------------------------------------------
// Template: Goal Completed
// ---------------------------------------------------------------------------
export function goalCompletedEmail(data: {
  memberName: string;
  goalTitle: string;
}): string {
  const content = `
    ${heading("Goal Achieved!")}
    ${paragraph(`Congratulations, ${data.memberName}!`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:24px;background-color:${BRAND.bgTertiary};border-radius:12px;text-align:center;">
          <div style="font-size:48px;line-height:1;">&#127942;</div>
          <p style="margin:12px 0 0;font-size:18px;font-weight:700;color:${BRAND.successColor};">${data.goalTitle}</p>
          <p style="margin:4px 0 0;font-size:13px;color:${BRAND.textMuted};">Goal completed</p>
        </td>
      </tr>
    </table>
    ${paragraph("Amazing work! You've shown dedication and consistency. Keep up the momentum and tackle your next challenge.")}
    ${ctaButton("View Your Goals", "https://manyhandz.com/dashboard/goals")}
  `;
  return baseTemplate(content, `Goal achieved: ${data.goalTitle}`);
}
