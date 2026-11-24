import { h, render } from './lib/react.js';
import { App } from './App.js';

const rootEl = document.getElementById('root');
if (rootEl) {
  render(h(App, null), rootEl);
}
