import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "LIFEX Mobile Clinic", template: "%s | LIFEX Mobile Clinic" },
  description: "Your health, at your fingertips. Book appointments, consult a doctor, and manage your health records.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: "10px", fontSize: "14px" },
            success: { iconTheme: { primary: "#1A5C38", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
