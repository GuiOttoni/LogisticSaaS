import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniDynamic Engine | Dynamic Pricing & Inventory",
  description: "Plataforma ultra-escalável de precificação dinâmica e gestão de inventário em tempo real para o varejo global.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-black text-slate-200 font-sans antialiased selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}
