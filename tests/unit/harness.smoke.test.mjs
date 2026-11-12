import { expect, it } from 'vitest';

it('provides a DOM environment', () => {
  expect(document.createElement('div').tagName).toBe('DIV');
});
