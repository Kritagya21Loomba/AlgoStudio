export interface HashBucket {
  index: number;
  key: number | null;
  status: 'empty' | 'occupied' | 'probing' | 'collision' | 'just-inserted';
}

export interface HashTableState {
  buckets: HashBucket[];
  tableSize: number;
  currentKey: number | null;
  hashValue: number | null;
  probeSequence: number[];
  probeIndex: number;
  collisionCount: number;
  message: string;
  hashFormula: string;
}

export interface HashTableInput {
  keys: number[];
  tableSize: number;
  strategy: 'linear' | 'quadratic';
}
