import Link from "next/link";
import { ROUTES } from "@/shared/routes";

export default function GetStartedSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-primary-50 to-white" aria-labelledby="get-started-title">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 id="get-started-title" className="text-4xl font-bold text-gray-900 mb-6">
          Get Started Today
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create your free account and start managing AI agent workflows with intelligent execution and context management.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={ROUTES.REGISTER}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Create Free Account
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
          >
            Already have an account? <span className="text-primary-600">Sign in</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
