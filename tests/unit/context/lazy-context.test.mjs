// @ts-check
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createLazyContext,
  getContextFor,
  getWebAppContext,
  isLazyContext,
} from '../../../src/context/LazyContext.mjs';
import { Toast } from '../../../src/core/Toast.mjs';

const require = createRequire(import.meta.url);
const LEGACY = /** @type {any} */ (require('../../../src/Toast.js'));

const ROOT_DIR = process.cwd();

/**
 * Narrows a value to a lazy context.
 *
 * @param {unknown} value
 * @returns {import('../../../src/context/LazyContext.mjs').LazyContext}
 */
function asLazy(value) {
  if (!isLazyContext(value)) throw new Error('expected a lazy context');
  return value;
}

beforeEach(() => {
  document.body.innerHTML = '';
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('lazy context — in a browser', () => {
  it('returns the body as the web app context', () => {
    expect(getWebAppContext()).toBe(document.body);
  });

  it('resolves an element container directly', () => {
    const element = document.createElement('div');

    expect(getContextFor(element)).toBe(element);
  });

  it('returns the web app context for anything else', () => {
    expect(getContextFor(42)).toBe(getWebAppContext());
    expect(getContextFor(null)).toBe(getWebAppContext());
  });

  it('does not query immediately for a string selector', () => {
    const spy = vi.spyOn(document, 'querySelector');
    const lazy = getContextFor('#missing');

    expect(spy).not.toHaveBeenCalled();
    expect(isLazyContext(lazy)).toBe(true);
    spy.mockRestore();
  });

  it('resolves a string selector lazily through querySelector', () => {
    const target = document.createElement('div');
    target.id = 'target';
    document.body.appendChild(target);

    const lazy = asLazy(getContextFor('#target'));

    expect(isLazyContext(lazy)).toBe(true);
    expect(lazy.resolve()).toBe(target);
  });

  it('falls back to the body when the selector matches nothing', () => {
    const lazy = asLazy(getContextFor('#nothing-here'));

    expect(lazy.resolve()).toBe(document.body);
  });

  it('throws at resolution time for an invalid selector, not at creation', () => {
    const lazy = asLazy(getContextFor('###'));

    expect(() => lazy.resolve()).toThrow();
  });

  it('reports readiness and laziness', () => {
    const lazy = createLazyContext();

    expect(lazy.isLazy()).toBe(true);
    expect(lazy.isReady()).toBe(true);
    lazy.resolve();
    expect(lazy.isLazy()).toBe(false);
  });

  it('pins and forgets a forced element', () => {
    const element = document.createElement('div');
    const lazy = createLazyContext();

    lazy.forceResolve(element);
    expect(lazy.resolve()).toBe(element);

    lazy.reset();
    expect(lazy.isLazy()).toBe(true);
  });
});

describe('lazy context — the instance', () => {
  it('resolves an element container when the toast is constructed', () => {
    const element = document.createElement('div');
    const toast = new Toast(element, 'hello');

    expect(toast.context).toBe(element);
  });

  it('resolves a lazy context when the toast is constructed', () => {
    const target = document.createElement('div');
    target.id = 'lazy-target';
    document.body.appendChild(target);

    const toast = new Toast(getContextFor('#lazy-target'), 'hello');

    expect(toast.context).toBe(target);
  });

  it('defers rendering until a lazy context resolves', () => {
    const target = document.createElement('div');
    target.id = 'deferred';
    document.body.appendChild(target);

    const lazy = asLazy(getContextFor('#deferred'));
    lazy.reset();
    const toast = new Toast(lazy, 'hello');

    toast.show();
    expect(toast.toastElement).not.toBeNull();
  });

  it('falls back to the body when no context is given', () => {
    // In a browser there is always a body to fall back to; the no-context case
    // is the SSR one, covered by the probe below.
    expect(new Toast(null, 'hello').context).toBe(document.body);
  });
});

describe('lazy context — in SSR', () => {
  it('imports without touching a DOM global and resolves to null in SSR', () => {
    const probe = `
      const touched = [];
      for (const name of ['window', 'document']) {
        Object.defineProperty(globalThis, name, {
          configurable: true,
          get() { touched.push(name); return undefined; },
        });
      }
      const module = await import(${JSON.stringify(join(ROOT_DIR, 'src/context/LazyContext.mjs'))});
      const touchedAtImport = touched.length;
      const context = module.getWebAppContext();
      const selector = module.getContextFor('#anything');
      const { Toast } = await import(${JSON.stringify(join(ROOT_DIR, 'src/core/Toast.mjs'))});
      const toast = new Toast(null, 'x');
      const warnings = [];
      const originalWarn = console.warn;
      console.warn = (message) => warnings.push(String(message));
      toast.show();
      console.warn = originalWarn;
      console.log(JSON.stringify({
        touchedAtImport,
        isLazy: module.isLazyContext(context),
        resolved: context.resolve(),
        selectorResolved: selector.resolve(),
        selectorIsLazy: module.isLazyContext(selector),
        rendered: toast.toastElement !== null,
        warned: warnings.length > 0,
      }));
    `;
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', probe], {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    });
    const result = JSON.parse(output.trim().split('\n').pop() ?? '{}');

    expect(result.touchedAtImport).toBe(0);
    expect(result.isLazy).toBe(true);
    expect(result.resolved).toBeNull();
    expect(result.selectorResolved).toBeNull();
    expect(result.selectorIsLazy).toBe(true);
    expect(result.rendered).toBe(false);
    expect(result.warned).toBe(true);
  });
});

describe('lazy context — equivalence with the audited baseline', () => {
  it('resolves the same contexts as the current implementation', () => {
    const element = document.createElement('div');
    const target = document.createElement('div');
    target.id = 'baseline';
    document.body.appendChild(target);

    expect(getWebAppContext()).toBe(LEGACY.getWebAppContext());
    expect(getContextFor(element)).toBe(LEGACY.getContextFor(element));
    expect(getContextFor(42)).toBe(LEGACY.getContextFor(42));

    expect(asLazy(getContextFor('#baseline')).resolve())
      .toBe(LEGACY.getContextFor('#baseline').resolve());
  });

  it('throws at resolution time for an invalid selector, like the baseline', () => {
    const modern = asLazy(getContextFor('###'));
    const legacy = LEGACY.getContextFor('###');

    expect(() => modern.resolve()).toThrow();
    expect(() => legacy.resolve()).toThrow();
  });
});
