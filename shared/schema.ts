import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("cro_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const traffic = pgTable("traffic", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contactNumber: text("contact_number").notNull(),
  email: text("email").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  assignedBy: varchar("assigned_by").references(() => users.id),
  profession: text("profession"),
  jobType: text("job_type"),
  dateOfBirth: text("date_of_birth"),
  maritalStatus: text("marital_status"),
  gender: text("gender"),
  permanentCountry: text("permanent_country"),
  permanentCity: text("permanent_city"),
  presentCountry: text("present_country"),
  presentCity: text("present_city"),
  height: text("height"),
  qualification: text("qualification"),
  organization: text("organization"),
  religion: text("religion"),
  socialTitle: text("social_title"),
  profilePicture: text("profile_picture"),
  candidatePictures: jsonb("candidate_pictures").$type<string[]>(),
  curriculumVitae: text("curriculum_vitae"),
  requirements: text("requirements"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trafficId: varchar("traffic_id").references(() => traffic.id),
  packageType: text("package_type").notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  dueAmount: decimal("due_amount", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  afterMarriageFee: decimal("after_marriage_fee", { precision: 10, scale: 2 }),
  invoiceGenerated: boolean("invoice_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
}).extend({
  role: z.enum(["cro_agent", "matchmaker", "super_admin"]).default("cro_agent"),
});

export const insertTrafficSchema = createInsertSchema(traffic)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    candidatePictures: z.array(z.string()).default([]),
  });

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTraffic = z.infer<typeof insertTrafficSchema>;
export type Traffic = typeof traffic.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
