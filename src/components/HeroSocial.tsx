import { AtSign, Instagram, Mail, Youtube } from 'lucide-react';
import { SocialPlatform, trackSocialClick } from '../lib/analytics';

function TikTokIcon({ size = 19 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

const SOCIAL = [
  {
    platform: SocialPlatform.Instagram,
    href: 'https://www.instagram.com/softqueerwealth?igsh=NzVzaWt4N3BseDQ5',
    label: 'Instagram',
    Icon: Instagram,
  },
  {
    platform: SocialPlatform.TikTok,
    href: 'https://www.tiktok.com/@softqueerwealth?_r=1&_t=ZT-99Y0M5ekXZV',
    label: 'TikTok',
    Icon: TikTokIcon,
  },
  {
    platform: SocialPlatform.YouTube,
    href: 'https://youtube.com/@softqueerwealth?si=RVF9Hz3qheVZAq69',
    label: 'YouTube',
    Icon: Youtube,
  },
  {
    platform: SocialPlatform.Threads,
    href: 'https://www.threads.com/@softqueerwealth',
    label: 'Threads',
    Icon: AtSign,
  },
  {
    platform: SocialPlatform.Email,
    href: 'mailto:SoftQueerWealth@gmail.com',
    label: 'Email Soft Queer Wealth',
    Icon: Mail,
  },
] as const;

export function HeroSocial() {
  return (
    <div className="hero-social" aria-label="Soft Queer Wealth links">
      {SOCIAL.map(({ platform, href, label, Icon }) => (
        <a
          key={platform}
          href={href}
          target={href.startsWith('mailto:') ? undefined : '_blank'}
          rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          aria-label={label}
          onClick={() => trackSocialClick(platform, href)}
        >
          <Icon size={19} aria-hidden />
        </a>
      ))}
    </div>
  );
}
