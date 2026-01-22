import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.layout");
  return {
    title: t("title"),
    description: t("description"),
  };
}

/**
 * Cyber Auth Layout
 *
 * Split-screen layout for authentication pages with cyberpunk aesthetics
 * Left panel: Holographic branding with circuit patterns
 * Right panel: Auth form container
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("auth.layout");

  return (
    <div className="min-h-screen flex bg-[#050508]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        {/* Circuit background */}
        <div className="absolute inset-0 cyber-circuit-bg opacity-30 pointer-events-none"></div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-pink-500/10"></div>

        {/* Animated data streams */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 animate-pulse"></div>
          <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-pink-500/0 via-pink-500/50 to-pink-500/0 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-purple-500/0 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-cyan-500/30 rotate-45 animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-pink-500/30 rotate-12 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-purple-500/20 rounded-full animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          {/* Logo */}
          <Link href="/" className="group mb-8">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-2xl opacity-50 group-hover:opacity-75 blur transition-opacity duration-300"></div>
              <Image
                src="/favicon.svg"
                alt={t("logoAlt")}
                width={80}
                height={80}
                className="relative rounded-xl"
                priority
              />
            </div>
          </Link>

          {/* Title with glitch effect */}
          <h1 className="text-4xl font-black tracking-tight mb-4 text-center">
            <span
              className="cyber-text-glitch cyber-text-cyan block"
              data-text="AGENTS"
            >
              AGENTS
            </span>
            <span
              className="cyber-text-glitch cyber-text-pink block mt-1"
              data-text="PLAYBOOK"
            >
              PLAYBOOK
            </span>
          </h1>

          {/* Terminal text */}
          <div className="font-mono text-sm text-cyan-400/60 mb-8 text-center">
            <p>&gt; {t("initializingAccess")}</p>
            <p className="text-green-400 mt-2">&gt; {t("encryptionActive")}</p>
          </div>

          {/* Features list */}
          <div className="space-y-4 w-full max-w-xs">
            <div className="flex items-center gap-3 p-3 bg-[#0a0a0f]/50 border border-cyan-500/30">
              <span className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#00ffff]"></span>
              <span className="text-sm text-cyan-100/60 font-mono">
                {t("featureWorkflow")}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0a0a0f]/50 border border-pink-500/30">
              <span className="w-2 h-2 bg-pink-400 rounded-full shadow-[0_0_10px_#ff0066]"></span>
              <span className="text-sm text-cyan-100/60 font-mono">
                {t("featureMcp")}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0a0a0f]/50 border border-green-500/30">
              <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_#00ff66]"></span>
              <span className="text-sm text-cyan-100/60 font-mono">
                {t("featureCursor")}
              </span>
            </div>
          </div>
        </div>

        {/* Right border glow */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0"></div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        {/* Subtle circuit background */}
        <div className="absolute inset-0 cyber-circuit-bg opacity-10 pointer-events-none"></div>

        {/* Scan lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.02)_2px,rgba(0,255,255,0.02)_4px)]"></div>
        </div>

        <div className="relative w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
