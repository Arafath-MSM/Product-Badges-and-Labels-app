import { PublicPage } from "../components/PublicPage";

export default function Support() {
  return <PublicPage title="Badge Studio Support">
    <p>Badge Studio is supported by Zyrace in Sri Lanka.</p>
    <h2>Contact support</h2>
    <p>Email <a href="mailto:msmarafath1@gmail.com">msmarafath1@gmail.com</a> with your shop domain, a description of the issue, steps to reproduce it, and a screenshot that does not expose credentials.</p>
    <p>We aim to acknowledge support requests within two business days.</p>
    <h2>Common checks</h2>
    <ul>
      <li>Confirm the badge is enabled and assigned to the product.</li>
      <li>Add the Product badge app block to the correct product template and save the theme.</li>
      <li>Refresh the storefront after changing a badge.</li>
      <li>Never email API secrets, passwords, database URLs, or full session tokens.</li>
    </ul>
    <p><a href="/documentation">Read the setup documentation</a></p>
  </PublicPage>;
}

