import { app } from "@azure/functions";
import { getCosmos } from "../shared/cosmos.js";

app.http("menu", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "menu",
  handler: async (req, ctx) => {
    try {
      const { menu } = getCosmos();
      const { resources } = await menu.items
        .query("SELECT * FROM c WHERE c.available = true")
        .fetchAll();
      return { jsonBody: { items: resources } };
    } catch (err) {
      ctx.error("menu list failed", err);
      return { status: 500, jsonBody: { error: "Failed to load menu" } };
    }
  },
});
