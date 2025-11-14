import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check, Clock, Circle, Trash2, Edit2, ChevronDown, Tag, AlertCircle } from 'lucide-react';
import { Task, TaskStatus } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

const priorityConfig = {
  low: { label: 'Low', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  medium: { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  high: { label: 'High', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
};

export function TaskItem({ task, onUpdateStatus, onEdit, onDelete }: TaskItemProps) {
  const [isOpen, setIsOpen] = useState(false);
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
  const hasExpandableContent = task.description || task.notes || (task.tags && task.tags.length > 0);

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
          <div className="flex items-start gap-2">
            <h3
              className={cn(
                'font-medium transition-all flex-1',
                task.status === 'done' && 'text-muted-foreground line-through'
              )}
            >
              {task.title}
            </h3>
            {hasExpandableContent && (
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-180"
                    )} />
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            )}
          </div>

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
            
            {task.priority && (
              <Badge variant="secondary" className={cn('text-xs', priorityConfig[task.priority].color)}>
                <AlertCircle className="mr-1 h-3 w-3" />
                {priorityConfig[task.priority].label}
              </Badge>
            )}
            
            {task.dueDate && (
              <span className="text-xs text-muted-foreground">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {hasExpandableContent && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleContent className="mt-3 space-y-3">
                {task.description && (
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
                  </div>
                )}
                
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {task.notes && (
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.notes}</p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
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
