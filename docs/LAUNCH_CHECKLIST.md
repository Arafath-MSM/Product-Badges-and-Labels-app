# Launch checklist

- [ ] Create/link the app in Shopify Dev Dashboard and set `client_id` in `shopify.app.toml`.
- [ ] Choose production hosting and a production database (PostgreSQL recommended; SQLite is development-only).
- [ ] Set `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`, `SCOPES`, and `DATABASE_URL` in production.
- [ ] Run database migrations and deploy the web app over HTTPS.
- [ ] Run `shopify app dev` against a development store and test install/OAuth.
- [ ] Test create/delete flows with one and multiple products.
- [ ] Add the theme block to an Online Store 2.0 product template and test desktop/mobile.
- [ ] Run `shopify app build`, then `shopify app deploy` to release the extension/config version.
- [ ] Verify all mandatory privacy webhook deliveries and uninstall cleanup.
- [ ] Replace privacy-policy placeholders and publish privacy, terms, support, and marketing URLs.
- [ ] Capture listing screenshots and app icon; complete the App Store listing.
- [ ] Configure pricing (or mark the app free), emergency contact, and review credentials/instructions.
- [ ] Submit for Shopify App Review and address reviewer feedback.
