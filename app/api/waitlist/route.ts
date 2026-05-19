import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION ?? "eu-north-1",
});

const FROM = "hello@usemoos.com";
const ADMIN = "usemoos.com@gmail.com";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email: unknown = body?.email;

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const confirmation = new SendEmailCommand({
    Source: FROM,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: "You're on the Moose waitlist" },
      Body: {
        Text: {
          Data: `Hi,\n\nYou're on the list. We'll reach out when your slot opens.\n\n— The Moose team`,
        },
        Html: {
          Data: `<p>Hi,</p><p>You're on the list. We'll reach out when your slot opens.</p><p>— The Moose team</p>`,
        },
      },
    },
  });

  const notification = new SendEmailCommand({
    Source: FROM,
    Destination: { ToAddresses: [ADMIN] },
    Message: {
      Subject: { Data: `New waitlist signup: ${email}` },
      Body: {
        Text: { Data: `New signup: ${email}` },
      },
    },
  });

  await Promise.all([ses.send(confirmation), ses.send(notification)]);

  return Response.json({ ok: true });
}
