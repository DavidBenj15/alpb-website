import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark as markdownStyle } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose dark:prose-invert max-w-none text-sm">
      <ReactMarkdown
        components={{
          // Base text is now smaller
          p: ({ children }) => <p className="mb-3 text-sm">{children}</p>,
          
          // Headings scaled down
          h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mt-5 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold mt-4 mb-2">{children}</h3>,
          
          // Lists with smaller text
          ul: ({ children }) => <ul className="list-disc pl-6 mb-3 text-sm">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 text-sm">{children}</ol>,
          
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            const isStandalone = (
              String(children).startsWith('\n') || 
              String(children).endsWith('\n')
            );
            
            if (!inline && (isStandalone || language)) {
              return (
                <div className="rounded-lg overflow-hidden my-3 w-full">
                  <SyntaxHighlighter
                    style={markdownStyle}
                    language={language}
                    PreTag="div"
                    className="!mt-0 !mb-0 text-sm"
                    customStyle={{ fontSize: '0.875rem' }}  // 14px to match text-sm
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            }
            
            return (
              <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 whitespace-normal text-sm" {...props}>
                {children}
              </code>
            );
          },
          
          // Blockquotes with smaller text
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-3 italic text-sm">
              {children}
            </blockquote>
          ),
          
          // Links with smaller text
          a: ({ children, href }) => (
            <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;