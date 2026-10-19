export type WellnessTone = 'peach' | 'pink' | 'butter' | 'mint' | 'lilac' | 'sky';

export type WellnessCard = {
  tone: WellnessTone;
  number: string;
  eyebrow: string;
  title: string;
  lead?: string;
  items?: string[];
  note?: string;
  emphasis?: string;
  bubbles?: string[];
};

export type AccordionBlock =
  | { type: 'p'; text: string; strong?: boolean }
  | { type: 'scroll'; lead: string; label: string; tail: string; target: string }
  | { type: 'note'; text: string }
  | { type: 'sub'; label: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; label: string; text: string }
  | { type: 'bubble'; text: string }
  | { type: 'myth'; title: string; body: string }
  | { type: 'link'; label: string; href: string };

export type WellnessAccordion = {
  tone: WellnessTone;
  number: string;
  title: string;
  blocks: AccordionBlock[];
};

export type CarePrompt = {
  tone: WellnessTone;
  title: string;
  summary: string;
  questions: string[];
};

export type CareCity = {
  tone: WellnessTone;
  name: string;
  href: string;
  blurb: string;
};

export type WellnessOrg = {
  tone: WellnessTone;
  name: string;
  href: string;
  blurb: string;
};

export const JUMP_LINKS = [
  { id: 'conversation', label: 'Conversation' },
  { id: 'sti-guide', label: 'STI Testing' },
  { id: 'find-care', label: 'Find Care' },
  { id: 'organizations', label: 'Organizations' },
] as const;

export const CHECK_IN_CARDS: WellnessCard[] = [
  {
    tone: 'peach',
    number: '01',
    eyebrow: 'Identity',
    title: 'Where are you right now?',
    items: [
      'How do you currently identify?',
      'What does your dating and sexual ecosystem look like?',
      'Are you engaging casually, intentionally or both?',
    ],
    bubbles: [
      '“What is actually required of me to move in a way that is emotionally and sexually safe?”',
    ],
  },
  {
    tone: 'pink',
    number: '02',
    eyebrow: 'Emotional state',
    title: 'How does it feel?',
    items: [
      'How do you feel about your current sex life?',
      'What emotions tend to come up around sex?',
      'Do you feel comfortable advocating for your needs?',
    ],
    bubbles: [
      '“Especially with new hookups, I notice myself slipping into performance-mode instead of being present.”',
    ],
  },
  {
    tone: 'butter',
    number: '03',
    eyebrow: 'Body awareness',
    title: 'What is your body saying?',
    items: [
      'Do you feel connected to your body right now?',
      'Have there been changes in stress, health or energy?',
      'How does your body respond to overwhelm?',
    ],
    bubbles: ['“Sometimes I don’t have the capacity to have the kind of sex I want to be having.”'],
  },
  {
    tone: 'mint',
    number: '04',
    eyebrow: 'Boundaries',
    title: 'What is true today?',
    items: [
      'What are your hard no’s right now?',
      'What are you open to with conversation?',
      'What are you saying yes to?',
    ],
    note: 'Go with your current boundaries and not the idealized ones. This is about honesty and not performance.',
    bubbles: ['“I can stop or change my mind mid-sex.”'],
  },
  {
    tone: 'lilac',
    number: '05',
    eyebrow: 'Testing and risk profile',
    title: 'Know your baseline.',
    items: [
      'When was your last STI test and what were you tested for?',
      'What has your activity looked like since then?',
      'What does your risk behavior look like and what is your comfort level with risk?',
    ],
    bubbles: ['“I’ve learned I don’t have to jump straight into higher-risk sex.”'],
  },
];

export const CONVERSATION_CARDS: WellnessCard[] = [
  {
    tone: 'sky',
    number: '01',
    eyebrow: 'Opening',
    title: 'Ways to start',
    bubbles: [
      '“Quick check, when was your last testing date again?”',
      '“I want to be intentional about sexual health. Can we talk about that?”',
      '“Before we continue, I want to make sure we’re on the same page.”',
    ],
  },
  {
    tone: 'mint',
    number: '02',
    eyebrow: 'Talking about testing',
    title: 'Skip the shaming words.',
    lead: 'Move away from vague and shaming language like “clean.” Ask instead:',
    items: [
      'When were you last tested?',
      'What were you tested for?',
      'Have there been changes since then?',
    ],
  },
  {
    tone: 'pink',
    number: '03',
    eyebrow: 'Boundaries',
    title: 'Say it before things escalate.',
    lead: 'Say what you are comfortable with first and do not wait until you are already overwhelmed.',
    bubbles: ['“I’m comfortable with XYZ right now.”', '“I’d need XYZ to feel safe moving forward.”'],
  },
  {
    tone: 'butter',
    number: '04',
    eyebrow: 'If there’s pushback',
    title: 'Hold your line.',
    lead: 'You can keep it light but do not back down on your boundaries and comfort levels.',
    emphasis:
      'You are allowed to expect respect for your boundaries, your comfort and your consent, every f*cking time.',
  },
];

