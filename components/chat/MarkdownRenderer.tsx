"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { ReactNode } from "react";

/**
 * Custom markdown components for chat messages
 * Styled for dark theme with proper spacing
 */
const markdownComponents: Components = {
  p: ({ children }: { children?: ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="text-lg font-bold mb-2">{children}</h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="text-base font-semibold mb-2">{children}</h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="text-sm font-semibold mb-1">{children}</h3>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="text-sm">{children}</li>,
  code: ({ children, className }: { children?: ReactNode; className?: string }) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-slate-700 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
    ) : (
      <pre className="bg-slate-900 p-2 rounded text-xs overflow-x-auto">
        <code>{children}</code>
      </pre>
    );
  },
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="border-l-2 border-blue-400 pl-2 italic text-sm">{children}</blockquote>
  ),
  a: ({ children, href }: { children?: ReactNode; href?: string }) => (
    <a
      href={href}
      className="text-blue-300 hover:text-blue-200 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
};

interface MarkdownRendererProps {
  content: string;
}

/**
 * Renders markdown content with custom styling
 * Uses react-markdown with GFM support
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
