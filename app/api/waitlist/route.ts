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
      Subject: { Data: "You're on the Usemoos waitlist" },
      Body: {
        Text: {
          Data: `Hi,\n\nYou're on the list. We'll reach out when your slot opens.\n\n— The Usemoos team`,
        },
        Html: {
          Data: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:40px 48px;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <img src="https://usemoos.com/assets/usemoos_icon.png" alt="Usemoos" width="72" height="72" style="display:block;border-radius:16px;">
            </td>
          </tr>
          <tr>
            <td style="color:#18181b;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 14px;">Hi,</p>
              <p style="margin:0 0 14px;">You're on the list. We'll reach out when your slot opens.</p>
              <p style="margin:0;">— The Usemoos team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
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
