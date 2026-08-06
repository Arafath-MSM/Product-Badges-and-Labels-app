import { PublicPage } from "../components/PublicPage";

export default function PrivacyPolicy() {
  return <PublicPage title="Privacy Policy">
    <p><strong>Last updated:</strong> August 6, 2026</p>
    <p>Zyrace operates Badge Studio – Product Badges (the “App”). This policy explains how the App handles information when a Shopify merchant installs or uses it.</p>
    <h2>Information we process</h2>
    <p>The App processes the merchant’s Shopify shop domain, authentication and session records, selected product identifiers and titles, and badge settings. We do not intentionally collect or store customer personal information.</p>
    <h2>How information is used</h2>
    <p>We use this information only to authenticate the merchant, provide badge configuration and storefront functionality, maintain security, troubleshoot the service, and comply with legal obligations.</p>
    <h2>Service providers and transfers</h2>
    <p>Render provides application hosting and Neon provides database hosting. These providers may process limited merchant information on our behalf in regions outside Sri Lanka under their applicable safeguards and terms.</p>
    <h2>Retention and deletion</h2>
    <p>Configuration and session records are retained while the App is installed. When Shopify sends an uninstall or shop-redaction webhook, the App deletes the associated session and badge records, subject to any limited retention required by law or security needs.</p>
    <h2>Privacy requests</h2>
    <p>The App responds to Shopify’s mandatory data-request and redaction webhooks. To request access, correction, or deletion, email <a href="mailto:msmarafath1@gmail.com">msmarafath1@gmail.com</a>.</p>
    <h2>Changes</h2>
    <p>We may update this policy as the App or applicable requirements change. The current version and revision date will remain available on this page.</p>
  </PublicPage>;
}

