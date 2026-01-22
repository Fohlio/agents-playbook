"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Modal } from "@/shared/ui/atoms";
import { createTopic } from "../actions/topic-actions";

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTopicModal({ isOpen, onClose }: CreateTopicModalProps) {
  const t = useTranslations("community.createTopicModal");
  const tCommon = useTranslations("common");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await createTopic({ title: title.trim(), content: content.trim() });

      if (result.success && result.data) {
        onClose();
        setTitle("");
        setContent("");
        router.push(`/dashboard/community/${result.data.topicId}`);
      } else {
        setError(result.error || t("failedToCreate"));
        setIsSubmitting(false);
      }
    } catch {
      setError(t("failedToCreate"));
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <h3 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4" style={{ textShadow: '0 0 10px #00ffff40' }}>
        {t("title")}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
              {t("titleLabel")} <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all"
              maxLength={200}
              required
            />
            <div className={`text-xs font-mono mt-1 ${title.length > 180 ? 'text-pink-400' : 'text-cyan-500/40'}`}>
              {title.length}/200
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
              {t("messageLabel")} <span className="text-pink-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all resize-none"
              rows={6}
              maxLength={10000}
              required
            />
            <div className={`text-xs font-mono mt-1 ${content.length > 9500 ? 'text-pink-400' : 'text-cyan-500/40'}`}>
              {content.length}/10000
            </div>
          </div>

          {error && (
            <div className="p-3 bg-pink-500/10 border border-pink-500/50 text-pink-400 font-mono text-sm">
              &gt; ERROR: {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 disabled:opacity-50 transition-all cursor-pointer"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
          >
            {isSubmitting ? t("creating") : t("create")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
