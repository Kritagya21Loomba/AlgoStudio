import type { Algorithm, AlgorithmStep } from '../types';
import type { HashTableState, HashTableInput, HashBucket } from './types';

function emptyBuckets(size: number): HashBucket[] {
  return Array.from({ length: size }, (_, i) => ({
    index: i,
    key: null,
    status: 'empty' as const,
  }));
}

function cloneBuckets(buckets: HashBucket[]): HashBucket[] {
  return buckets.map((b) => ({ ...b }));
}

function resetStatuses(buckets: HashBucket[]): HashBucket[] {
  return buckets.map((b) => ({
    ...b,
    status: b.key !== null ? 'occupied' as const : 'empty' as const,
  }));
}

export const linearProbing: Algorithm<HashTableState, HashTableInput> = {
  meta: {
    name: 'Hash Table (Linear Probing)',
    slug: 'hash-table-linear',
    category: 'hashing',
    complexity: {
      time: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
      space: 'O(n)',
    },
    pseudocode: [
      'procedure Insert(table, key)',
      '  h ← key mod tableSize',
      '  i ← 0',
      '  while table[(h + i) mod tableSize] is occupied',
      '    i ← i + 1  // collision, probe next',
      '  table[(h + i) mod tableSize] ← key',
      '  return',
    ],
  },

  generateSteps(input: HashTableInput): AlgorithmStep<HashTableState>[] {
    const { keys, tableSize } = input;
    const steps: AlgorithmStep<HashTableState>[] = [];
    let buckets = emptyBuckets(tableSize);

    steps.push({
      state: {
        buckets: cloneBuckets(buckets),
        tableSize,
        currentKey: null,
        hashValue: null,
        probeSequence: [],
        probeIndex: 0,
        collisionCount: 0,
        message: `Empty hash table of size ${tableSize}`,
        hashFormula: `h(key) = key mod ${tableSize}`,
      },
      activeLines: [0],
      description: `Starting with empty hash table of size ${tableSize}`,
      action: 'init',
    });

    let totalCollisions = 0;

    for (const key of keys) {
      const h = ((key % tableSize) + tableSize) % tableSize;

      // Hash step
      buckets = resetStatuses(buckets);
      steps.push({
        state: {
          buckets: cloneBuckets(buckets),
          tableSize,
          currentKey: key,
          hashValue: h,
          probeSequence: [h],
          probeIndex: 0,
          collisionCount: totalCollisions,
          message: `h(${key}) = ${key} mod ${tableSize} = ${h}`,
          hashFormula: `h(${key}) = ${key} mod ${tableSize} = ${h}`,
        },
        activeLines: [0, 1],
        description: `Hash key ${key}: h(${key}) = ${key} mod ${tableSize} = ${h}`,
        action: 'hash',
      });

      // Probe until we find an empty slot
      let i = 0;
      const probeSeq: number[] = [];
      let placed = false;

      while (i < tableSize) {
        const probeIdx = (h + i) % tableSize;
        probeSeq.push(probeIdx);

        if (buckets[probeIdx].key === null) {
          // Empty slot found — insert
          buckets = resetStatuses(buckets);
          const probeBuckets = cloneBuckets(buckets);
          // Highlight probe sequence
          for (const pi of probeSeq.slice(0, -1)) {
            probeBuckets[pi].status = 'probing';
          }
          probeBuckets[probeIdx].status = 'just-inserted';
          probeBuckets[probeIdx].key = key;

          steps.push({
            state: {
              buckets: probeBuckets,
              tableSize,
              currentKey: key,
              hashValue: h,
              probeSequence: [...probeSeq],
              probeIndex: i,
              collisionCount: totalCollisions,
              message: i === 0
                ? `Slot ${probeIdx} is empty — insert ${key}`
                : `Slot ${probeIdx} is empty after ${i} probe(s) — insert ${key}`,
              hashFormula: `h(${key}) = ${key} mod ${tableSize} = ${h}`,
            },
            activeLines: [5],
            description: i === 0
              ? `Insert ${key} at index ${probeIdx}`
              : `Insert ${key} at index ${probeIdx} after ${i} collision(s)`,
            action: 'probe',
          });

          // Commit the insert
          buckets[probeIdx].key = key;
          buckets[probeIdx].status = 'occupied';
          placed = true;
          break;
        } else {
          // Collision
          totalCollisions++;
          buckets = resetStatuses(buckets);
          const collBuckets = cloneBuckets(buckets);
          for (const pi of probeSeq) {
            collBuckets[pi].status = 'probing';
          }
          collBuckets[probeIdx].status = 'collision';

          steps.push({
            state: {
              buckets: collBuckets,
              tableSize,
              currentKey: key,
              hashValue: h,
              probeSequence: [...probeSeq],
              probeIndex: i,
              collisionCount: totalCollisions,
              message: `Slot ${probeIdx} occupied by ${buckets[probeIdx].key} — collision! Probe next`,
              hashFormula: `(${h} + ${i + 1}) mod ${tableSize} = ${(h + i + 1) % tableSize}`,
            },
            activeLines: [3, 4],
            description: `Collision at index ${probeIdx} (occupied by ${buckets[probeIdx].key}), probing next`,
            action: 'collision',
          });

          i++;
        }
      }

      if (!placed) {
        steps.push({
          state: {
            buckets: cloneBuckets(resetStatuses(buckets)),
            tableSize,
            currentKey: key,
            hashValue: h,
            probeSequence: [...probeSeq],
            probeIndex: i,
            collisionCount: totalCollisions,
            message: `Table full — cannot insert ${key}`,
            hashFormula: `h(${key}) = ${key} mod ${tableSize}`,
          },
          activeLines: [],
          description: `Hash table is full, cannot insert ${key}`,
          action: 'collision',
        });
      }
    }

    steps.push({
      state: {
        buckets: cloneBuckets(resetStatuses(buckets)),
        tableSize,
        currentKey: null,
        hashValue: null,
        probeSequence: [],
        probeIndex: 0,
        collisionCount: totalCollisions,
        message: `All keys inserted. Total collisions: ${totalCollisions}`,
        hashFormula: `h(key) = key mod ${tableSize}`,
      },
      activeLines: [],
      description: `All insertions complete. Total collisions: ${totalCollisions}`,
      action: 'done',
    });

    return steps;
  },
};

export const DEFAULT_HASH_LINEAR_INPUT: HashTableInput = {
  keys: [10, 22, 31, 4, 15, 28, 17, 88, 59],
  tableSize: 13,
  strategy: 'linear',
};
