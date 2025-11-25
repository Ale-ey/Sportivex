import { Resend } from "resend";

export const sendEmail = async (to, subject, html) => {
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.warn("Resend API key or email from address not configured. Email sending is disabled.");
    console.log("Email would be sent to:", to);
    console.log("Subject:", subject);
    console.log("Body:", html);
    console.log("To enable email sending, set RESEND_API_KEY and EMAIL_FROM in your .env file");
    return Promise.resolve({ id: "mock-email-id" });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Error sending email:", error);
      // If domain not verified, provide helpful message
      if (error.message && error.message.includes("not verified")) {
        console.error("Domain verification required. Use 'onboarding@resend.dev' for testing or verify your domain at https://resend.com/domains");
      }
      throw error;
    }

    console.log("Email sent successfully:", data?.id);
    return data;
  } catch (error) {
    console.error("Error sending email:", error.message || error);
    // Don't throw error - allow the request to continue
    // The password reset token is still created even if email fails
    throw error;
  }
};