export const STI_ACCORDIONS: WellnessAccordion[] = [
  {
    tone: 'peach',
    number: '1',
    title: 'Why this matters',
    blocks: [
      {
        type: 'p',
        text: 'We talk about sexual health like it starts and ends with “are you clean?” That’s not only inaccurate, it’s also not helpful.',
      },
      {
        type: 'p',
        text: 'Sexual health is behavior, timing, communication and understanding your actual risk.',
      },
    ],
  },
  {
    tone: 'pink',
    number: '2',
    title: 'Common STIs',
    blocks: [
      { type: 'note', text: 'Not exhaustive, but these are the most commonly discussed.' },
      { type: 'sub', label: 'Bacterial (curable with treatment)' },
      { type: 'list', items: ['Chlamydia', 'Gonorrhea', 'Syphilis'] },
      { type: 'sub', label: 'Viral (manageable, not “curable” but very common)' },
      {
        type: 'list',
        items: ['HIV', 'HSV-1 (oral herpes)', 'HSV-2 (genital herpes)', 'HPV (human papillomavirus)'],
      },
      { type: 'sub', label: 'Also be aware of' },
      { type: 'list', items: ['Trichomoniasis', 'Hepatitis B and C'] },
      {
        type: 'callout',
        label: '★ Important ★',
        text: 'Different STIs transmit differently. Some through fluid exchange and some through skin-to-skin contact. So “we didn’t have penetrative sex” ≠ zero risk.',
      },
    ],
  },
  {
    tone: 'butter',
    number: '3',
    title: 'Queer + polyam nuance',
    blocks: [
      { type: 'sub', label: 'Queer women and people with vulvas' },
      {
        type: 'list',
        items: [
          'STI risk is often underestimated',
          'Transmission can still happen through oral sex, fingering (especially with cuts or microtears) and sharing toys',
        ],
      },
      { type: 'sub', label: 'Queer men and people with penises' },
      {
        type: 'list',
        items: [
          'Higher emphasis on HIV prevention (PrEP, testing)',
          'Regular screening depending on activity',
        ],
      },
      { type: 'sub', label: 'Polyam and ENM communities' },
      {
        type: 'list',
        items: [
          'Risk is network-based and not just individual',
          'Testing frequency often needs to increase',
          'Communication becomes just as important as protection',
        ],
      },
      {
        type: 'callout',
        label: '★ Important ★',
        text: 'Your risk is not just about you. It’s about your network and behaviors.',
      },
    ],
  },
  {
    tone: 'mint',
    number: '4',
    title: 'Testing windows',
    blocks: [
      {
        type: 'p',
        text: 'You cannot test for everything immediately after exposure. A detection window is the time between exposure and when a test can accurately detect something.',
      },
      { type: 'sub', label: 'General guidelines' },
      {
        type: 'list',
        items: [
          'HIV: about 18 to 45 days (depending on test type)',
          'Chlamydia and gonorrhea: about 1 to 2 weeks',
          'Syphilis: about 3 to 6 weeks',
          'Trichomoniasis: about 1 week',
        ],
      },
      {
        type: 'p',
        strong: true,
        text: 'Herpes, HPV and hepatitis are tested differently, so speak with your provider.',
      },
      {
        type: 'p',
        text: 'Testing “too early” can give a false negative. That is why timing and follow-up testing matter.',
      },
      {
        type: 'bubble',
        text: 'Example: instead of panic testing every few days, it’s more effective to test at the right window and re-test if needed.',
      },
    ],
  },
  {
    tone: 'lilac',
    number: '5',
    title: 'Testing frequency',
    blocks: [
      {
        type: 'p',
        text: 'This is not one-size-fits-all. The real question is “Does my testing frequency match my behavior?”',
      },
      { type: 'sub', label: 'General baseline' },
      {
        type: 'list',
        items: [
          'At minimum, test twice a year no matter how much activity you have',
          'Test with every new partner',
          'Test every 3 months (quarterly) with higher activity or multiple partners',
        ],
      },
      {
        type: 'bubble',
        text: 'Example: if your activity increases during certain seasons (like summer, travel or pride), your testing should too.',
      },
    ],
  },
  {
    tone: 'sky',
    number: '6',
    title: 'Risk is a spectrum',
    blocks: [
      { type: 'sub', label: 'Lower-risk activities' },
      {
        type: 'list',
        items: ['Mutual masturbation', 'Fingering', 'External touch', 'Using barriers consistently'],
      },
      { type: 'sub', label: 'Higher-risk activities' },
      {
        type: 'list',
        items: [
          'Unprotected penetrative sex',
          'Multiple overlapping partners without testing clarity',
        ],
      },
      {
        type: 'callout',
        label: '★ Key idea ★',
        text: 'You can choose your level of risk. Intimacy doesn’t have to mean maximum exposure.',
      },
    ],
  },
  {
    tone: 'peach',
    number: '7',
    title: 'Say it without shame',
    blocks: [
      {
        type: 'p',
        text: 'Even simple phrases like “I’m clean” reinforce shame and stigma. Better ways to say what you mean:',
      },
      { type: 'bubble', text: '“I tested negative on my last panel in [month/year].”' },
      { type: 'bubble', text: '“I test every [cadence] based on my activity.”' },
      { type: 'bubble', text: '“Here’s what I was tested for: XYZ.”' },
    ],
  },
  {
    tone: 'pink',
    number: '8',
    title: 'Myths',
    blocks: [
      {
        type: 'myth',
        title: 'No symptoms ≠ No STI',
        body: 'Many STIs are asymptomatic, so it is best to always test based on your risk profile. Your doctor will know what makes sense to test for.',
      },
      {
        type: 'myth',
        title: 'Testing once means you are “good to go”',
        body: 'Results are only accurate for that moment in time. A consistent routine lets you stay on top of your status and know if anything changes.',
      },
      {
        type: 'myth',
        title: '“Queer sex is low risk”',
        body: 'Risk still exists, just different types.',
      },
    ],
  },
  {
    tone: 'butter',
    number: '9',
    title: 'Where to test',
    blocks: [
      { type: 'sub', label: 'Find a clinic near you' },
      { type: 'link', label: 'CDC STI testing locator', href: 'https://gettested.cdc.gov' },
      { type: 'sub', label: 'Affirming providers by city' },
      {
        type: 'scroll',
        lead: 'See ',
        label: 'Find providers in your city',
        tail: ', further down this page.',
        target: 'city-providers',
      },
      { type: 'sub', label: 'What to ask your provider' },
      {
        type: 'list',
        items: [
          'Which tests fit my body and my partners?',
          'How often should I test?',
          'What prevention options should I know about?',
        ],
      },
      { type: 'sub', label: 'At-home testing kits' },
      {
        type: 'p',
        text: 'Helpful for convenience. Follow instructions carefully and always confirm with a provider if needed.',
      },
    ],
  },
];

