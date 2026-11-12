import { legacyAdapter } from '../legacy.mjs';

// Stands in for src/index.mjs until task T015 creates the real ESM entry.
// It exports the audited implementation the way the new entry will: a default
// export of the Toast constructor.
export default await legacyAdapter.load();
