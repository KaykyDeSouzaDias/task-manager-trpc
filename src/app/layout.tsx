import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "@/trpc/provider";
import "./globals.css";

export const metadata: Metadata = { title: "Task Manager" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="header">
            <Link href="/" className="brand">Task Manager</Link>
          </header>
          <main className="container">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
