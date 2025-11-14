import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type TaskStatus = 'pending' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  notes?: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  order: number;
}

interface TaskFlowDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-status': TaskStatus; 'by-date': string; 'by-order': number };
  };
  settings: {
    key: string;
    value: any;
  };
}

let dbInstance: IDBPDatabase<TaskFlowDB> | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<TaskFlowDB>('taskflow-db', 2, {
    upgrade(db, oldVersion) {
      // Create tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-status', 'status');
        taskStore.createIndex('by-date', 'dueDate');
        taskStore.createIndex('by-order', 'order');
      }

      // Create settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

// Task CRUD operations
export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  const tasks = await db.getAll('tasks');
  return tasks.sort((a, b) => a.order - b.order);
}

export async function getTask(id: string): Promise<Task | undefined> {
  const db = await getDB();
  return db.get('tasks', id);
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'order'>): Promise<Task> {
  const db = await getDB();
  const allTasks = await getAllTasks();
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    order: allTasks.length,
  };
  await db.add('tasks', newTask);
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
  const db = await getDB();
  const task = await db.get('tasks', id);
  if (!task) return undefined;
  
  const updatedTask = { ...task, ...updates };
  if (updates.status === 'done' && !task.completedAt) {
    updatedTask.completedAt = new Date().toISOString();
  }
  
  await db.put('tasks', updatedTask);
  return updatedTask;
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

export async function reorderTasks(tasks: Task[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  
  await Promise.all(
    tasks.map((task, index) => 
      tx.store.put({ ...task, order: index })
    )
  );
  
  await tx.done;
}

// Settings operations
export async function getSetting(key: string): Promise<any> {
  const db = await getDB();
  const result = await db.get('settings', key);
  return result?.value;
}

export async function setSetting(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value });
}

// Export/Import
export async function exportData(): Promise<string> {
  const db = await getDB();
  const tasks = await db.getAll('tasks');
  const settingsKeys = await db.getAllKeys('settings');
  const settings: Record<string, any> = {};
  
  for (const key of settingsKeys) {
    const setting = await db.get('settings', key);
    if (setting) settings[key] = setting.value;
  }
  
  return JSON.stringify({ tasks, settings, version: 1 }, null, 2);
}

export async function importData(jsonString: string): Promise<void> {
  try {
    const data = JSON.parse(jsonString);
    const db = await getDB();
    
    // Clear existing data
    await db.clear('tasks');
    await db.clear('settings');
    
    // Import tasks
    if (data.tasks && Array.isArray(data.tasks)) {
      const tx = db.transaction('tasks', 'readwrite');
      await Promise.all(data.tasks.map((task: Task) => tx.store.add(task)));
      await tx.done;
    }
    
    // Import settings
    if (data.settings) {
      const tx = db.transaction('settings', 'readwrite');
      await Promise.all(
        Object.entries(data.settings).map(([key, value]) => 
          tx.store.add({ key, value })
        )
      );
      await tx.done;
    }
  } catch (error) {
    throw new Error('Invalid backup file format');
  }
}
