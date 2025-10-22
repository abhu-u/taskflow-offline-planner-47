import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check, Clock, Circle, Trash2, Edit2 } from 'lucide-react';
import { Task, TaskStatus } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TaskItemProps {
  task: Task;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  pending: { icon: Circle, label: 'Pending', color: 'status-pending' },
  'in-progress': { icon: Clock, label: 'In Progress', color: 'status-progress' },
  done: { icon: Check, label: 'Done', color: 'status-done' },
};

export function TaskItem({ task, onUpdateStatus, onEdit, onDelete }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const StatusIcon = statusConfig[task.status].icon;

  const cycleStatus = () => {
    const statusOrder: TaskStatus[] = ['pending', 'in-progress', 'done'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onUpdateStatus(task.id, nextStatus);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        'group relative rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Status Button */}
        <button
          onClick={cycleStatus}
          className={cn(
            'mt-0.5 flex-shrink-0 rounded-full p-1 transition-colors',
            task.status === 'done' && 'bg-status-done text-status-done-foreground',
            task.status === 'in-progress' && 'bg-status-progress text-status-progress-foreground',
            task.status === 'pending' && 'border-2 border-muted-foreground text-muted-foreground'
          )}
        >
          <StatusIcon className="h-4 w-4" />
        </button>

        {/* Task Content */}
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'font-medium transition-all',
              task.status === 'done' && 'text-muted-foreground line-through'
            )}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                'text-xs',
                task.status === 'done' && 'bg-status-done/10 text-status-done',
                task.status === 'in-progress' && 'bg-status-progress/10 text-status-progress',
                task.status === 'pending' && 'bg-status-pending/10 text-status-pending'
              )}
            >
              {statusConfig[task.status].label}
            </Badge>
            {task.dueDate && (
              <span className="text-xs text-muted-foreground">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(task)}
            className="h-8 w-8"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
