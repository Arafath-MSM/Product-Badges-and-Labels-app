import type { ReactNode } from "react";

export function PublicPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px", color: "#17202a", fontFamily: "Inter, system-ui, sans-serif", lineHeight: 1.65 }}>
      <a href="/" style={{ color: "#087f8c" }}>Badge Studio</a>
      <h1 style={{ fontSize: 38, lineHeight: 1.2, margin: "24px 0" }}>{title}</h1>
      {children}
      <hr style={{ border: 0, borderTop: "1px solid #dfe3e8", margin: "40px 0 20px" }} />
      <p>© 2026 Zyrace · Sri Lanka · <a href="mailto:msmarafath1@gmail.com">msmarafath1@gmail.com</a></p>
    </main>
  );
}

