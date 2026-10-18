import { useEffect, useState, type KeyboardEvent } from 'react';
import { FOOTER_BAND, FOOTER_COPY } from '../../data/home';
import {
  CARE_CITIES,
  CARE_PROMPTS,
  CHECK_IN_CARDS,
  CONVERSATION_CARDS,
  JUMP_LINKS,
  STI_ACCORDIONS,
  type AccordionBlock,
  type WellnessCard,
} from '../../data/sexualWellness';
import './sexualWellness.css';

type DeckId = 'self' | 'talk';

const DECKS: Record<DeckId, { label: string; cards: WellnessCard[] }> = {
  self: { label: 'Check-in cards. Swipe sideways to move through them.', cards: CHECK_IN_CARDS },
  talk: {
    label: 'Conversation cards. Swipe sideways to move through them.',
    cards: CONVERSATION_CARDS,
  },
};

function scrollToId(id: string) {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B1410" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ArrowOut() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B1410" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function ArrowUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B1410" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 15l6-6 6 6" />
    </svg>
  );
}

function GuideCard({ card }: { card: WellnessCard }) {
  return (
    <article className={`sw-card sw-c-${card.tone}`}>
      <div className="sw-card-num" aria-hidden="true">
        {card.number}
      </div>
      <div className="sw-card-kicker">{card.eyebrow}</div>
      <h3>{card.title}</h3>
      {card.lead ? <p>{card.lead}</p> : null}
      {card.items ? (
        <ul className="sw-list">
          {card.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {card.note ? <p className="sw-note">{card.note}</p> : null}
      {card.emphasis ? <p className="sw-emphasis">{card.emphasis}</p> : null}
      {card.bubbles?.map((bubble) => (
        <div key={bubble} className="sw-bubble">
          {bubble}
        </div>
      ))}
    </article>
  );
}

function AccordionBlocks({ blocks }: { blocks: AccordionBlock[] }) {
  return (
    <div className="sw-body">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === 'p') return <p key={key}>{block.text}</p>;
        if (block.type === 'note') {
          return (
            <p key={key} className="sw-muted-note">
              {block.text}
            </p>
          );
        }
        if (block.type === 'sub') {
          return (
            <div key={key} className="sw-sub">
              {block.label}
            </div>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={key} className="sw-list">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'callout') {
          return (
            <div key={key} className="sw-callout">
              <div className="sw-callout-label">{block.label}</div>
              {block.text}
            </div>
          );
        }
        if (block.type === 'bubble') {
          return (
            <div key={key} className="sw-bubble">
              {block.text}
            </div>
          );
        }
        if (block.type === 'myth') {
          return (
            <div key={key}>
              <div className="sw-myth-title">{block.title}</div>
              <p>{block.body}</p>
            </div>
          );
        }
        return (
          <p key={key}>
            <a href={block.href} target="_blank" rel="noopener noreferrer">
              {block.label}
            </a>
          </p>
        );
      })}
    </div>
  );
}

