import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Open Employee - Always-On AI Employee for Small Indian Businesses",
  description: "Black and Gold Elegance dashboard for autonomous operations, multilingual voice entry, Razorpay UPI, and human-in-the-loop approvals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-base text-text-primary antialiased selection:bg-accent selection:text-surface">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
