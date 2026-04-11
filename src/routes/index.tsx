import { createFileRoute, Link } from '@tanstack/react-router';
import { BookOpen, Cpu, GitBranch, Table2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({
    meta: [
      { title: 'Grammar Validator Tool — Analyze CFGs for LL(1) Parsing' },
      { name: 'description', content: 'Analyze context-free grammars for LL(1) compatibility, compute FIRST/FOLLOW sets, detect ambiguity and left recursion, and visualize parse trees.' },
    ],
  }),
});

const features = [
  { icon: <BookOpen className="w-6 h-6" />, title: 'FIRST & FOLLOW Sets', desc: 'Compute FIRST and FOLLOW sets for every non-terminal in your grammar.' },
  { icon: <Cpu className="w-6 h-6" />, title: 'LL(1) Validation', desc: 'Check if your grammar is LL(1) compatible with detailed conflict reports.' },
  { icon: <GitBranch className="w-6 h-6" />, title: 'Left Recursion & Ambiguity', desc: 'Detect direct/indirect left recursion and FIRST-FIRST conflicts.' },
  { icon: <Table2 className="w-6 h-6" />, title: 'Parsing Table & Parse Tree', desc: 'Generate LL(1) parsing tables and visualize parse tree expansion.' },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-primary)] opacity-5" />
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Cpu className="w-4 h-4" />
            Compiler Design Tool
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
            Grammar Validator
            <span className="block text-primary">Tool</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Analyze context-free grammars for LL(1) compatibility, ambiguity, and parsing.
            Compute FIRST/FOLLOW sets, generate parsing tables, and visualize parse trees.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="text-base px-8 py-6 shadow-[var(--shadow-elevated)]">
              <Link to="/validator">
                Start Validation
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-foreground text-lg">{f.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Grammar Validator Tool — Built with Compiler Design Concepts
      </footer>
    </div>
  );
}
