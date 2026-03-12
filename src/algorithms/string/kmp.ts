import type { Algorithm, AlgorithmStep } from '../types';
import type { KMPState, KMPInput } from './types';

function makeState(overrides: Partial<KMPState> & Pick<KMPState, 'text' | 'pattern'>): KMPState {
  return {
    textIdx: 0,
    patIdx: 0,
    lps: [],
    matches: [],
    phase: 'lps',
    lpsBuilding: 0,
    comparedTextIdx: null,
    comparedPatIdx: null,
    patternOffset: 0,
    message: '',
    ...overrides,
  };
}

function buildLPSSteps(pattern: string, steps: AlgorithmStep<KMPState>[], text: string): number[] {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  let len = 0;
  let i = 1;

  steps.push({
    state: makeState({
      text, pattern,
      lps: [...lps],
      phase: 'lps',
      lpsBuilding: 0,
      message: 'Building LPS (Longest Proper Prefix-Suffix) table',
    }),
    activeLines: [0, 1],
    description: 'Phase 1: Build the LPS table for the pattern',
    action: 'init',
  });

  steps.push({
    state: makeState({
      text, pattern,
      lps: [...lps],
      phase: 'lps',
      lpsBuilding: 0,
      comparedPatIdx: 0,
      message: 'LPS[0] = 0 (single char has no proper prefix-suffix)',
    }),
    activeLines: [2, 3],
    description: 'LPS[0] = 0 (always)',
    action: 'set',
  });

  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      steps.push({
        state: makeState({
          text, pattern,
          lps: [...lps],
          phase: 'lps',
          lpsBuilding: i,
          comparedPatIdx: i,
          message: `pattern[${i}]='${pattern[i]}' = pattern[${len - 1}]='${pattern[len - 1]}' → LPS[${i}] = ${len}`,
        }),
        activeLines: [4, 5, 6],
        description: `Match: LPS[${i}] = ${len}`,
        action: 'match',
      });
      i++;
    } else {
      if (len !== 0) {
        steps.push({
          state: makeState({
            text, pattern,
            lps: [...lps],
            phase: 'lps',
            lpsBuilding: i,
            comparedPatIdx: i,
            message: `Mismatch at i=${i}, fall back: len = LPS[${len - 1}] = ${lps[len - 1]}`,
          }),
          activeLines: [7, 8],
          description: `Mismatch: fall back len ${len} → ${lps[len - 1]}`,
          action: 'mismatch',
        });
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        steps.push({
          state: makeState({
            text, pattern,
            lps: [...lps],
            phase: 'lps',
            lpsBuilding: i,
            comparedPatIdx: i,
            message: `No match and len=0 → LPS[${i}] = 0`,
          }),
          activeLines: [9, 10],
          description: `LPS[${i}] = 0`,
          action: 'set',
        });
        i++;
      }
    }
  }

  steps.push({
    state: makeState({
      text, pattern,
      lps: [...lps],
      phase: 'lps',
      lpsBuilding: m - 1,
      message: `LPS table complete: [${lps.join(', ')}]`,
    }),
    activeLines: [11],
    description: `LPS table built: [${lps.join(', ')}]`,
    action: 'done',
  });

  return lps;
}

