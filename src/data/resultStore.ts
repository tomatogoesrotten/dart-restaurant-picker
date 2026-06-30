import type { ThrowResult } from "../types";

/**
 * Persistence seam for throw results. v1 is in-memory only (results do NOT
 * survive a reload). It is shaped so a localStorage- or backend-backed store
 * can replace it later without touching callers.
 * ponytail: in-memory now; add load()/save() when history/favorites is wanted.
 */
class InMemoryResultStore {
  private results: ThrowResult[] = [];

  record(result: ThrowResult): void {
    this.results.push(result);
  }

  all(): ThrowResult[] {
    return [...this.results];
  }

  clear(): void {
    this.results = [];
  }
}

export const resultStore = new InMemoryResultStore();
