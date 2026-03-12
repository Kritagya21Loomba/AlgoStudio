export interface KMPState {
  text: string;
  pattern: string;
  textIdx: number;
  patIdx: number;
  lps: number[];
  matches: number[];              // starting indices of matches found
  phase: 'lps' | 'search';       // which phase we're in
  lpsBuilding: number;            // current index being computed in LPS
  comparedTextIdx: number | null; // highlighted char in text
  comparedPatIdx: number | null;  // highlighted char in pattern
  patternOffset: number;          // where pattern is aligned in text
  message: string;
}

export interface KMPInput {
  text: string;
  pattern: string;
}
