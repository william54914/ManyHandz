import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
export const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@manyhandz.com";
export const supportEmail = process.env.SUPPORT_EMAIL || "support@manyhandz.com";
