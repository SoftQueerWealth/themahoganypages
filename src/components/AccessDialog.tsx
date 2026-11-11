import { useEffect, type ReactNode } from 'react';

type AccessDialogProps = {
  title: string;
  titleId: string;
  onClose: () => void;
  children?: ReactNode;
};

export function AccessDialog({ title, titleId, onClose, children }: AccessDialogProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="guide-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="guide-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" className="guide-modal-close" aria-label="Close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1F18" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h3 id={titleId}>{title}</h3>
        {children ? <div className="guide-modal-body">{children}</div> : null}
      </div>
    </div>
  );
}

export function AccessMark() {
  return (
    <span className="guide-access-mark" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2" fill="#fff" stroke="none" />
        <path d="M12 9v6h6l3 6" />
        <path d="M12 12h5" />
        <path d="M8.5 14a6 6 0 1 0 9.5 6.5" />
      </svg>
    </span>
  );
}
