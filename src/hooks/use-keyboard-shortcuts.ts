import { useEffect } from 'react';

export function useKeyboardShortcuts(handlers: {
  onNewTask?: () => void;
  onMarkDone?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + T: New task
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        handlers.onNewTask?.();
      }

      // Ctrl/Cmd + D: Mark as done
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handlers.onMarkDone?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
