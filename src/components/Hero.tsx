import { HeroSocial } from './HeroSocial';
import { LAST_UPDATED_LABEL } from '../constants/lastUpdated';

export function Hero() {
  return (
    <header className="hero">
      <HeroSocial />
      <img src="/hero-logo.png" alt="" className="hero-logo" width={80} height={80} />
      <h1>
      The Mahogany Pages
      </h1>
      <div className="notice">
        <strong style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      🌈🤎 Centering Black WLW, Femmes, and Theys
        </strong>
        <br />
        <br />
        This guide grows with the community. See something missing? Slide in our DMs and we&apos;ll get it
        added!
        <br />
        <br />
        <em>Schedule subject to change.</em>
      </div>
      <p className="last-updated">Last updated · {LAST_UPDATED_LABEL}</p>
    </header>
  );
}