function GuideDeck() {
  const [deck, setDeck] = useState<DeckId>('self');
  const [index, setIndex] = useState(0);
  const active = DECKS[deck];

  useEffect(() => {
    const el = document.getElementById('sw-deck');
    if (!el) return;

    const onScroll = () => {
      const count = active.cards.length;
      const next = Math.max(0, Math.min(count - 1, Math.round(el.scrollLeft / (el.scrollWidth / count))));
      setIndex(next);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [active.cards.length, deck]);

  const pick = (next: DeckId) => {
    setDeck(next);
    setIndex(0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const card = event.currentTarget.querySelector<HTMLElement>('.sw-card');
    if (!card) return;
    const delta = card.offsetWidth + 14;
    event.currentTarget.scrollBy({
      left: event.key === 'ArrowRight' ? delta : -delta,
      behavior: 'smooth',
    });
    event.preventDefault();
  };

  return (
    <>
      <div className="sw-seg" role="group" aria-label="Choose a part of the guide">
        <button type="button" aria-pressed={deck === 'self'} onClick={() => pick('self')}>
          Check in with yourself
        </button>
        <button type="button" aria-pressed={deck === 'talk'} onClick={() => pick('talk')}>
          Have the conversation
        </button>
      </div>

      <div
        id="sw-deck"
        key={deck}
        className="sw-deck"
        tabIndex={0}
        aria-label={active.label}
        onKeyDown={onKeyDown}
      >
        {active.cards.map((card) => (
          <GuideCard key={`${deck}-${card.number}`} card={card} />
        ))}
      </div>

      <div className="sw-progress">
        <div className="sw-counter" aria-live="polite">
          {index + 1} of {active.cards.length}
        </div>
        <div className="sw-dots" aria-hidden="true">
          {active.cards.map((card, cardIndex) => (
            <span key={card.number} className={cardIndex === index ? 'sw-dot is-active' : 'sw-dot'} />
          ))}
        </div>
      </div>
    </>
  );
}

export function SexualWellnessPage() {
  return (
    <section className="screen active" id="screen-wellness" aria-label="Sexual Wellness">
      <div className="sw-page" id="top">
        <header className="sw-hero">
          <div className="sw-kicker">Learn and explore</div>
          <h1 className="sw-title">Sexual Wellness</h1>
          <p className="sw-lede">
            Black queer sapphic education, pleasure and care, shared by the people who know.
          </p>
        </header>

        <nav className="sw-jumps" aria-label="On this page">
          <div className="sw-jump-row">
            {JUMP_LINKS.map((link) => (
              <button key={link.id} type="button" className="sw-jump" onClick={() => scrollToId(link.id)}>
                {link.label}
              </button>
            ))}
          </div>
        </nav>

        <main className="sw-main">
          <div id="conversation" className="sw-intro sw-c-peach">
            <svg className="sw-intro-spark" width="30" height="30" viewBox="0 0 24 24" fill="#FFE59A" stroke="#1B1410" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
            </svg>
            <h2>New here? Start with a conversation.</h2>
            <p>
              Grab one of our free guides or learn what to ask before your next appointment. Everything
              here is made with Black queer sapphic people in mind.
            </p>
          </div>

          <div className="sw-guide-head">
            <img
              className="sw-cover"
              src="/sexual-wellness/checkin-guide-cover.jpg"
              alt="Cover of the Sexual Health Check-In and Conversation Guide"
            />
            <div>
              <span className="sw-chip sw-c-peach">Free guide</span>
              <h2>Sexual Health Check-In + Conversation Guide</h2>
            </div>
          </div>
          <p className="sw-copy">
            Swipe through at your own pace. Start with yourself then take it into the conversation.
          </p>

          <GuideDeck />

          <div className="sw-dark">
            <div className="sw-dark-kicker">Take this with you</div>
            <p>
              You don’t need perfect answers to have this conversation. You just need honesty, awareness
              and a willingness to slow things down when something doesn’t feel right.
            </p>
          </div>

          <div className="sw-guide-head" id="sti-guide">
            <img
              className="sw-cover"
              src="/sexual-wellness/sti-guide-cover.jpg"
              alt="Cover of the free Sexual Health and STI Testing guide"
            />
            <div>
              <span className="sw-chip sw-c-pink">Free guide</span>
              <h2>Sexual Health + STI Testing Guide</h2>
            </div>
          </div>
          <p className="sw-copy">
            Testing, risk and real conversations without the shame. Tap a topic to read it right here.
          </p>

          {STI_ACCORDIONS.map((item) => (
            <details key={item.number} className={`sw-acc sw-c-${item.tone}`}>
              <summary>
                <span className="sw-acc-num">{item.number}</span>
                <span className="sw-acc-title">{item.title}</span>
                <span className="sw-acc-chevron">
                  <Chevron />
                </span>
              </summary>
              <AccordionBlocks blocks={item.blocks} />
            </details>
          ))}

          <div className="sw-dark">
            <div className="sw-dark-kicker">A note before you go</div>
            <p>
              Sexual health is not only testing or using barriers. It’s also awareness, communication,
              consent and behavior, and being accountable to your own health and the people you are
              intertwined with.
            </p>
            <p className="sw-disclaimer">
              We are not doctors or your personal clinicians. Your body deserves personalized care, so
              always check in with your doctor or a qualified provider for advice that is specific to you.
            </p>
          </div>

          <div className="sw-find" id="find-care">
            <span className="sw-chip sw-c-mint">Find care</span>
            <h2>Know your care</h2>
            <p>
              Take these questions to your appointment. When you are ready to book, find providers in
              your city on The Mahogany Pages.
            </p>
          </div>

          <div className="sw-section-label">Questions to take with you</div>
          {CARE_PROMPTS.map((prompt) => (
            <article key={prompt.title} className={`sw-acc sw-c-${prompt.tone}`}>
              <div className="sw-static-head">
                <h3>{prompt.title}</h3>
                <p>{prompt.summary}</p>
              </div>
              <div className="sw-body">
                <div className="sw-sub">What to ask</div>
                <ul className="sw-list">
                  {prompt.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}

          <div className="sw-section-label">Find providers in your city</div>
          <p className="sw-city-intro">
            Listings live on The Mahogany Pages. Choose a city to see affirming care and events there.
          </p>
          {CARE_CITIES.map((city) => (
            <a key={city.href} href={city.href} className={`sw-city sw-c-${city.tone}`}>
              <span className="sw-city-name">{city.name}</span>
              <span className="sw-city-go">
                <ArrowOut />
              </span>
            </a>
          ))}

          <div className="sw-soon">
            <span className="sw-chip sw-c-butter">Coming next</span>
            <h3>More on the way</h3>
            <p>
              Pleasure, kink and consent, and conversations with our partners and experts will be added
              as they are ready.
            </p>
          </div>
        </main>

        <div className="sw-back">
          <button type="button" onClick={() => scrollToId('top')}>
            <ArrowUp />
            Back to top
          </button>
        </div>
      </div>

      <div className="footer-band">{FOOTER_BAND}</div>
      <div className="site-footer">{FOOTER_COPY}</div>
    </section>
  );
}
