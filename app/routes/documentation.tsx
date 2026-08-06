import { PublicPage } from "../components/PublicPage";

export default function Documentation() {
  return <PublicPage title="Badge Studio Documentation">
    <h2>Install and create a badge</h2>
    <ol>
      <li>Install Badge Studio and open it from Shopify Admin.</li>
      <li>Enter an internal name and the text customers should see.</li>
      <li>Select a position, colors, font size, and corner roundness.</li>
      <li>Choose one or more products, then select Create badge.</li>
    </ol>
    <h2>Publish in your theme</h2>
    <ol>
      <li>Go to Online Store → Themes → Customize.</li>
      <li>Open the relevant product template.</li>
      <li>Add the Product badge app block near the product information or media.</li>
      <li>Save the theme and visit an assigned product.</li>
    </ol>
    <h2>Manage badges</h2>
    <p>Use Edit badge to change its products or appearance. Disable temporarily hides it. Delete removes the badge configuration from its assigned products.</p>
    <h2>Get help</h2>
    <p>Visit <a href="/support">support</a> or email <a href="mailto:msmarafath1@gmail.com">msmarafath1@gmail.com</a>.</p>
  </PublicPage>;
}

