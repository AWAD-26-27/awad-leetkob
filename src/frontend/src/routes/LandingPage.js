import { h } from '../lib/react.js';
import { LandingHero } from './LandingHero.js';
import { LandingDemoAccounts } from './LandingDemoAccounts.js';
import { LandingFeatures } from './LandingFeatures.js';

export function LandingPage({ onOpenLogin }) {
  return h(
    'div',
    { className: 'animate-fade-in' },
    h(LandingHero, { onOpenLogin }),
    h(LandingDemoAccounts, { onOpenLogin }),
    h(LandingFeatures, null),
  );
}
