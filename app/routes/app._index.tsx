import { useEffect, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import db from "../db.server";

type SelectedProduct = { id: string; title: string };
type GraphqlResult = { data?: { metafieldsSet?: { userErrors?: Array<{ message: string }> } } };
type GraphqlAdmin = {
  graphql: (query: string, options: { variables: Record<string, unknown> }) => Promise<{ json: () => Promise<GraphqlResult> }>;
};

async function publishProductBadges(admin: unknown, productIds: string[], badge: object | null) {
  if (!productIds.length) return;
  const response = await (admin as GraphqlAdmin).graphql(
    `#graphql
      mutation SaveBadgeMetafields($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) { userErrors { field message } }
      }`,
    { variables: { metafields: productIds.map((ownerId) => ({
      ownerId, namespace: "badge_studio", key: "badge", type: "json",
      value: JSON.stringify(badge ?? {}),
    })) } },
  );
  const json = await response.json();
  const errors = json.data?.metafieldsSet?.userErrors ?? [];
  if (errors.length) throw new Error(errors.map((error) => error.message).join(", "));
}

async function findAssignedProducts(shop: string, products: SelectedProduct[], excludeBadgeId?: string) {
  const badges = await db.badge.findMany({
    where: { shop, ...(excludeBadgeId ? { id: { not: excludeBadgeId } } : {}) },
    select: { productIds: true },
  });
  const assignedIds = new Set(
    badges.flatMap((badge) => (JSON.parse(badge.productIds) as SelectedProduct[]).map((product) => product.id)),
  );
  return products.filter((product) => assignedIds.has(product.id));
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const badges = await db.badge.findMany({ where: { shop: session.shop }, orderBy: { createdAt: "desc" } });
  return { badges: badges.map((badge) => ({ ...badge, productIds: JSON.parse(badge.productIds) as SelectedProduct[] })) };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = String(form.get("intent") || "create");

  if (intent === "toggle") {
    const badge = await db.badge.findFirst({ where: { id: String(form.get("id")), shop: session.shop } });
    if (!badge) return { ok: false, message: "Badge not found." };
    const products = JSON.parse(badge.productIds) as SelectedProduct[];
    const enabled = !badge.enabled;
    if (enabled) {
      const conflicts = await findAssignedProducts(session.shop, products, badge.id);
      if (conflicts.length) {
        return { ok: false, message: `Remove these products from another badge first: ${conflicts.map((product) => product.title).join(", ")}.` };
      }
    }
    const appearance = enabled ? {
      label: badge.label,
      position: badge.position,
      backgroundColor: badge.backgroundColor,
      textColor: badge.textColor,
      fontSize: badge.fontSize,
      borderRadius: badge.borderRadius,
    } : null;
    await publishProductBadges(admin, products.map((product) => product.id), appearance);
    await db.badge.update({ where: { id: badge.id }, data: { enabled } });
    return { ok: true, message: enabled ? "Badge enabled." : "Badge disabled." };
  }

  if (intent === "delete") {
    const badge = await db.badge.findFirst({ where: { id: String(form.get("id")), shop: session.shop } });
    if (!badge) return { ok: false, message: "Badge not found." };
    const products = JSON.parse(badge.productIds) as SelectedProduct[];
    await publishProductBadges(admin, products.map((product) => product.id), null);
    await db.badge.delete({ where: { id: badge.id } });
    return { ok: true, message: "Badge deleted." };
  }

  const name = String(form.get("name") || "").trim();
  const label = String(form.get("label") || "").trim();
  const products = JSON.parse(String(form.get("products") || "[]")) as SelectedProduct[];
  if (!name || !label || !products.length) return { ok: false, message: "Add a name, label, and at least one product." };

  const editingBadgeId = intent === "update" ? String(form.get("id")) : undefined;
  const conflicts = await findAssignedProducts(session.shop, products, editingBadgeId);
  if (conflicts.length) {
    return {
      ok: false,
      message: `Each product can have one badge. Already assigned: ${conflicts.map((product) => product.title).join(", ")}.`,
    };
  }

  const appearance = {
    label,
    position: String(form.get("position") || "top-left"),
    backgroundColor: String(form.get("backgroundColor") || "#111827"),
    textColor: String(form.get("textColor") || "#ffffff"),
    fontSize: Math.min(32, Math.max(10, Number(form.get("fontSize")) || 14)),
    borderRadius: Math.min(30, Math.max(0, Number(form.get("borderRadius")) || 6)),
  };
  if (intent === "update") {
    const badge = await db.badge.findFirst({ where: { id: String(form.get("id")), shop: session.shop } });
    if (!badge) return { ok: false, message: "Badge not found." };
    const previousProducts = JSON.parse(badge.productIds) as SelectedProduct[];
    const selectedIds = new Set(products.map((product) => product.id));
    await publishProductBadges(admin, previousProducts.map((product) => product.id).filter((id) => !selectedIds.has(id)), null);
    await publishProductBadges(admin, products.map((product) => product.id), badge.enabled ? appearance : null);
    await db.badge.update({ where: { id: badge.id }, data: { name, productIds: JSON.stringify(products), ...appearance } });
    return { ok: true, message: "Badge updated." };
  }
  await publishProductBadges(admin, products.map((product) => product.id), appearance);
  await db.badge.create({ data: { shop: session.shop, name, productIds: JSON.stringify(products), ...appearance } });
  return { ok: true, message: "Badge created and published to the selected products." };
};

export default function BadgeDashboard() {
  const { badges } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const shopify = useAppBridge();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [products, setProducts] = useState<SelectedProduct[]>([]);
  const [label, setLabel] = useState("New");
  const [position, setPosition] = useState("top-left");
  const [backgroundColor, setBackgroundColor] = useState("#111827");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(14);
  const [borderRadius, setBorderRadius] = useState(6);

  useEffect(() => { if (actionData?.message) shopify.toast.show(actionData.message, { isError: !actionData.ok }); }, [actionData, shopify]);

  const chooseProducts = async () => {
    const selection = await shopify.resourcePicker({ type: "product", multiple: true });
    if (selection) setProducts(selection.map((product) => ({ id: product.id, title: product.title })));
  };

  const editBadge = (badge: (typeof badges)[number]) => {
    setEditingId(badge.id); setName(badge.name); setProducts(badge.productIds);
    setLabel(badge.label); setPosition(badge.position); setBackgroundColor(badge.backgroundColor);
    setTextColor(badge.textColor); setFontSize(badge.fontSize); setBorderRadius(badge.borderRadius);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null); setName(""); setProducts([]); setLabel("New"); setPosition("top-left");
    setBackgroundColor("#111827"); setTextColor("#ffffff"); setFontSize(14); setBorderRadius(6);
  };

  return (
    <s-page heading="Product badges">
      <s-button slot="primary-action" onClick={chooseProducts}>Select products</s-button>
      <s-section heading={editingId ? "Edit badge" : "Create a badge"}>
        <Form method="post">
          <input type="hidden" name="intent" value={editingId ? "update" : "create"} />
          <input type="hidden" name="id" value={editingId ?? ""} />
          <input type="hidden" name="products" value={JSON.stringify(products)} />
          <s-stack direction="block" gap="base">
            <s-text-field label="Internal name" name="name" value={name} onInput={(event) => setName(event.currentTarget.value)} placeholder="Summer promotion" required />
            <s-text-field label="Badge text" name="label" value={label} onInput={(event) => setLabel(event.currentTarget.value)} required />
            <s-select label="Position" name="position" value={position} onChange={(event) => setPosition(event.currentTarget.value)}>
              <s-option value="top-left">Top left</s-option><s-option value="top-right">Top right</s-option>
              <s-option value="bottom-left">Bottom left</s-option><s-option value="bottom-right">Bottom right</s-option>
            </s-select>
            <s-stack direction="inline" gap="base">
              <label>Background <input aria-label="Background color" type="color" name="backgroundColor" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} /></label>
              <label>Text <input aria-label="Text color" type="color" name="textColor" value={textColor} onChange={(e) => setTextColor(e.target.value)} /></label>
              <label>Font size <input aria-label="Font size" type="number" name="fontSize" min="10" max="32" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} /></label>
              <label>Roundness <input aria-label="Border radius" type="number" name="borderRadius" min="0" max="30" value={borderRadius} onChange={(event) => setBorderRadius(Number(event.target.value))} /></label>
            </s-stack>
            <s-paragraph>{products.length ? `${products.length} product${products.length === 1 ? "" : "s"} selected: ${products.map((p) => p.title).join(", ")}` : "No products selected."}</s-paragraph>
            <div style={{ position: "relative", minHeight: 110, border: "1px solid #d1d5db", borderRadius: 8, background: "#f3f4f6" }}>
              <span style={{ position: "absolute", ...(position.includes("top") ? { top: 12 } : { bottom: 12 }), ...(position.includes("left") ? { left: 12 } : { right: 12 }), background: backgroundColor, color: textColor, padding: "6px 10px", borderRadius, fontSize, fontWeight: 700 }}>{label || "Preview"}</span>
            </div>
            <s-stack direction="inline" gap="base"><s-button type="button" onClick={chooseProducts}>Choose products</s-button><s-button type="submit" variant="primary" {...(navigation.state === "submitting" ? { loading: true } : {})}>{editingId ? "Save changes" : "Create badge"}</s-button>{editingId ? <s-button type="button" onClick={resetForm}>Cancel</s-button> : null}</s-stack>
          </s-stack>
        </Form>
      </s-section>
      <s-section heading={`Your badges (${badges.length})`}>
        {badges.length === 0 ? <s-paragraph>No badges yet. Create your first badge above.</s-paragraph> : badges.map((badge) => (
          <s-box key={badge.id} padding="base" borderWidth="base" borderRadius="base">
            <s-button type="button" onClick={() => editBadge(badge)}>Edit badge</s-button>
            <s-stack direction="inline" gap="base"><span style={{ background: badge.enabled ? badge.backgroundColor : "#6b7280", color: badge.textColor, padding: "5px 9px", borderRadius: badge.borderRadius }}>{badge.label}</span><s-paragraph>{badge.name} · {badge.productIds.length} products · {badge.position} · {badge.enabled ? "Active" : "Disabled"}</s-paragraph><Form method="post"><input type="hidden" name="intent" value="toggle" /><input type="hidden" name="id" value={badge.id} /><s-button type="submit">{badge.enabled ? "Disable" : "Enable"}</s-button></Form><Form method="post"><input type="hidden" name="intent" value="delete" /><input type="hidden" name="id" value={badge.id} /><s-button type="submit" tone="critical">Delete</s-button></Form></s-stack>
          </s-box>
        ))}
      </s-section>
      <s-section slot="aside" heading="Publish in your theme"><s-paragraph>Open your product template in the theme editor, add the “Product badge” app block near the product media, then save.</s-paragraph></s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (args) => boundary.headers(args);
