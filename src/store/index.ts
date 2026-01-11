import { create } from 'zustand';
import { addMinutes, startOfToday } from 'date-fns';

// --- Type Definitions ---

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: Date;
  status: 'pending' | 'completed';
}

export interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  scheduledTime?: string; // ISO string
  isCompleted: boolean;
  assignmentId?: string; // Link to source
}

export interface PlanBlock {
  id: string;
  type: 'focus' | 'break' | 'free';
  startTime: string; // ISO
  endTime: string; // ISO
  description: string;
  taskId?: string;
}

interface AppState {
  // Data Sources
  assignments: Assignment[];
  tasks: Task[];
  todaysPlan: PlanBlock[];
  
  // Perplexity / AI Reasoning State
  isPlanning: boolean;
  
  // Actions
  refreshData: () => Promise<void>;
  markTaskComplete: (taskId: string) => void;
  generatePlan: () => Promise<void>;
}

// --- Mock Data ---

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', title: 'Calculus Ch. 4 Review', subject: 'Math', dueDate: new Date(), status: 'pending' },
  { id: 'a2', title: 'Read "The Stranger"', subject: 'Literature', dueDate: new Date(), status: 'pending' },
  { id: 'a3', title: 'Physics Lab Report', subject: 'Science', dueDate: addMinutes(new Date(), 24 * 60), status: 'pending' },
];

// --- Store Implementation ---

export const useStore = create<AppState>((set) => ({
  assignments: [],
  tasks: [],
  todaysPlan: [],
  isPlanning: false,

  refreshData: async () => {
    // Simulate API fetch delay
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ assignments: MOCK_ASSIGNMENTS });
  },

  generatePlan: async () => {
    set({ isPlanning: true });
    // Simulate Perplexity reasoning
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock Reasoning: "Schedule Math first because it's hardest, then Lit."
    const today = startOfToday();
    const startWork = addMinutes(today, 16 * 60); // 4:00 PM
    
    const tasks: Task[] = [
      { id: 't1', title: 'Calculus Ch. 4 Review', durationMinutes: 45, assignmentId: 'a1', isCompleted: false, scheduledTime: startWork.toISOString() },
      { id: 't2', title: 'Read "The Stranger"', durationMinutes: 30, assignmentId: 'a2', isCompleted: false, scheduledTime: addMinutes(startWork, 60).toISOString() }, // Break in between
    ];

    const plan: PlanBlock[] = [
      { id: 'p1', type: 'focus', startTime: startWork.toISOString(), endTime: addMinutes(startWork, 45).toISOString(), description: 'Deep Focus', taskId: 't1' },
      { id: 'p2', type: 'break', startTime: addMinutes(startWork, 45).toISOString(), endTime: addMinutes(startWork, 60).toISOString(), description: 'Recharge' },
      { id: 'p3', type: 'focus', startTime: addMinutes(startWork, 60).toISOString(), endTime: addMinutes(startWork, 90).toISOString(), description: 'Reading', taskId: 't2' },
      { id: 'p4', type: 'free', startTime: addMinutes(startWork, 90).toISOString(), endTime: addMinutes(startWork, 300).toISOString(), description: 'Free Evening' },
    ];
    
    set({ tasks, todaysPlan: plan, isPlanning: false });
  },

  markTaskComplete: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, isCompleted: true } : t)
    }));
  }
}));
