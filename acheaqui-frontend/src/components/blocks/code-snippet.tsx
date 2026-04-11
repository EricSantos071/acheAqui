"use client";

import { useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import ts from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import { useTheme } from "next-themes";
import { ContentWrapper, Section } from "@/components/layout";
import { cn } from "@/lib/utils";

// Register only the languages we need to keep the bundle small
SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("js", js);
SyntaxHighlighter.registerLanguage("typescript", ts);
SyntaxHighlighter.registerLanguage("ts", ts);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("py", python);

const darkTheme: Record<string, React.CSSProperties> = {
  "hljs": { display: "block", overflowX: "auto", padding: "1.25rem", background: "#161616", color: "#ddd" },
  "hljs-keyword": { color: "#79c0ff" },
  "hljs-built_in": { color: "#79c0ff" },
  "hljs-type": { color: "#79c0ff" },
  "hljs-literal": { color: "#ff7b72" },
  "hljs-number": { color: "#ff7b72" },
  "hljs-string": { color: "#a5d6ff" },
  "hljs-template-variable": { color: "#a5d6ff" },
  "hljs-subst": { color: "#ddd" },
  "hljs-title": { color: "#d2a8ff" },
  "hljs-function": { color: "#d2a8ff" },
  "hljs-comment": { color: "#8b949e" },
  "hljs-doctag": { color: "#8b949e" },
  "hljs-attr": { color: "#79c0ff" },
  "hljs-params": { color: "#ddd" },
  "hljs-variable": { color: "#ffa657" },
  "hljs-regexp": { color: "#a5d6ff" },
  "hljs-symbol": { color: "#3ecf8e" },
  "hljs-selector-class": { color: "#3ecf8e" },
  "hljs-selector-id": { color: "#3ecf8e" },
  "hljs-meta": { color: "#8b949e" },
  "hljs-name": { color: "#79c0ff" },
  "hljs-attribute": { color: "#79c0ff" },
};

const lightTheme: Record<string, React.CSSProperties> = {
  "hljs": { display: "block", overflowX: "auto", padding: "1.25rem", background: "#f9f9f9", color: "#24292f" },
  "hljs-keyword": { color: "#0550ae" },
  "hljs-built_in": { color: "#0550ae" },
  "hljs-type": { color: "#0550ae" },
  "hljs-literal": { color: "#953800" },
  "hljs-number": { color: "#953800" },
  "hljs-string": { color: "#0a3069" },
  "hljs-template-variable": { color: "#0a3069" },
  "hljs-subst": { color: "#24292f" },
  "hljs-title": { color: "#6639ba" },
  "hljs-function": { color: "#6639ba" },
  "hljs-comment": { color: "#6e7781" },
  "hljs-doctag": { color: "#6e7781" },
  "hljs-attr": { color: "#0550ae" },
  "hljs-params": { color: "#24292f" },
  "hljs-variable": { color: "#953800" },
  "hljs-regexp": { color: "#0a3069" },
  "hljs-symbol": { color: "#116329" },
  "hljs-selector-class": { color: "#116329" },
  "hljs-selector-id": { color: "#116329" },
  "hljs-meta": { color: "#6e7781" },
  "hljs-name": { color: "#0550ae" },
  "hljs-attribute": { color: "#0550ae" },
};

export type CodeLanguage = "typescript" | "ts" | "javascript" | "js" | "bash" | "sql" | "json" | "python" | "py";

export interface CodeSnippetProps {
  code: string;
  language: CodeLanguage;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeSnippet({
  code,
  language,
  filename,
  showLineNumbers = false,
  className,
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <div className="flex items-center gap-2">
          <TerminalIcon />
          <span className="text-xs font-mono text-muted-foreground">
            {filename || language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
          aria-label="Copy code"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code block */}
      <SyntaxHighlighter
        language={language}
        style={isDark ? darkTheme : lightTheme}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.8125rem",
          lineHeight: "1.6",
        }}
        lineNumberStyle={{
          color: isDark ? "#484f58" : "#afb8c1",
          minWidth: "2.5em",
          paddingRight: "1em",
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}

export interface CodeSectionProps {
  code: string;
  language: CodeLanguage;
  filename?: string;
  title?: string;
  subtitle?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeSection({
  code,
  language,
  filename,
  title,
  subtitle,
  showLineNumbers,
  className,
}: CodeSectionProps) {
  return (
    <Section className={className}>
      <ContentWrapper>
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          <CodeSnippet
            code={code}
            language={language}
            filename={filename}
            showLineNumbers={showLineNumbers}
          />
        </div>
      </ContentWrapper>
    </Section>
  );
}

function TerminalIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
      aria-hidden="true"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}
