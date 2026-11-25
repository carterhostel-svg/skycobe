import React, { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { favoriteGlassPipeline } from '../lib/liquidVaporGlass.js';

interface VaporFavoriteButtonProps {
  isSaved: boolean;
  onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  size?: 'md' | 'lg';
  tone?: 'overlay' | 'surface';
  backgroundImageRef?: React.RefObject<HTMLImageElement | null>;
}

export const VaporFavoriteButton: React.FC<VaporFavoriteButtonProps> = ({
  isSaved,
  onToggle,
  ariaLabel = 'Save hostel',
  size = 'md',
  tone = 'overlay',
  backgroundImageRef,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isSavedRef = useRef(isSaved);
  const toneRef = useRef(tone);
  const bgImgRefProp = useRef(backgroundImageRef);
  const isHoveredRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const clickStartRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  const [pulseKey, setPulseKey] = useState(0);

  isSavedRef.current = isSaved;
  toneRef.current = tone;
  bgImgRefProp.current = backgroundImageRef;

  useEffect(() => {
    const btn = buttonRef.current;
    const canvas = canvasRef.current;
    if (!btn || !canvas) return;

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          isVisibleRef.current = entries[0]?.isIntersecting ?? true;
        },
        { rootMargin: '120px' }
      );
      observer.observe(btn);
    }

    const regId = favoriteGlassPipeline.register({
      displayCanvas: canvas,
      getSourceImage: () => bgImgRefProp.current?.current ?? null,
      getThemeMode: () =>
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
      getTone: () => toneRef.current,
      getButtonElement: () => buttonRef.current,
      isSaved: () => isSavedRef.current,
      isHovered: () => isHoveredRef.current,
      getPointer: () => pointerRef.current,
      getClickPulse: () => {
        if (clickStartRef.current === null) return 0;
        const elapsed = (performance.now() - clickStartRef.current) / 650;
        if (elapsed >= 1) {
          clickStartRef.current = null;
          return 0;
        }
        return elapsed;
      },
      isVisible: () => isVisibleRef.current,
    });

    return () => {
      if (regId >= 0) {
        favoriteGlassPipeline.unregister(regId);
      }
      observer?.disconnect();
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    clickStartRef.current = performance.now();
    setPulseKey((k) => k + 1);
    onToggle(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointerRef.current = { x: nx, y: ny };
  };

  const dims = size === 'lg' ? 'w-12 h-12' : 'w-11 h-11';

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onPointerEnter={() => {
        isHoveredRef.current = true;
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        isHoveredRef.current = false;
        pointerRef.current = { x: 0, y: 0 };
      }}
      aria-label={ariaLabel}
      aria-pressed={isSaved}
      className={`vapor-glass-btn ${dims} rounded-full flex items-center justify-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80`}
    >
      {/* Real-time Three.js WebGL refracting transparent Vapor/Liquid Glass canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full rounded-full"
      />

      {/* Crisp Heart icon over refracted clear crystal lens */}
      <Heart
        key={`heart-${pulseKey}-${isSaved}`}
        size={size === 'lg' ? 20 : 19}
        strokeWidth={2.2}
        className={`relative z-10 transition-colors duration-200 ${
          tone === 'overlay' ? 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]' : ''
        } ${pulseKey > 0 ? 'vapor-heart-animate' : ''} ${
          isSaved
            ? 'fill-rose-500 text-rose-500'
            : tone === 'overlay'
              ? 'text-white'
              : 'text-[#111315]'
        }`}
      />
    </button>
  );
};
