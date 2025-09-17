import { users, traffic, payments, type User, type InsertUser, type Traffic, type InsertTraffic, type Payment, type InsertPayment } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { Store } from "express-session";
import { pool } from "./db";
import { hashPassword, isValidHashFormat, generateStrongPassword } from "./security";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Traffic methods
  getAllTraffic(): Promise<Traffic[]>;
  getTrafficById(id: string): Promise<Traffic | undefined>;
  createTraffic(traffic: InsertTraffic): Promise<Traffic>;
  updateTraffic(id: string, traffic: Partial<InsertTraffic>): Promise<Traffic>;
  deleteTraffic(id: string): Promise<void>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByTrafficId(trafficId: string): Promise<Payment | undefined>;
  
  // Statistics
  getTrafficCount(): Promise<number>;
  getPaidClientsCount(): Promise<number>;
  getTotalPayments(): Promise<number>;
  
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllTraffic(): Promise<Traffic[]> {
    return await db.select().from(traffic).orderBy(desc(traffic.createdAt));
  }

  async getTrafficById(id: string): Promise<Traffic | undefined> {
    const [trafficRecord] = await db.select().from(traffic).where(eq(traffic.id, id));
    return trafficRecord || undefined;
  }

  async createTraffic(trafficData: InsertTraffic): Promise<Traffic> {
    const candidatePictures = Array.isArray(trafficData.candidatePictures)
      ? [...trafficData.candidatePictures].filter((x): x is string => typeof x === 'string')
      : [];

    const payload: typeof traffic.$inferInsert = {
      ...trafficData,
      candidatePictures,
    };

    const [trafficRecord] = await db
      .insert(traffic)
      .values([payload])
      .returning();
    return trafficRecord;
  }

  async updateTraffic(id: string, trafficData: Partial<InsertTraffic>): Promise<Traffic> {
    const [trafficRecord] = await db
      .update(traffic)
      .set(trafficData as any)
      .where(eq(traffic.id, id))
      .returning();
    return trafficRecord;
  }

  async deleteTraffic(id: string): Promise<void> {
    await db.delete(traffic).where(eq(traffic.id, id));
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values([paymentData])
      .returning();
    return payment;
  }

  async getPaymentByTrafficId(trafficId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.trafficId, trafficId));
    return payment || undefined;
  }

  async getTrafficCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(traffic);
    return result.count;
  }

  async getPaidClientsCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(payments);
    return result.count;
  }

  async getTotalPayments(): Promise<number> {
    const result = await db.select().from(payments);
    return result.reduce((total, payment) => total + Number(payment.paidAmount), 0);
  }

  async ensureDefaultAdmin(): Promise<void> {
    const existingAdmin = await this.getUserByUsername("admin");
    
    if (!existingAdmin) {
      // Create new admin user
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminPassword) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error("ADMIN_PASSWORD environment variable is required in production");
        }
        
        // Development: generate strong random password
        const devPassword = generateStrongPassword();
        console.warn("⚠️  ADMIN_PASSWORD not set in development. Generated strong password:");
        console.log(`🔑 Admin username: admin`);
        console.log(`🔑 Generated password: ${devPassword}`);
        console.log("🔒 Save this password! Set ADMIN_PASSWORD env var to use a custom password.");
        
        await this.createUser({
          username: "admin",
          password: await hashPassword(devPassword),
          role: "super_admin"
        });
      } else {
        await this.createUser({
          username: "admin",
          password: await hashPassword(adminPassword),
          role: "super_admin"
        });
        console.log("✅ Admin user created with environment password");
      }
    } else if (existingAdmin && !isValidHashFormat(existingAdmin.password)) {
      // Fix existing admin user with invalid/unhashed password
      console.warn(`⚠️  Detected invalid password format for admin user. Rehashing for security.`);
      const hashedPassword = await hashPassword(existingAdmin.password);
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, existingAdmin.id));
      console.log("✅ Admin password has been properly hashed.");
    }
  }
}

export const storage = new DatabaseStorage();
