import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';

interface DocumentImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  title: string;
  onClose: () => void;
  onImageError?: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

export const DocumentImageModal: React.FC<DocumentImageModalProps> = ({
  isOpen,
  imageUrl,
  title,
  onClose,
  onImageError,
}) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!isOpen) return;

    setZoom(1);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(2))));
  const handleResetZoom = () => setZoom(1);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={`Vista previa de ${title}`}
      onClick={onClose}
    >
      {/* Top Toolbar */}
      <div
        className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-obsidian/90 border-b border-white/10 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold truncate">{title}</h3>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-gold"
            aria-label="Alejar imagen"
            title="Alejar"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-medium text-gray-300 w-12 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-gold"
            aria-label="Acercar imagen"
            title="Acercar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            disabled={zoom === 1}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-gold"
            aria-label="Restablecer zoom"
            title="Restablecer zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-gold"
            aria-label="Abrir imagen en una pestaña nueva"
            title="Abrir en pestaña nueva"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="w-px h-5 bg-white/15 mx-1" />

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-gold"
            aria-label="Cerrar vista previa"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Viewport */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
        <img
          src={imageUrl}
          alt={title}
          onClick={(e) => e.stopPropagation()}
          onError={onImageError}
          style={{ transform: `scale(${zoom})` }}
          className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl transition-transform duration-150 select-none bg-obsidian"
        />
      </div>
    </div>,
    document.body,
  );
};
