import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, Play, Trash2, BookOpen, CheckCircle, XCircle, AlertTriangle, Table2, GitBranch, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateGrammar, buildSampleParseTree, type ValidationResult } from '@/lib/grammar-engine';
import { ParsingTable } from '@/components/ParsingTable';
import { ParseTree } from '@/components/ParseTree';
import { ResultCard } from '@/components/ResultCard';

export const Route = createFileRoute('/validator')({
  component: ValidatorPage,
  head: () => ({
    meta: [
      { title: 'Grammar Validator — Analyze Your CFG' },
      { name: 'description', content: 'Enter your context-free grammar rules and validate for LL(1) compatibility.' },
    ],
  }),
});

const EXAMPLE_GRAMMAR = `S->aAB|b
A->c|e
B->d`;

function ValidatorPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleValidate = () => {
    if (!input.trim()) {
      setErrors(['Please enter grammar rules.']);
      setResult(null);
      return;
    }
    const res = validateGrammar(input);
    if ('errors' in res && !('grammar' in res)) {
      setErrors(res.errors);
      setResult(null);
    } else {
      setErrors([]);
      setResult(res as ValidationResult);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setErrors([]);
  };

  const handleExample = () => {
    setInput(EXAMPLE_GRAMMAR);
    setResult(null);
    setErrors([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> Home</Link>
          </Button>
          <h1 className="font-semibold text-foreground">Grammar Validator</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input & Results */}
          <div className="space-y-6">
            {/* Input */}
            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)]">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Grammar Rules
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Enter one rule per line. Format: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">S-&gt;aA|b</code>. Use <code className="bg-muted px-1.5 py-0.5 rounded text-xs">e</code> for ε.
              </p>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`S->aA|b\nA->c`}
                className="w-full h-40 rounded-lg border border-input bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
              <div className="flex flex-wrap gap-2 mt-4">
                <Button onClick={handleValidate} size="sm">
                  <Play className="w-4 h-4 mr-1" /> Validate Grammar
                </Button>
                <Button onClick={handleClear} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" /> Clear
                </Button>
                <Button onClick={handleExample} variant="secondary" size="sm">
                  <Sparkles className="w-4 h-4 mr-1" /> Load Example
                </Button>
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                {errors.map((e, i) => (
                  <p key={i} className="text-sm text-destructive flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" /> {e}
                  </p>
                ))}
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4">
                {/* FIRST Sets */}
                <ResultCard title="FIRST Sets" icon={<BookOpen className="w-5 h-5" />} status="info">
                  <div className="space-y-1">
                    {result.grammar.nonTerminals.map(nt => (
                      <p key={nt} className="text-sm font-mono text-foreground">
                        FIRST({nt}) = {'{'} {[...(result.firstSets.get(nt) || [])].join(', ')} {'}'}
                      </p>
                    ))}
                  </div>
                </ResultCard>

                {/* FOLLOW Sets */}
                <ResultCard title="FOLLOW Sets" icon={<BookOpen className="w-5 h-5" />} status="info">
                  <div className="space-y-1">
                    {result.grammar.nonTerminals.map(nt => (
                      <p key={nt} className="text-sm font-mono text-foreground">
                        FOLLOW({nt}) = {'{'} {[...(result.followSets.get(nt) || [])].join(', ')} {'}'}
                      </p>
                    ))}
                  </div>
                </ResultCard>

                {/* LL(1) Check */}
                <ResultCard
                  title="LL(1) Check"
                  icon={result.isLL1 ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  status={result.isLL1 ? 'success' : 'error'}
                >
                  <p className="text-sm text-foreground font-medium">
                    {result.isLL1 ? '✓ Grammar is LL(1)' : '✗ Grammar is NOT LL(1)'}
                  </p>
                  {result.ll1Conflicts.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.ll1Conflicts.map((c, i) => (
                        <li key={i} className="text-xs text-muted-foreground font-mono">• {c}</li>
                      ))}
                    </ul>
                  )}
                </ResultCard>

                {/* Left Recursion */}
                <ResultCard
                  title="Left Recursion"
                  icon={<GitBranch className="w-5 h-5" />}
                  status={result.hasLeftRecursion ? 'warning' : 'success'}
                >
                  <p className="text-sm text-foreground font-medium">
                    {result.hasLeftRecursion ? '⚠ Left recursion detected' : '✓ No left recursion'}
                  </p>
                  {result.leftRecursionDetails.map((d, i) => (
                    <p key={i} className="text-xs text-muted-foreground font-mono mt-1">• {d}</p>
                  ))}
                </ResultCard>

                {/* Ambiguity */}
                <ResultCard
                  title="Ambiguity Detection"
                  icon={<AlertTriangle className="w-5 h-5" />}
                  status={result.isAmbiguous ? 'warning' : 'success'}
                >
                  <p className="text-sm text-foreground font-medium">
                    {result.isAmbiguous ? '⚠ Potential ambiguity detected' : '✓ No FIRST/FIRST conflicts'}
                  </p>
                  {result.ambiguityDetails.map((d, i) => (
                    <p key={i} className="text-xs text-muted-foreground font-mono mt-1">• {d}</p>
                  ))}
                </ResultCard>
              </div>
            )}
          </div>

          {/* Right Column - Parsing Table & Parse Tree */}
          <div className="space-y-6">
            {result ? (
              <>
                <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Table2 className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-foreground">LL(1) Parsing Table</h2>
                  </div>
                  <ParsingTable
                    table={result.parsingTable}
                    nonTerminals={result.grammar.nonTerminals}
                    terminals={result.grammar.terminals}
                  />
                </div>

                <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-2 mb-4">
                    <GitBranch className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-foreground">Parse Tree</h2>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Expansion of the start symbol using the first production of each non-terminal.
                  </p>
                  <ParseTree root={buildSampleParseTree(result.grammar)} />
                </div>
              </>
            ) : (
              <div className="bg-card rounded-xl p-12 shadow-[var(--shadow-card)] flex flex-col items-center justify-center text-center min-h-[300px]">
                <Table2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Parsing table and parse tree will appear here</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Enter grammar rules and click Validate</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
