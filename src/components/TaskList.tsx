import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskItem } from './TaskItem';
import { Task, TaskStatus } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskListProps {
  tasks: Task[];
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder: (tasks: Task[]) => void;
}

export function TaskList({ tasks, onUpdateStatus, onEdit, onDelete, onReorder }: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      const newOrder = arrayMove(tasks, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center"
      >
        <p className="text-lg font-medium text-muted-foreground">No tasks yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first task to get started
        </p>
      </motion.div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdateStatus={onUpdateStatus}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}
