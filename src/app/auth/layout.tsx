import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Agents Playbook",
  description: "Sign in or create an account to manage your AI agent workflows",
};

/**
 * Auth Layout
 * 
 * Minimal layout for authentication pages (login, register)
 * Centers content on the page with a clean background
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 text-gray-900 [color-scheme:light]">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

