import { motion } from 'framer-motion';
import { TrendingUp, Target, Flame } from 'lucide-react';
import { Task } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressCardProps {
  tasks: Task[];
}

export function ProgressCard({ tasks }: ProgressCardProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate streak (simplified - counts consecutive days with completed tasks)
  const streak = calculateStreak(tasks);

  return (
    <Card className="overflow-hidden bg-gradient-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion Rate</span>
            <span className="font-semibold">{completionRate.toFixed(0)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="rounded-lg bg-status-done/10 p-3 text-center"
          >
            <div className="text-2xl font-bold text-status-done">{completedTasks}</div>
            <div className="text-xs text-muted-foreground">Done</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="rounded-lg bg-status-progress/10 p-3 text-center"
          >
            <div className="text-2xl font-bold text-status-progress">{inProgressTasks}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="rounded-lg bg-primary/10 p-3 text-center"
          >
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
              {streak}
              <Flame className="h-5 w-5" />
            </div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateStreak(tasks: Task[]): number {
  const completedTasks = tasks
    .filter((t) => t.status === 'done' && t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  if (completedTasks.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const task of completedTasks) {
    const completedDate = new Date(task.completedAt!);
    completedDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (currentDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
}
