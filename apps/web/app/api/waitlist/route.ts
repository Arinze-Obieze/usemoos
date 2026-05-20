export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email: unknown = body?.email;

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const airtablePromise = fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Waitlist`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Email: email,
          "Signed Up": new Date().toISOString(),
        },
      }),
    }
  );

  const loopsPromise = fetch("https://app.loops.so/api/v1/contacts/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      source: "Waitlist",
      subscribed: true,
    }),
  });

  await Promise.all([airtablePromise, loopsPromise]);

  return Response.json({ ok: true });
}
