import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { FREE_ACTIVE_BADGE_LIMIT, getPlanEntitlement, getPricingPlansUrl } from "../billing.server";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const [entitlement, activeBadgeCount] = await Promise.all([
    getPlanEntitlement(admin),
    db.badge.count({ where: { shop: session.shop, enabled: true } }),
  ]);
  return {
    entitlement,
    activeBadgeCount,
    freeBadgeLimit: FREE_ACTIVE_BADGE_LIMIT,
    pricingPlansUrl: getPricingPlansUrl(session.shop),
  };
};

export default function PlansPage() {
  const { entitlement, activeBadgeCount, freeBadgeLimit, pricingPlansUrl } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Plans">
      <s-section heading="Choose the plan that fits your store">
        <s-stack direction="inline" gap="base">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading>Free</s-heading>
              <s-paragraph>$0/month</s-paragraph>
              <s-paragraph>Up to {freeBadgeLimit} active product badges.</s-paragraph>
              <s-paragraph>{activeBadgeCount} active badge{activeBadgeCount === 1 ? "" : "s"} currently.</s-paragraph>
              {!entitlement.isPremium ? <s-badge tone="success">Current plan</s-badge> : null}
            </s-stack>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading>Premium</s-heading>
              <s-paragraph>$20/month</s-paragraph>
              <s-paragraph>Create and enable unlimited product badges.</s-paragraph>
              {entitlement.isPremium ? (
                <s-badge tone="success">Current plan</s-badge>
              ) : (
                <s-button variant="primary" href={pricingPlansUrl} target="_top">Upgrade to Premium</s-button>
              )}
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>
      {!entitlement.configured ? (
        <s-banner tone="warning" heading="Billing verification is not configured">
          Add the Partner API environment variables before enabling the Premium plan publicly.
        </s-banner>
      ) : null}
    </s-page>
  );
}
