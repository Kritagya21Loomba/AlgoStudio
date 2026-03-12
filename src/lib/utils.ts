import { ARRAY_VALUE_MIN, ARRAY_VALUE_MAX } from './constants';

/** Generate an array of random integers */
export function generateRandomArray(size: number): number[] {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (ARRAY_VALUE_MAX - ARRAY_VALUE_MIN + 1)) + ARRAY_VALUE_MIN
  );
}

/** Generate stable IDs for an array */
export function generateIds(length: number): string[] {
  return Array.from({ length }, (_, i) => `el-${i}`);
}

/** Parse a comma-separated string into a number array */
export function parseArrayInput(input: string): number[] | null {
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
  const nums = parts.map(Number);
  if (nums.some(isNaN) || nums.length < 2) return null;
  return nums;
}
