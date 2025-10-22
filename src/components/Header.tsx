import { motion } from 'framer-motion';
import { Moon, Sun, Plus, Download, Upload, WifiOff, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

interface HeaderProps {
  onNewTask: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function Header({ onNewTask, onExport, onImport }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-white"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">TaskFlow</h1>
            <p className="text-xs text-muted-foreground">Offline Task Planner</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Badge variant={isOnline ? 'secondary' : 'outline'} className="gap-1 px-2">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>

          <Button variant="ghost" size="icon" onClick={onExport} title="Export data">
            <Download className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onImport} title="Import data">
            <Upload className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button onClick={onNewTask} className="gap-2 shadow-md">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
