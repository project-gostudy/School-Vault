import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// --- assignments: Source of Truth (from Axios) ---
export const assignments = sqliteTable('assignments', {
  id: text('id').primaryKey(), // Internal UUID
  externalId: text('external_id').unique(), // ID from Axios Famiglia
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  description: text('description'),
  dueDate: text('due_date').notNull(), // ISO string
  status: text('status').notNull().default('pending'), // pending | completed
  rawHash: text('raw_hash').notNull(), // For change detection
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// --- schedules: AI Generated Plans ---
export const schedules = sqliteTable('schedules', {
  id: text('id').primaryKey(),
  date: text('date').notNull(), // YYYY-MM-DD target
  content: text('content').notNull(), // JSON blob of the AI plan
  reasoning: text('reasoning'), // Metadata about why this plan was chosen
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// --- sync_state: Mapping to Asana ---
export const syncState = sqliteTable('sync_state', {
  id: text('id').primaryKey(),
  assignmentId: text('assignment_id').references(() => assignments.id),
  asanaGid: text('asana_gid'), // Global ID from Asana
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }).notNull(),
  syncStatus: text('sync_status').notNull().default('synced'), // synced | failed | pending
});
