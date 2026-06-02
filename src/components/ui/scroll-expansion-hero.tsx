import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  logoSrc?: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function ScrollExpandMedia({
  mediaType = 'image',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  logoSrc,
  title,
  date,
  scrollToExpand,
  textBlend = false,
  className,
  children,
}: ScrollExpandMediaProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isMobileState, setIsMobileState] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const expandedRef = useRef(false);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    expandedRef.current = mediaFullyExpanded;
  }, [mediaFullyExpanded]);

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType, mediaSrc]);

  useEffect(() => {
    function syncResponsiveState() {
      setIsMobileState(window.innerWidth < 768);
    }

    syncResponsiveState();
    window.addEventListener('resize', syncResponsiveState);
    return () => window.removeEventListener('resize', syncResponsiveState);
  }, []);

  useEffect(() => {
    function commitProgress(nextProgress: number) {
      const next = Math.min(Math.max(nextProgress, 0), 1);
      progressRef.current = next;
      setScrollProgress(next);

      if (next >= 1) {
        expandedRef.current = true;
        setMediaFullyExpanded(true);
        setShowContent(true);
      } else if (next < 0.74) {
        expandedRef.current = false;
        setMediaFullyExpanded(false);
        setShowContent(false);
      }
    }

    function shouldControlScroll() {
      const rect = sectionRef.current?.getBoundingClientRect();
      return rect ? rect.top <= 8 && rect.bottom > window.innerHeight * 0.7 : false;
    }

    function handleWheel(event: globalThis.WheelEvent) {
      if (!shouldControlScroll()) {
        return;
      }

      if (expandedRef.current && event.deltaY < 0 && window.scrollY <= 12) {
        event.preventDefault();
        commitProgress(progressRef.current + event.deltaY * 0.001);
        return;
      }

      if (!expandedRef.current) {
        event.preventDefault();
        commitProgress(progressRef.current + event.deltaY * 0.0009);
      }
    }

    function handleTouchStart(event: globalThis.TouchEvent) {
      setTouchStartY(event.touches[0]?.clientY ?? 0);
    }

    function handleTouchMove(event: globalThis.TouchEvent) {
      if (!touchStartY || !shouldControlScroll()) {
        return;
      }

      const touchY = event.touches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - touchY;

      if (!expandedRef.current || (expandedRef.current && deltaY < -20 && window.scrollY <= 12)) {
        event.preventDefault();
        const scrollFactor = deltaY < 0 ? 0.007 : 0.0045;
        commitProgress(progressRef.current + deltaY * scrollFactor);
        setTouchStartY(touchY);
      }
    }

    function handleTouchEnd() {
      setTouchStartY(0);
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStartY]);

  const mediaWidth = 320 + scrollProgress * (isMobileState ? 620 : 1000);
  const mediaHeight = 390 + scrollProgress * (isMobileState ? 190 : 340);
  const textTranslateX = scrollProgress * (isMobileState ? 86 : 62);
  const overlayOpacity = 0.58 - scrollProgress * 0.24;
  const [firstWord = '', ...restWords] = title?.split(' ') ?? [];

  return (
    <div ref={sectionRef} className={cn('scroll-expansion-hero', className)}>
      <section className="scroll-hero-stage" aria-labelledby="hero-title">
        <motion.div
          className="scroll-hero-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 - scrollProgress * 0.42 }}
          transition={{ duration: 0.15 }}
        >
          <img src={bgImageSrc} alt="" aria-hidden="true" />
          <div />
        </motion.div>

        <div className="scroll-hero-brand">
          {date && <span>{date}</span>}
          {scrollToExpand && <span>{scrollToExpand}</span>}
        </div>

        <div
          className={cn('scroll-hero-title', textBlend && 'scroll-hero-title-blend')}
          aria-hidden="true"
        >
          <motion.span style={{ transform: `translateX(-${textTranslateX}vw)` }}>
            {firstWord}
          </motion.span>
          <motion.span style={{ transform: `translateX(${textTranslateX}vw)` }}>
            {restWords.join(' ')}
          </motion.span>
        </div>

        <div
          className="scroll-hero-cloche"
          style={{
            width: `${mediaWidth}px`,
            height: `${mediaHeight}px`,
            maxWidth: '95vw',
            maxHeight: '82vh',
          }}
        >
          {logoSrc && (
            <div className="scroll-hero-handle" aria-hidden="true">
              <img src={logoSrc} alt="" />
            </div>
          )}
          <div className="scroll-hero-media">
            {mediaType === 'video' ? (
              <video
                src={mediaSrc}
                poster={posterSrc}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            ) : (
              <img src={mediaSrc} alt={title || 'ReCater hero media'} />
            )}
            <motion.div
              className="scroll-hero-media-shade"
              initial={{ opacity: 0.58 }}
              animate={{ opacity: overlayOpacity }}
              transition={{ duration: 0.15 }}
            />
          </div>
        </div>

        <motion.div
          className="scroll-hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 24 }}
          transition={{ duration: 0.55 }}
        >
          {children}
        </motion.div>
      </section>
    </div>
  );
}
