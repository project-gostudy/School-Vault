import { z } from 'zod';

// --- Domain Schemas ---

export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  title: z.string(),
  subject: z.string(),
  dueDate: z.string().datetime(), // ISO
  description: z.string().optional(),
  status: z.enum(['pending', 'completed']),
});

export type Assignment = z.infer<typeof AssignmentSchema>;

export const ScheduleBlockSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  activity: z.string(), // "Math Homework", "Break", "Project"
  type: z.enum(['focus', 'break', 'free']),
  relatedAssignmentId: z.string().optional(),
});

export const DailyPlanSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  blocks: z.array(ScheduleBlockSchema),
  reasoning: z.string(),
});

export type DailyPlan = z.infer<typeof DailyPlanSchema>;

// --- Service Interfaces ---

export interface IngestionService {
  fetchAssignments(): Promise<Assignment[]>;
}

export interface PlannerService {
  generatePlan(assignments: Assignment[], constraints: any): Promise<DailyPlan>;
}

export interface SyncService {
  syncPlan(plan: DailyPlan): Promise<void>;
}
