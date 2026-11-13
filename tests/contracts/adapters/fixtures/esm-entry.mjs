// @ts-check
import { legacyAdapter } from '../legacy.mjs';

// A minimal ESM entry with the same export shape as `src/index.mjs`, used to
// exercise the adapter's entry resolution independently of the real entry.
export default await legacyAdapter.load();
