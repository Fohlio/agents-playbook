import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export interface MarkdownContentProps {
  content: string;
  className?: string;
  testId?: string;
}

/**
 * MarkdownContent Component
 *
 * Centralized markdown rendering with consistent styling
 * Supports GitHub Flavored Markdown including h4 headings
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  className = "",
  testId,
}) => {
  return (
    <div
      data-testid={testId}
      className={`text-gray-900 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-lg font-bold mt-4 mb-2 text-gray-800" {...props} />
          ),
          h4: ({ ...props }) => (
            <h4 className="text-base font-semibold mt-3 mb-2 text-gray-800" {...props} />
          ),
          h5: ({ ...props }) => (
            <h5 className="text-sm font-semibold mt-2 mb-1 text-gray-700" {...props} />
          ),
          h6: ({ ...props }) => (
            <h6 className="text-xs font-semibold mt-2 mb-1 text-gray-700" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="mb-2 last:mb-0 text-gray-900" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc pl-5 mb-2 space-y-1 text-gray-900" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-5 mb-2 space-y-1 text-gray-900" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="mb-1 text-gray-900" {...props} />
          ),
          code: ({ className, ...props }) => {
            const isInline = !className?.includes('language-');
            return isInline ? (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
            ) : (
              <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto my-3" {...props} />
            );
          },
          pre: ({ ...props }) => (
            <pre className="my-3 overflow-x-auto" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 text-gray-700 italic bg-blue-50" {...props} />
          ),
          a: ({ ...props }) => (
            <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold text-gray-900" {...props} />
          ),
          em: ({ ...props }) => (
            <em className="italic" {...props} />
          ),
          hr: ({ ...props }) => (
            <hr className="my-4 border-t border-gray-300" {...props} />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200" {...props} />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-gray-50" {...props} />
          ),
          tbody: ({ ...props }) => (
            <tbody className="bg-white divide-y divide-gray-200" {...props} />
          ),
          tr: ({ ...props }) => (
            <tr {...props} />
          ),
          th: ({ ...props }) => (
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="px-4 py-2 text-sm text-gray-600" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
