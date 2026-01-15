import ReactMarkdown from "react-markdown";

export const MarkDown = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        // 自定义标题样式
        h1: ({ ...props }) => (
          <h1 className="text-lg font-bold mt-2 mb-1" {...props} />
        ),
        h2: ({ ...props }) => (
          <h2 className="text-base font-bold mt-2 mb-1" {...props} />
        ),
        h3: ({ ...props }) => (
          <h3 className="text-sm font-semibold mt-2 mb-1" {...props} />
        ),
        // 段落样式
        p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        // 列表样式
        ul: ({ ...props }) => (
          <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
        ),
        ol: ({ ...props }) => (
          <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />
        ),
        li: ({ ...props }) => <li className="ml-2" {...props} />,
        // 代码块样式
        code: ({ inline, ...props }: any) =>
          inline ? (
            <code
              className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono"
              {...props}
            />
          ) : (
            <code
              className="block bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs font-mono overflow-x-auto"
              {...props}
            />
          ),
        // 引用样式
        blockquote: ({ ...props }) => (
          <blockquote
            className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 italic my-2"
            {...props}
          />
        ),
        // 链接样式
        a: ({ ...props }) => (
          <a
            className="text-blue-600 dark:text-blue-400 hover:underline"
            {...props}
          />
        ),
        // 强调样式
        strong: ({ ...props }) => (
          <strong className="font-semibold" {...props} />
        ),
        em: ({ ...props }) => <em className="italic" {...props} />,
        // 换行处理
        br: () => <br className="mb-1" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
