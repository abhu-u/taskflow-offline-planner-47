import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllTasks,
  addTask,
  updateTask,
  deleteTask,
  reorderTasks,
  Task,
  TaskStatus,
} from '@/lib/db';
import { toast } from '@/hooks/use-toast';

export function useTasks() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: getAllTasks,
  });

  const addTaskMutation = useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task created', description: 'Your task has been added successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create task.', variant: 'destructive' });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update task.', variant: 'destructive' });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task deleted', description: 'Your task has been removed.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete task.', variant: 'destructive' });
    },
  });

  const reorderTasksMutation = useMutation({
    mutationFn: reorderTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    updateTaskMutation.mutate({ id, updates: { status } });
  };

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    addTask: addTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    reorderTasks: reorderTasksMutation.mutate,
    updateTaskStatus,
  };
}
