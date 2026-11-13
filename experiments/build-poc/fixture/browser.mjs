import './style.css';
import { DEFAULT_STYLE, render } from './core.mjs';

export function mount(target, text) {
  const node = render(target, text);
  Object.assign(node.style, DEFAULT_STYLE);
  return node;
}
