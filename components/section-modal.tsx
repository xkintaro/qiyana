'use client';

import { useEffect, useRef } from 'react';

export default function SectionModal({ kind, title, onClose, children }: {
  kind: string; title: string; onClose: () => void; children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={dialog} className={`section-modal modal-${kind}`} aria-labelledby="modal-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }}><div className="modal-topbar"><span id="modal-title">{title}</span><button className="modal-close" onClick={onClose} aria-label="Close panel" autoFocus>✕</button></div>{children}</dialog>;
}
