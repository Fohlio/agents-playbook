"use client";

import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import { getUsageHint } from "@/shared/lib/constants/usage-hint";

interface UsageHintProps {
  workflowName: string;
  className?: string;
}

/**
 * UsageHint Component
 * 
 * Displays a hint on how to use a workflow with AI assistants.
 * Includes copy-to-clipboard functionality.
 */
export function UsageHint({ workflowName, className = "" }: UsageHintProps) {
  const [copied, setCopied] = useState(false);
  const hint = getUsageHint(workflowName);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy hint:", error);
    }
  };

  return (
    <div
      className={`flex items-start gap-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg ${className}`}
    >
      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-amber-800 mb-1">
          Quick Start
        </p>
        <code className="block text-xs text-amber-900 bg-amber-100/50 px-2 py-1 rounded font-mono break-all">
          {hint}
        </code>
      </div>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded transition-colors"
        title={copied ? "Copied!" : "Copy to clipboard"}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

