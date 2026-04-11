import type { ParseTreeNode } from '@/lib/grammar-engine';

function TreeNode({ node, isLast, prefix }: { node: ParseTreeNode; isLast: boolean; prefix: string }) {
  const isLeaf = node.children.length === 0;
  const connector = isLast ? '└── ' : '├── ';
  const childPrefix = prefix + (isLast ? '    ' : '│   ');

  return (
    <div className="font-mono text-sm">
      <div className="flex items-center">
        <span className="text-muted-foreground select-none">{prefix}{connector}</span>
        <span className={isLeaf ? 'text-accent font-bold' : 'text-primary font-bold'}>
          {node.symbol}
        </span>
      </div>
      {node.children.map((child, i) => (
        <TreeNode
          key={i}
          node={child}
          isLast={i === node.children.length - 1}
          prefix={childPrefix}
        />
      ))}
    </div>
  );
}

export function ParseTree({ root }: { root: ParseTreeNode }) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
      <div className="font-mono text-sm">
        <span className="text-primary font-bold text-base">{root.symbol}</span>
        {root.children.map((child, i) => (
          <TreeNode
            key={i}
            node={child}
            isLast={i === root.children.length - 1}
            prefix=""
          />
        ))}
      </div>
    </div>
  );
}
