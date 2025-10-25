"use client";

import { useSession } from "next-auth/react";
import { Link, Badge } from "@/shared/ui/atoms";
import { ROUTES } from "@/shared/routes";

/**
 * Dashboard Page
 * 
 * Main landing page after user authentication.
 * Displays user information and quick links to key features.
 */
export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-base p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session?.user?.username}!
        </h1>
        <p className="text-gray-600">
          You&apos;re successfully logged into Agents Playbook
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-base p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Account
        </h2>
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 w-24">Email:</span>
            <span className="text-sm text-gray-900">{session?.user?.email}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 w-24">Username:</span>
            <span className="text-sm text-gray-900">{session?.user?.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 w-24">Tier:</span>
            <Badge variant="primary">{session?.user?.tier}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 w-24">Role:</span>
            <Badge variant="default">{session?.user?.role}</Badge>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-base p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href={ROUTES.SETTINGS}
            className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
          >
            <h3 className="font-medium text-gray-900 mb-1">Settings</h3>
            <p className="text-sm text-gray-600">
              Manage your profile, password, and API tokens
            </p>
          </Link>
          <Link
            href="/api/mcp"
            external
            className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
          >
            <h3 className="font-medium text-gray-900 mb-1">MCP Server</h3>
            <p className="text-sm text-gray-600">
              View MCP server API documentation
            </p>
          </Link>
        </div>
      </div>

      {/* Documentation Link */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          📚 Agents Playbook
        </h2>
        <p className="text-gray-700 mb-4">
          Explore our comprehensive workflow automation system for AI agents in software development.
        </p>
        <Link
          href="https://github.com/ivanbunin/agents-playbook"
          external
          className="inline-flex items-center"
        >
          View Documentation
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

