import { useCallback, useEffect, useState } from 'react';
import { MahoganyPages } from './components/mahogany/MahoganyPages';
import { SoftLettersPage } from './components/softLetters/SoftLettersPage';
import { Topbar } from './components/Topbar';
import { SOFT_LETTERS_ENABLED, type RoomId } from './data/rooms';
import { trackPageView } from './lib/analytics';

export default function App() {
  const [activeRoom, setActiveRoom] = useState<RoomId>('neighborhood');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // Soft Letters uses a virtual path. Neighborhood pageviews are owned by
    // MahoganyPages so city paths like /nyc are reported correctly.
    if (activeRoom === 'reading') {
      trackPageView('/soft-letters');
      return;
    }
    trackPageView(window.location.pathname || '/');
  }, [activeRoom]);

  const go = useCallback((room: RoomId) => {
    if (room === 'reading' && !SOFT_LETTERS_ENABLED) {
      setActiveRoom('neighborhood');
    } else {
      setActiveRoom(room);
    }
    setDrawerOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((open) => !open);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setDrawerOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const { body } = document;

    html.classList.add('drawer-lock');
    body.classList.add('drawer-lock');
    body.style.top = `-${scrollY}px`;

    const preventBackgroundScroll = (event: TouchEvent) => {
      const nav = document.getElementById('navrooms');
      const target = event.target;
      if (nav && target instanceof Node && nav.contains(target)) return;
      event.preventDefault();
    };

    document.addEventListener('touchmove', preventBackgroundScroll, { passive: false });

    return () => {
      html.classList.remove('drawer-lock');
      body.classList.remove('drawer-lock');
      body.style.top = '';
      document.removeEventListener('touchmove', preventBackgroundScroll);
      window.scrollTo(0, scrollY);
    };
  }, [drawerOpen]);

  return (
    <>
      <Topbar
        activeRoom={activeRoom}
        drawerOpen={drawerOpen}
        onGo={go}
        onToggleDrawer={toggleDrawer}
        onCloseDrawer={closeDrawer}
      />

      {activeRoom === 'reading' && SOFT_LETTERS_ENABLED ? (
        <SoftLettersPage onGo={go} />
      ) : (
        <MahoganyPages />
      )}
    </>
  );
}
