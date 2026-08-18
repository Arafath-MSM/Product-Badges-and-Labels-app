export const FREE_ACTIVE_BADGE_LIMIT = 3;

type AdminGraphql = {
  graphql: (query: string) => Promise<{ json: () => Promise<{ data?: { shop?: { id?: string } } }> }>;
};

type SubscriptionItem = {
  handle?: string;
  price?: { active?: boolean };
};

type ActiveSubscription = {
  billingPeriod?: string;
  cancelAtEndOfCycle?: boolean;
  trialEndsAt?: string | null;
  items?: SubscriptionItem[];
};

export type PlanEntitlement = {
  plan: "free" | "premium";
  isPremium: boolean;
  configured: boolean;
  billingPeriod: string | null;
  trialEndsAt: string | null;
  cancelAtEndOfCycle: boolean;
};

const freeEntitlement = (configured = false): PlanEntitlement => ({
  plan: "free",
  isPremium: false,
  configured,
  billingPeriod: null,
  trialEndsAt: null,
  cancelAtEndOfCycle: false,
});

async function getShopId(admin: unknown) {
  const response = await (admin as AdminGraphql).graphql(`#graphql
    query BadgeStudioShopId {
      shop { id }
    }
  `);
  const json = await response.json();
  return json.data?.shop?.id;
}

export async function getPlanEntitlement(admin: unknown): Promise<PlanEntitlement> {
  const organizationId = process.env.SHOPIFY_PARTNER_ORG_ID;
  const accessToken = process.env.SHOPIFY_PARTNER_API_ACCESS_TOKEN;
  const appId = process.env.SHOPIFY_APP_GID;
  const premiumHandle = process.env.SHOPIFY_PREMIUM_PLAN_HANDLE || "premium";

  if (!organizationId || !accessToken || !appId) return freeEntitlement();

  try {
    const shopId = await getShopId(admin);
    if (!shopId) return freeEntitlement(true);

    const response = await fetch(
      `https://partners.shopify.com/${organizationId}/api/2026-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: `#graphql
            query ActiveSubscription($appId: ID!, $shopId: ID!) {
              activeSubscription(appId: $appId, shopId: $shopId) {
                billingPeriod
                cancelAtEndOfCycle
                trialEndsAt
                items {
                  handle
                  price { active }
                }
              }
            }
          `,
          variables: { appId, shopId },
        }),
      },
    );

    if (!response.ok) throw new Error(`Partner API returned ${response.status}`);
    const json = (await response.json()) as {
      data?: { activeSubscription?: ActiveSubscription | null };
      errors?: Array<{ message: string }>;
    };
    if (json.errors?.length) throw new Error(json.errors.map((error) => error.message).join(", "));

    const subscription = json.data?.activeSubscription;
    const isPremium = Boolean(
      subscription?.items?.some((item) => item.handle === premiumHandle && item.price?.active !== false),
    );

    return {
      plan: isPremium ? "premium" : "free",
      isPremium,
      configured: true,
      billingPeriod: subscription?.billingPeriod ?? null,
      trialEndsAt: subscription?.trialEndsAt ?? null,
      cancelAtEndOfCycle: Boolean(subscription?.cancelAtEndOfCycle),
    };
  } catch (error) {
    console.error("Unable to verify Shopify App Pricing entitlement", error);
    return freeEntitlement(true);
  }
}

export function getPricingPlansUrl(shop: string) {
  const storeHandle = shop.replace(/\.myshopify\.com$/i, "");
  const appHandle = process.env.SHOPIFY_APP_HANDLE || "badge-studio-product-badges-1";
  return `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`;
}
