import { app } from "@azure/functions";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { EmailClient } from "@azure/communication-email";
import { getCosmos } from "../shared/cosmos.js";

const Schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(5).max(2000),
});

app.http("contact", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "contact",
  handler: async (req, ctx) => {
    try {
      const body = await req.json();
      const data = Schema.parse(body);
      const { contacts } = getCosmos();
      const id = randomUUID();
      await contacts.items.create({ id, ...data, createdAt: new Date().toISOString() });

      // Best-effort email notification via Azure Communication Services
      if (process.env.ACS_CONNECTION_STRING && process.env.ACS_SENDER_EMAIL) {
        try {
          const client = new EmailClient(process.env.ACS_CONNECTION_STRING);
          await client.beginSend({
            senderAddress: process.env.ACS_SENDER_EMAIL,
            recipients: { to: [{ address: process.env.ACS_SENDER_EMAIL }] },
            content: {
              subject: `New contact from ${data.name}`,
              plainText: `${data.email}\n\n${data.message}`,
            },
          });
        } catch (e) {
          ctx.warn("ACS email failed", e);
        }
      }

      return { status: 201, jsonBody: { id } };
    } catch (err) {
      ctx.error("contact failed", err);
      const status = err?.issues ? 400 : 500;
      return { status, jsonBody: { error: err?.message || "Failed" } };
    }
  },
});
