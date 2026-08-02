import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unity Icon Studio",
  description: "Crie e exporte ícones vetoriais consistentes para scripts da Unity.",
  icons: { icon: "./favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
