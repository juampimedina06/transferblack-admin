import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Compartido por toda la feature de empresas (alta, edicion de tope, resumenes):
// diálogo accesible con foco atrapado y cierre con Escape/click afuera.
export function Modal({
  title,
  children,
  onClose,
  dismissible = true,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  dismissible?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) onCloseRef.current();
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [dismissible]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => dismissible && event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-modal-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl outline-none dark:border-white/10 dark:bg-obsidian"
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white p-5 dark:border-white/10 dark:bg-obsidian">
          <h2 id="company-modal-title" className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <X size={19} />
            </button>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
