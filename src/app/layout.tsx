import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "@/trpc/provider";
import "./globals.css";

export const metadata: Metadata = { title: "Gerenciador de Tarefas" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <header className="header">
            <Link href="/" className="brand">Gerenciador de Tarefas</Link>
          </header>
          <main className="container">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
