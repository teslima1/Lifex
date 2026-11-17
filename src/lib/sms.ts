// Termii SMS integration for Nigeria

const TERMII_API_URL = "https://api.ng.termii.com/api/sms/send";

interface SMSOptions {
  to: string;
  sms: string;
}

async function sendSMS({ to, sms }: SMSOptions) {
  if (!process.env.TERMII_API_KEY) {
    console.log("[SMS - DEV MODE] Would send to", to, ":", sms);
    return;
  }

  const phone = to.startsWith("+") ? to.replace("+", "") : `234${to.replace(/^0/, "")}`;

  try {
    const res = await fetch(TERMII_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: phone,
        from: process.env.TERMII_SENDER_ID || "LIFEX",
        sms,
        type: "plain",
        channel: "generic",
        api_key: process.env.TERMII_API_KEY,
      }),
    });
    if (!res.ok) {
      console.error("[SMS] Termii error:", await res.text());
    }
  } catch (err) {
    console.error("[SMS] Failed to send:", err);
  }
}

export async function sendPaymentVerifiedSMS(phone: string, name: string) {
  await sendSMS({
    to: phone,
    sms: `LIFEX Clinic: Hi ${name}, your payment has been verified. Your appointment is now confirmed. See your dashboard for details.`,
  });
}

export async function sendPaymentRejectedSMS(phone: string, name: string) {
  await sendSMS({
    to: phone,
    sms: `LIFEX Clinic: Hi ${name}, we could not verify your payment. Please log in to re-upload your proof or contact us: +234 703 724 4339`,
  });
}

export async function sendFollowUpReminderSMS(phone: string, name: string, date: string) {
  await sendSMS({
    to: phone,
    sms: `LIFEX Clinic: Hi ${name}, your follow-up appointment is due on ${date}. Log in to book: lifexclinic.com`,
  });
}

export async function sendNewMessageSMS(phone: string, name: string, senderName: string) {
  await sendSMS({
    to: phone,
    sms: `LIFEX Clinic: Hi ${name}, you have a new message from ${senderName}. Log in to reply: lifexclinic.com`,
  });
}
