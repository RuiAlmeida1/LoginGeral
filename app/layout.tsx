import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Dashboard Geral | Aplicações Internas",
  description: "O teu portal central de acesso às aplicações internas.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
