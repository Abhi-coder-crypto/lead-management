import { pgTable, serial, varchar, text, timestamp, boolean, json, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Drizzle PostgreSQL Schema Definitions
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  source: varchar('source', { length: 50 }).notNull().$type<'Website' | 'Referral' | 'Ad' | 'Other'>(),
  status: varchar('status', { length: 50 }).notNull().default('New').$type<'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost'>(),
  tags: text('tags').array().default([]),
  statusHistory: json('status_history').$type<Array<{
    status: string;
    changedAt: Date;
    changedBy?: number;
  }>>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: integer('user_id').notNull().references(() => users.id),
});

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  leadId: integer('lead_id').notNull().references(() => leads.id),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  action: varchar('action', { length: 50 }).notNull().$type<'created' | 'updated' | 'status_changed' | 'note_added'>(),
  description: text('description').notNull(),
  leadId: integer('lead_id').references(() => leads.id),
  userId: integer('user_id').notNull().references(() => users.id),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reminders = pgTable('reminders', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  dueDate: timestamp('due_date').notNull(),
  completed: boolean('completed').default(false).notNull(),
  leadId: integer('lead_id').notNull().references(() => leads.id),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Drizzle Relations
export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads),
  notes: many(notes),
  activities: many(activities),
  reminders: many(reminders),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  user: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
  notes: many(notes),
  activities: many(activities),
  reminders: many(reminders),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  lead: one(leads, {
    fields: [notes.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  lead: one(leads, {
    fields: [activities.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  lead: one(leads, {
    fields: [reminders.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [reminders.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

// Interface aliases for compatibility
export type IUser = User;
export type ILead = Lead;
export type INote = Note;
export type IActivity = Activity;
export type IReminder = Reminder;

// Zod validation schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userId: z.number(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
}).extend({
  leadId: z.number(),
  userId: z.number(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
}).extend({
  leadId: z.number().optional(),
  userId: z.number(),
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
}).extend({
  leadId: z.number(),
  userId: z.number(),
  dueDate: z.date(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginData = z.infer<typeof loginSchema>;

export type LeadWithNotes = Lead & {
  notes: Note[];
  activities: Activity[];
  reminders: Reminder[];
};