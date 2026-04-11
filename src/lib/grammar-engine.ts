// Grammar Validator Engine - Compiler Design Algorithms

export interface Grammar {
  nonTerminals: string[];
  terminals: string[];
  productions: Map<string, string[][]>; // NT -> array of alternatives, each alternative is array of symbols
  startSymbol: string;
}

export interface ValidationResult {
  grammar: Grammar;
  firstSets: Map<string, Set<string>>;
  followSets: Map<string, Set<string>>;
  isLL1: boolean;
  ll1Conflicts: string[];
  hasLeftRecursion: boolean;
  leftRecursionDetails: string[];
  isAmbiguous: boolean;
  ambiguityDetails: string[];
  parsingTable: Map<string, Map<string, string>>;
  errors: string[];
}

const EPSILON = 'ε';
const END_MARKER = '$';

export function parseGrammar(input: string): Grammar | { error: string } {
  const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return { error: 'No grammar rules provided.' };

  const productions = new Map<string, string[][]>();
  const nonTerminals = new Set<string>();
  const allSymbols = new Set<string>();
  let startSymbol = '';

  for (const line of lines) {
    const match = line.match(/^([A-Z][A-Z0-9']*)\s*->\s*(.+)$/);
    if (!match) return { error: `Invalid format: "${line}". Use format: S->aA|b` };

    const nt = match[1];
    const rhs = match[2];

    if (!startSymbol) startSymbol = nt;
    nonTerminals.add(nt);

    const alternatives = rhs.split('|').map(alt => {
      const symbols: string[] = [];
      const trimmed = alt.trim();
      if (trimmed === EPSILON || trimmed === 'e' || trimmed === 'ε') {
        symbols.push(EPSILON);
      } else {
        let i = 0;
        while (i < trimmed.length) {
          if (/[A-Z]/.test(trimmed[i])) {
            let sym = trimmed[i];
            i++;
            while (i < trimmed.length && (/[A-Z0-9]/.test(trimmed[i]) || trimmed[i] === "'")) {
              sym += trimmed[i];
              i++;
            }
            symbols.push(sym);
          } else {
            symbols.push(trimmed[i]);
            i++;
          }
        }
      }
      symbols.forEach(s => allSymbols.add(s));
      return symbols;
    });

    const existing = productions.get(nt) || [];
    existing.push(...alternatives);
    productions.set(nt, existing);
  }

  const terminals = [...allSymbols].filter(s => !nonTerminals.has(s) && s !== EPSILON);

  return {
    nonTerminals: [...nonTerminals],
    terminals,
    productions,
    startSymbol,
  };
}

function computeFirstOfString(symbols: string[], firstSets: Map<string, Set<string>>, terminals: Set<string>): Set<string> {
  const result = new Set<string>();
  let allCanBeEmpty = true;

  for (const sym of symbols) {
    if (terminals.has(sym) || sym === EPSILON) {
      result.add(sym === EPSILON ? EPSILON : sym);
      allCanBeEmpty = sym === EPSILON;
      if (sym !== EPSILON) break;
      continue;
    }
    const f = firstSets.get(sym);
    if (f) {
      f.forEach(s => { if (s !== EPSILON) result.add(s); });
      if (!f.has(EPSILON)) { allCanBeEmpty = false; break; }
    } else {
      allCanBeEmpty = false;
      break;
    }
  }

  if (allCanBeEmpty) result.add(EPSILON);
  return result;
}

export function computeFirstSets(grammar: Grammar): Map<string, Set<string>> {
  const first = new Map<string, Set<string>>();
  const termSet = new Set(grammar.terminals);

  grammar.nonTerminals.forEach(nt => first.set(nt, new Set()));

  let changed = true;
  while (changed) {
    changed = false;
    for (const nt of grammar.nonTerminals) {
      const prods = grammar.productions.get(nt) || [];
      const currentFirst = first.get(nt)!;
      for (const prod of prods) {
        const prodFirst = computeFirstOfString(prod, first, termSet);
        prodFirst.forEach(s => {
          if (!currentFirst.has(s)) { currentFirst.add(s); changed = true; }
        });
      }
    }
  }

  return first;
}

export function computeFollowSets(grammar: Grammar, firstSets: Map<string, Set<string>>): Map<string, Set<string>> {
  const follow = new Map<string, Set<string>>();
  const termSet = new Set(grammar.terminals);

  grammar.nonTerminals.forEach(nt => follow.set(nt, new Set()));
  follow.get(grammar.startSymbol)!.add(END_MARKER);

  let changed = true;
  while (changed) {
    changed = false;
    for (const nt of grammar.nonTerminals) {
      const prods = grammar.productions.get(nt) || [];
      for (const prod of prods) {
        for (let i = 0; i < prod.length; i++) {
          const sym = prod[i];
          if (!grammar.nonTerminals.includes(sym)) continue;

          const rest = prod.slice(i + 1);
          const firstOfRest = computeFirstOfString(rest.length > 0 ? rest : [EPSILON], firstSets, termSet);

          const followSym = follow.get(sym)!;
          firstOfRest.forEach(s => {
            if (s !== EPSILON && !followSym.has(s)) { followSym.add(s); changed = true; }
          });

          if (firstOfRest.has(EPSILON) || rest.length === 0) {
            const followNt = follow.get(nt)!;
            followNt.forEach(s => {
              if (!followSym.has(s)) { followSym.add(s); changed = true; }
            });
          }
        }
      }
    }
  }

  return follow;
}

export function detectLeftRecursion(grammar: Grammar): { hasLeftRecursion: boolean; details: string[] } {
  const details: string[] = [];

  // Direct left recursion
  for (const nt of grammar.nonTerminals) {
    const prods = grammar.productions.get(nt) || [];
    for (const prod of prods) {
      if (prod[0] === nt) {
        details.push(`Direct left recursion: ${nt} → ${prod.join('')}`);
      }
    }
  }

  // Indirect (simple DFS reachability)
  for (const nt of grammar.nonTerminals) {
    const visited = new Set<string>();
    const stack = [nt];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const prods = grammar.productions.get(current) || [];
      for (const prod of prods) {
        if (prod[0] && grammar.nonTerminals.includes(prod[0])) {
          if (prod[0] === nt && current !== nt) {
            details.push(`Indirect left recursion: ${nt} → ... → ${current} → ${prod.join('')}`);
          }
          stack.push(prod[0]);
        }
      }
    }
  }

  return { hasLeftRecursion: details.length > 0, details };
}

export function detectAmbiguity(grammar: Grammar, firstSets: Map<string, Set<string>>, followSets: Map<string, Set<string>>): { isAmbiguous: boolean; details: string[] } {
  const details: string[] = [];
  const termSet = new Set(grammar.terminals);

  for (const nt of grammar.nonTerminals) {
    const prods = grammar.productions.get(nt) || [];
    for (let i = 0; i < prods.length; i++) {
      for (let j = i + 1; j < prods.length; j++) {
        const first_i = computeFirstOfString(prods[i], firstSets, termSet);
        const first_j = computeFirstOfString(prods[j], firstSets, termSet);

        const intersection = [...first_i].filter(s => first_j.has(s) && s !== EPSILON);
        if (intersection.length > 0) {
          details.push(`${nt}: FIRST(${prods[i].join('')}) ∩ FIRST(${prods[j].join('')}) = {${intersection.join(', ')}}`);
        }

        if (first_i.has(EPSILON)) {
          const followNt = followSets.get(nt) || new Set();
          const overlap = [...followNt].filter(s => first_j.has(s));
          if (overlap.length > 0) {
            details.push(`${nt}: FOLLOW(${nt}) ∩ FIRST(${prods[j].join('')}) = {${overlap.join(', ')}}`);
          }
        }
      }
    }
  }

  return { isAmbiguous: details.length > 0, details };
}

export function checkLL1(grammar: Grammar, firstSets: Map<string, Set<string>>, followSets: Map<string, Set<string>>): { isLL1: boolean; conflicts: string[] } {
  const ambiguity = detectAmbiguity(grammar, firstSets, followSets);
  const leftRec = detectLeftRecursion(grammar);

  const conflicts: string[] = [];
  if (leftRec.hasLeftRecursion) conflicts.push('Grammar has left recursion (not LL(1))');
  conflicts.push(...ambiguity.details);

  return { isLL1: conflicts.length === 0, conflicts };
}

export function buildParsingTable(grammar: Grammar, firstSets: Map<string, Set<string>>, followSets: Map<string, Set<string>>): Map<string, Map<string, string>> {
  const table = new Map<string, Map<string, string>>();
  const termSet = new Set(grammar.terminals);

  for (const nt of grammar.nonTerminals) {
    table.set(nt, new Map());
    const prods = grammar.productions.get(nt) || [];
    for (const prod of prods) {
      const prodFirst = computeFirstOfString(prod, firstSets, termSet);
      const prodStr = `${nt} → ${prod.join('')}`;

      prodFirst.forEach(sym => {
        if (sym !== EPSILON) {
          const row = table.get(nt)!;
          const existing = row.get(sym);
          row.set(sym, existing ? `${existing} / ${prodStr}` : prodStr);
        }
      });

      if (prodFirst.has(EPSILON)) {
        const followNt = followSets.get(nt) || new Set();
        followNt.forEach(sym => {
          const row = table.get(nt)!;
          const existing = row.get(sym);
          row.set(sym, existing ? `${existing} / ${prodStr}` : prodStr);
        });
      }
    }
  }

  return table;
}

export interface ParseTreeNode {
  symbol: string;
  children: ParseTreeNode[];
}

export function buildSampleParseTree(grammar: Grammar): ParseTreeNode {
  const visited = new Set<string>();

  function expand(symbol: string, depth: number): ParseTreeNode {
    if (depth > 6 || !grammar.nonTerminals.includes(symbol) || visited.has(symbol)) {
      return { symbol, children: [] };
    }
    visited.add(symbol);
    const prods = grammar.productions.get(symbol) || [];
    if (prods.length === 0) return { symbol, children: [] };

    const prod = prods[0]; // take first production
    const children = prod.map(s => expand(s, depth + 1));
    visited.delete(symbol);
    return { symbol, children };
  }

  return expand(grammar.startSymbol, 0);
}

export function validateGrammar(input: string): ValidationResult | { errors: string[] } {
  const parsed = parseGrammar(input);
  if ('error' in parsed) return { errors: [parsed.error] };

  const grammar = parsed;
  const firstSets = computeFirstSets(grammar);
  const followSets = computeFollowSets(grammar, firstSets);
  const ll1Check = checkLL1(grammar, firstSets, followSets);
  const leftRec = detectLeftRecursion(grammar);
  const ambiguity = detectAmbiguity(grammar, firstSets, followSets);
  const parsingTable = buildParsingTable(grammar, firstSets, followSets);

  return {
    grammar,
    firstSets,
    followSets,
    isLL1: ll1Check.isLL1,
    ll1Conflicts: ll1Check.conflicts,
    hasLeftRecursion: leftRec.hasLeftRecursion,
    leftRecursionDetails: leftRec.details,
    isAmbiguous: ambiguity.isAmbiguous,
    ambiguityDetails: ambiguity.details,
    parsingTable,
    errors: [],
  };
}