export const CARE_PROMPTS: CarePrompt[] = [
  {
    tone: 'pink',
    title: 'Gender-affirming care',
    summary: 'How to start the process and what to look for in a provider.',
    questions: [
      'Do you have experience with patients like me?',
      'What does the process look like from here?',
      'How do referrals and insurance work?',
    ],
  },
  {
    tone: 'lilac',
    title: 'Therapy and mental health',
    summary: 'Finding a therapist who understands Black queer lives.',
    questions: [
      'Have you worked with Black queer clients?',
      'How do you approach sexual health and identity?',
      'Do you offer telehealth?',
    ],
  },
];

export const CARE_CITIES: CareCity[] = [
  {
    tone: 'sky',
    name: 'Baltimore',
    href: '/baltimore',
    blurb:
      'Baltimore Safe Haven offers mental health support and clinic services with the University of Maryland for LGBTQ people.',
  },
  {
    tone: 'butter',
    name: 'Washington, DC',
    href: '/dc',
    blurb: 'Us Helping Us offers free HIV and STI testing in Northwest DC along with PrEP navigation.',
  },
  {
    tone: 'pink',
    name: 'Atlanta',
    href: '/atlanta',
    blurb: 'SisterLove offers free HIV and STI testing with reproductive health and justice work.',
  },
];

export const ORGANIZATIONS: WellnessOrg[] = [
  {
    tone: 'peach',
    name: 'Radical Healing',
    href: 'https://radicalhealing.co/',
    blurb:
      'LGBTQ+ and BIPOC-centered health care with STI testing and free mental health care for Black queer and trans people.',
  },
  {
    tone: 'mint',
    name: 'GLMA',
    href: 'https://www.glma.org/',
    blurb: 'Find LGBTQ+ affirming providers anywhere in the U.S. with their healthcare directory.',
  },
  {
    tone: 'sky',
    name: 'National Queer and Trans Therapists of Color Network',
    href: 'https://www.nqttcn.com/',
    blurb: 'A directory of therapists and healers for queer and trans people of color.',
  },
];
