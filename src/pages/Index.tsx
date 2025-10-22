import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { startOfDay, endOfDay, addDays, isWithinInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Header } from '@/components/Header';
import { ViewSelector, ViewMode } from '@/components/ViewSelector';
import { TaskList } from '@/components/TaskList';
import { TaskDialog } from '@/components/TaskDialog';
import { ProgressCard } from '@/components/ProgressCard';
import { useTasks } from '@/hooks/use-tasks';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Task } from '@/lib/db';
import { exportData, importData } from '@/lib/db';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [view, setView] = useState<ViewMode>('today');
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const { tasks, addTask, updateTask, deleteTask, reorderTasks, updateTaskStatus } = useTasks();

  // Filter tasks based on view
  const filteredTasks = useMemo(() => {
    const now = new Date();
    
    switch (view) {
      case 'today':
        return tasks.filter((task) => {
          if (!task.dueDate) return true;
          const dueDate = new Date(task.dueDate);
          return isWithinInterval(dueDate, {
            start: startOfDay(now),
            end: endOfDay(now),
          });
        });
      
      case 'week':
        return tasks.filter((task) => {
          if (!task.dueDate) return true;
          const dueDate = new Date(task.dueDate);
          return isWithinInterval(dueDate, {
            start: startOfDay(now),
            end: endOfDay(addDays(now, 7)),
          });
        });
      
      case 'month':
        return tasks.filter((task) => {
          if (!task.dueDate) return true;
          const dueDate = new Date(task.dueDate);
          return isWithinInterval(dueDate, {
            start: startOfDay(now),
            end: endOfDay(addDays(now, 30)),
          });
        });
      
      case 'custom':
        if (!customRange?.from || !customRange?.to) return tasks;
        return tasks.filter((task) => {
          if (!task.dueDate) return true;
          const dueDate = new Date(task.dueDate);
          return isWithinInterval(dueDate, {
            start: startOfDay(customRange.from!),
            end: endOfDay(customRange.to!),
          });
        });
      
      default:
        return tasks;
    }
  }, [tasks, view, customRange]);

  const handleNewTask = () => {
    setEditingTask(undefined);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSaveTask = (data: Partial<Task>) => {
    if (editingTask) {
      updateTask({ id: editingTask.id, updates: data });
    } else {
      addTask(data as Omit<Task, 'id' | 'createdAt' | 'order'>);
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Export successful', description: 'Your data has been exported.' });
    } catch (error) {
      toast({ title: 'Export failed', description: 'Could not export data.', variant: 'destructive' });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await importData(text);
        window.location.reload(); // Reload to reflect imported data
      } catch (error) {
        toast({ title: 'Import failed', description: 'Invalid backup file.', variant: 'destructive' });
      }
    };
    input.click();
  };

  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onMarkDone: () => {
      const firstPending = filteredTasks.find((t) => t.status !== 'done');
      if (firstPending) updateTaskStatus(firstPending.id, 'done');
    },
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header onNewTask={handleNewTask} onExport={handleExport} onImport={handleImport} />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Progress Card */}
          <ProgressCard tasks={tasks} />

          {/* View Selector */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">My Tasks</h2>
              <p className="text-sm text-muted-foreground">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            <ViewSelector
              view={view}
              onViewChange={setView}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />
          </div>

          {/* Task List */}
          <TaskList
            tasks={filteredTasks}
            onUpdateStatus={updateTaskStatus}
            onEdit={handleEditTask}
            onDelete={deleteTask}
            onReorder={reorderTasks}
          />

          {/* Keyboard Shortcuts Help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-lg border bg-card/50 p-4 text-sm text-muted-foreground backdrop-blur"
          >
            <p className="font-medium">Keyboard Shortcuts:</p>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              <div>
                <kbd className="rounded bg-muted px-2 py-1 text-xs">Ctrl</kbd> +{' '}
                <kbd className="rounded bg-muted px-2 py-1 text-xs">Shift</kbd> +{' '}
                <kbd className="rounded bg-muted px-2 py-1 text-xs">T</kbd> = New task
              </div>
              <div>
                <kbd className="rounded bg-muted px-2 py-1 text-xs">Ctrl</kbd> +{' '}
                <kbd className="rounded bg-muted px-2 py-1 text-xs">D</kbd> = Mark as done
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default Index;
