import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MySharedItemsSection } from "@/features/sharing/components/MySharedItemsSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sharing");
  return {
    title: `${t("title")} | Agents Playbook`,
    description: t("subtitle"),
  };
}

export default async function SharingPage() {
  const t = await getTranslations("sharing");
  const header = t("header");

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-1">
          <span
            className="cyber-text-glitch"
            data-text={header}
            style={{
              color: "#00ffff",
              textShadow: "0 0 10px #00ffff, 0 0 20px #00ffff40",
            }}
          >
            {header}
          </span>
        </h1>
        <p className="text-cyan-100/60 font-mono text-sm uppercase tracking-wider">
          {t("subtitle")}
        </p>
      </div>

      <MySharedItemsSection />
    </div>
  );
}
