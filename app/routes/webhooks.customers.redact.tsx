import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await authenticate.webhook(request);
  console.info(`Customer redaction received for ${shop}; Badge Studio stores no customer data.`);
  return new Response(null, { status: 200 });
};