export const kmp: Algorithm<KMPState, KMPInput> = {
  meta: {
    name: 'KMP String Search',
    slug: 'kmp',
    category: 'string',
    complexity: {
      time: { best: 'O(n)', average: 'O(n + m)', worst: 'O(n + m)' },
      space: 'O(m)',
    },
    pseudocode: [
      'procedure buildLPS(pattern)',
      '  lps[0] \u2190 0; len \u2190 0; i \u2190 1',
      '  while i < m do',
      '    if pattern[i] = pattern[len] then',
      '      len += 1',
      '      lps[i] \u2190 len; i += 1',
      '    else',
      '      if len \u2260 0 then',
      '        len \u2190 lps[len - 1]',
      '      else',
      '        lps[i] \u2190 0; i += 1',
      '  return lps',
      '',
      'procedure KMP(text, pattern)',
      '  lps \u2190 buildLPS(pattern)',
      '  i \u2190 0; j \u2190 0',
      '  while i < n do',
      '    if text[i] = pattern[j] then',
      '      i += 1; j += 1',
      '    if j = m then',
      '      match found at i - j',
      '      j \u2190 lps[j - 1]',
      '    else if text[i] \u2260 pattern[j] then',
      '      if j \u2260 0 then',
      '        j \u2190 lps[j - 1]',
      '      else',
      '        i += 1',
    ],
  },

  generateSteps(input: KMPInput): AlgorithmStep<KMPState>[] {
    const steps: AlgorithmStep<KMPState>[] = [];
    const { text, pattern } = input;
    const n = text.length;
    const m = pattern.length;

    // Phase 1: Build LPS table
    const lps = buildLPSSteps(pattern, steps, text);

    // Phase 2: Search
    steps.push({
      state: makeState({
        text, pattern, lps: [...lps],
        phase: 'search',
        textIdx: 0, patIdx: 0,
        patternOffset: 0,
        message: 'Phase 2: Search for pattern in text',
      }),
      activeLines: [13, 14, 15],
      description: 'Begin searching text for pattern matches',
      action: 'init',
    });

    let i = 0;
    let j = 0;
    const matches: number[] = [];

    while (i < n) {
      if (text[i] === pattern[j]) {
        steps.push({
          state: makeState({
            text, pattern, lps: [...lps],
            phase: 'search',
            textIdx: i, patIdx: j,
            comparedTextIdx: i,
            comparedPatIdx: j,
            patternOffset: i - j,
            matches: [...matches],
            message: `text[${i}]='${text[i]}' = pattern[${j}]='${pattern[j]}' — match!`,
          }),
          activeLines: [16, 17, 18],
          description: `Match at text[${i}] = pattern[${j}] = '${text[i]}'`,
          action: 'match',
        });
        i++;
        j++;
      }

      if (j === m) {
        matches.push(i - j);
        steps.push({
          state: makeState({
            text, pattern, lps: [...lps],
            phase: 'search',
            textIdx: i, patIdx: j,
            patternOffset: i - j,
            matches: [...matches],
            message: `Pattern found at index ${i - j}!`,
          }),
          activeLines: [19, 20, 21],
          description: `Pattern found at index ${i - j}!`,
          action: 'found',
        });
        j = lps[j - 1];
      } else if (i < n && text[i] !== pattern[j]) {
        steps.push({
          state: makeState({
            text, pattern, lps: [...lps],
            phase: 'search',
            textIdx: i, patIdx: j,
            comparedTextIdx: i,
            comparedPatIdx: j,
            patternOffset: i - j,
            matches: [...matches],
            message: `text[${i}]='${text[i]}' \u2260 pattern[${j}]='${pattern[j]}' — mismatch`,
          }),
          activeLines: [22],
          description: `Mismatch at text[${i}] vs pattern[${j}]`,
          action: 'mismatch',
        });

        if (j !== 0) {
          const oldJ = j;
          j = lps[j - 1];
          steps.push({
            state: makeState({
              text, pattern, lps: [...lps],
              phase: 'search',
              textIdx: i, patIdx: j,
              patternOffset: i - j,
              matches: [...matches],
              message: `Shift pattern: j = LPS[${oldJ - 1}] = ${j}`,
            }),
            activeLines: [23, 24],
            description: `Shift pattern using LPS: j ${oldJ} \u2192 ${j}`,
            action: 'shift-pattern',
          });
        } else {
          steps.push({
            state: makeState({
              text, pattern, lps: [...lps],
              phase: 'search',
              textIdx: i + 1, patIdx: 0,
              patternOffset: i + 1,
              matches: [...matches],
              message: `j=0, advance text pointer: i = ${i + 1}`,
            }),
            activeLines: [25, 26],
            description: `No fallback, advance i to ${i + 1}`,
            action: 'shift-pattern',
          });
          i++;
        }
      }
    }

    // Done
    steps.push({
      state: makeState({
        text, pattern, lps: [...lps],
        phase: 'search',
        textIdx: n, patIdx: 0,
        patternOffset: 0,
        matches: [...matches],
        message: matches.length > 0
          ? `Search complete! Found ${matches.length} match(es) at index ${matches.join(', ')}`
          : 'Search complete! No matches found.',
      }),
      activeLines: [],
      description: matches.length > 0
        ? `Done! Found ${matches.length} match(es) at index ${matches.join(', ')}`
        : 'Done! No matches found.',
      action: 'done',
    });

    return steps;
  },
};

export const DEFAULT_KMP_INPUT: KMPInput = {
  text: 'ABABDABACDABABCABAB',
  pattern: 'ABABCABAB',
};
