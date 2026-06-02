import { CosmosClient } from "@azure/cosmos";

let client;
export function getCosmos() {
  if (!client) {
    client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY,
    });
  }
  const db = client.database(process.env.COSMOS_DB || "hpk");
  return {
    menu: db.container("menu"),
    orders: db.container("orders"),
    contacts: db.container("contacts"),
  };
}
