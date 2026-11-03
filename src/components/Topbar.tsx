import type { RoomId } from '../data/rooms';
import { ROOMS } from '../data/rooms';

type TopbarProps = {
  activeRoom: RoomId;
  drawerOpen: boolean;
  onGo: (room: RoomId) => void;
  onToggleDrawer: () => void;
  onCloseDrawer: () => void;
};

export function Topbar({
  activeRoom,
  drawerOpen,
  onGo,
  onToggleDrawer,
  onCloseDrawer,
}: TopbarProps) {
  return (
    <>
      <header className={`topbar${drawerOpen ? ' drawer-open' : ''}`}>
        <div className="topbar-inner">
          <button type="button" className="brand" onClick={() => onGo('neighborhood')}>
            <img className="logo-icon" src="/sqw-mark.png" alt="" width={107} height={56} />
            <div className="brand-text">
              <div className="name">Soft Queer Wealth</div>
              <div className="tag">Care · Culture · Community</div>
            </div>
          </button>

          <nav
            className={`rooms${drawerOpen ? ' open' : ''}`}
            id="navrooms"
            aria-label="Site rooms"
          >
            <div className="drawer-header">
              <span className="drawer-header-title">Menu</span>
              <button
                type="button"
                className="drawer-close-btn"
                aria-label="Close menu"
                onClick={onCloseDrawer}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2A1F18"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            </div>
            {ROOMS.map((room) => (
              <button
                key={room.id}
                type="button"
                data-room={room.id}
                className={activeRoom === room.id ? 'active' : undefined}
                onClick={() => onGo(room.id)}
              >
                <span>{room.label}</span>
                {room.id === 'wellness' ? <span className="room-new">NEW</span> : null}
              </button>
            ))}
          </nav>

          <div className="topbar-actions">
            <button
              type="button"
              className="menu-toggle"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="navrooms"
              onClick={onToggleDrawer}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <button
        type="button"
        className={`drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={onCloseDrawer}
        aria-label="Close menu"
        aria-hidden={!drawerOpen}
        tabIndex={drawerOpen ? 0 : -1}
      />
    </>
  );
}
