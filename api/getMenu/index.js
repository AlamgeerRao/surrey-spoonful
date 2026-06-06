import { app } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;

const client = new CosmosClient({ endpoint, key });
const container = client.database("hpk").container("menu");

app.http("getMenu", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const query = "SELECT * FROM c WHERE c.available = true";
      const { resources } = await container.items.query(query).fetchAll();

      return {
        status: 200,
        jsonBody: resources,
      };
    } catch (error) {
      context.log("Error:", error);

      return {
        status: 500,
        jsonBody: { error: "Failed to load menu" },
      };
    }
  },
});
