import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom Hook für Swipe-Gesten-Erkennung mit visuellem Feedback
 *
 * @param {Function} onSwipeRight - Callback für Swipe von links nach rechts
 * @param {Object} options - Konfigurationsoptionen
 * @param {number} options.threshold - Minimale Distanz in Pixeln für eine gültige Swipe-Geste (default: 100)
 * @param {number} options.restraint - Maximale vertikale Abweichung in Pixeln (default: 100)
 * @param {boolean} options.visualFeedback - Visuelles Feedback während Swipe (default: true)
 * @returns {Object} - containerRef zum Anbinden an das swipeable Element
 */
export const useSwipe = (onSwipeRight, options = {}) => {
  const {
    threshold = 100,
    restraint = 100,
    visualFeedback = true
  } = options;

  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentX = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e) => {
    // Nur starten wenn am linken Rand begonnen wird (erste 50px)
    if (e.touches[0].clientX > 50) return;

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;

    if (visualFeedback && containerRef.current) {
      // Entferne Transition für sofortige Reaktion
      containerRef.current.style.transition = 'none';
    }
  }, [visualFeedback]);

  const handleTouchMove = useCallback((e) => {
    if (touchStartX.current === 0) return;

    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);

    // Prüfe ob es eine horizontale Swipe ist
    if (deltaX > 10 && deltaY < restraint) {
      isSwiping.current = true;
    }

    // Nur nach rechts swipen erlauben und nur wenn es eine gültige Swipe ist
    if (isSwiping.current && deltaX > 0 && visualFeedback && containerRef.current) {
      currentX.current = deltaX;
      // Reduziere die Bewegung für ein natürlicheres Gefühl (Rubber-Band-Effekt)
      const dampedX = Math.min(deltaX * 0.8, window.innerWidth);
      containerRef.current.style.transform = `translateX(${dampedX}px)`;
    }
  }, [restraint, visualFeedback]);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === 0) return;

    const deltaX = currentX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);

    if (visualFeedback && containerRef.current) {
      // Füge Transition für smooth Animation hinzu
      containerRef.current.style.transition = 'transform 0.2s ease-out';
    }

    // Prüfe ob Schwelle erreicht wurde
    if (deltaX > threshold && deltaY < restraint && isSwiping.current) {
      // Swipe war erfolgreich
      if (visualFeedback && containerRef.current) {
        // Animiere komplett nach rechts raus
        containerRef.current.style.transform = `translateX(${window.innerWidth}px)`;
      }

      // Führe Callback nach kurzer Verzögerung aus (für Animation)
      setTimeout(() => {
        if (onSwipeRight) {
          onSwipeRight();
        }
        // Reset
        if (containerRef.current) {
          containerRef.current.style.transform = '';
          containerRef.current.style.transition = '';
        }
      }, visualFeedback ? 200 : 0);
    } else {
      // Swipe war nicht erfolgreich - zurück animieren
      if (visualFeedback && containerRef.current) {
        containerRef.current.style.transform = 'translateX(0)';

        // Reset nach Animation
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = '';
          }
        }, 200);
      }
    }

    // Reset Werte
    touchStartX.current = 0;
    touchStartY.current = 0;
    currentX.current = 0;
    isSwiping.current = false;
  }, [threshold, restraint, onSwipeRight, visualFeedback]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return containerRef;
};
