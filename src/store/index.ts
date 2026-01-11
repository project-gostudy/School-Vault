import { create } from 'zustand';

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
  activity: string; // Renamed from description to match backend
  relatedAssignmentId?: string; // Link to source
}

interface AppState {
  // Data Sources
  assignments: Assignment[];
  tasks: Task[];
  todaysPlan: PlanBlock[];
  reasoning: string;
  
  // Perplexity / AI Reasoning State
  isPlanning: boolean;
  
  // Actions
  refreshData: () => Promise<void>;
  markTaskComplete: (taskId: string) => void;
  generatePlan: () => Promise<void>;
}

// --- Store Implementation ---

const API_BASE = 'http://localhost:3000';

export const useStore = create<AppState>((set, get) => ({
  assignments: [],
  tasks: [],
  todaysPlan: [],
  reasoning: '',
  isPlanning: false,

  refreshData: async () => {
    try {
        const [assignRes, planRes] = await Promise.all([
            fetch(`${API_BASE}/assignments`),
            fetch(`${API_BASE}/plan/today`)
        ]);
        
        const assignments = await assignRes.json();
        const plan = await planRes.json();
        
        set({ 
            assignments, 
            todaysPlan: plan?.blocks || [],
            reasoning: plan?.reasoning || '',
            // Extract tasks from plan blocks for the Today view
            tasks: (plan?.blocks || [])
                .filter((b: any) => b.type === 'focus')
                .map((b: any) => ({
                    id: b.id, // Use block id as task id
                    title: b.activity,
                    isCompleted: assignments.find((a: any) => a.id === b.relatedAssignmentId)?.status === 'completed',
                    assignmentId: b.relatedAssignmentId
                }))
        });
    } catch (err) {
        console.error('Failed to refresh data:', err);
    }
  },

  generatePlan: async () => {
    set({ isPlanning: true });
    try {
        const res = await fetch(`${API_BASE}/plan/generate`, { method: 'POST' });
        const data = await res.json();
        
        if (data.success) {
            await get().refreshData();
        }
    } catch (err) {
        console.error('Plan generation failed:', err);
    } finally {
        set({ isPlanning: false });
    }
  },

  markTaskComplete: async (taskId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task?.assignmentId) return;

    try {
        await fetch(`${API_BASE}/assignments/${task.assignmentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' })
        });
        
        await get().refreshData();
    } catch (err) {
        console.error('Failed to mark task complete:', err);
    }
  }
}));
