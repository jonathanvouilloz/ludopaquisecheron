/** In-memory only: survives Astro page swaps, never persists personal data to storage. */
export function createContactSession() {
  const state = {
    draft: null as Record<string, string> | null,
    touched: new Set<string>(),
    submitted: false,
    keys: new Map<string, string>(),
  };
  return {
    state,
    rememberDraft(values: Record<string, string>) {
      state.draft = { ...values };
    },
    keyFor(
      snapshot: string,
      generate: () => string = () => crypto.randomUUID(),
    ) {
      if (!state.keys.has(snapshot)) state.keys.set(snapshot, generate());
      return state.keys.get(snapshot)!;
    },
    startAnotherMessage() {
      state.draft = null;
      state.submitted = false;
      state.touched.clear();
      state.keys.clear();
    },
  };
}
