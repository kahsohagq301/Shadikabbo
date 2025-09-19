import { users, traffic, payments, type User, type InsertUser, type Traffic, type InsertTraffic, type Payment, type InsertPayment, type PaymentRequest, type UpdatePaymentStatus, type PaidClientWithPayment } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql, and, or, ilike, asc } from "drizzle-orm";
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
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  toggleUserStatus(id: string): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Traffic methods
  getAllTraffic(): Promise<Traffic[]>;
  getTrafficById(id: string): Promise<Traffic | undefined>;
  createTraffic(traffic: InsertTraffic): Promise<Traffic>;
  updateTraffic(id: string, traffic: Partial<InsertTraffic>): Promise<Traffic>;
  deleteTraffic(id: string): Promise<void>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByTrafficId(trafficId: string): Promise<Payment | undefined>;
  getPendingPayments(): Promise<PaymentRequest[]>;
  updatePaymentStatus(id: string, status: UpdatePaymentStatus): Promise<Payment>;
  getPaymentById(id: string): Promise<Payment | undefined>;
  
  // Paid Clients methods
  getPaidClients(params: {
    page?: number;
    pageSize?: number;
    gender?: string;
    birthYear?: string;
    age?: string;
    height?: string;
    maritalStatus?: string;
    qualification?: string;
    profession?: string;
    permanentCountry?: string;
    permanentCity?: string;
    presentCountry?: string;
    presentCity?: string;
    q?: string;
  }, currentUser: User): Promise<PaidClientWithPayment[]>;
  getPaidClientsCount(params: {
    gender?: string;
    birthYear?: string;
    age?: string;
    height?: string;
    maritalStatus?: string;
    qualification?: string;
    profession?: string;
    permanentCountry?: string;
    permanentCity?: string;
    presentCountry?: string;
    presentCity?: string;
    q?: string;
  }, currentUser: User): Promise<number>;
  
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData as any)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async toggleUserStatus(id: string): Promise<User> {
    // First get current user to toggle their status
    const currentUser = await this.getUser(id);
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    const [user] = await db
      .update(users)
      .set({ isEnabled: !currentUser.isEnabled })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    // Check if user exists before deletion
    const userToDelete = await this.getUser(id);
    if (!userToDelete) {
      throw new Error('User not found');
    }
    
    // Check for related traffic records that reference this user
    const trafficWithAssignedBy = await db.select().from(traffic).where(eq(traffic.assignedBy, id));
    const trafficWithCreatedBy = await db.select().from(traffic).where(eq(traffic.createdBy, id));
    
    if (trafficWithAssignedBy.length > 0 || trafficWithCreatedBy.length > 0) {
      throw new Error('Cannot delete user: There are traffic records associated with this user. Please reassign or delete the related records first.');
    }
    
    await db.delete(users).where(eq(users.id, id));
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

  async getPaymentById(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPendingPayments(): Promise<PaymentRequest[]> {
    const result = await db
      .select({
        id: payments.id,
        trafficId: payments.trafficId,
        trafficName: traffic.name,
        packageType: payments.packageType,
        paidAmount: payments.paidAmount,
        discountAmount: payments.discountAmount,
        dueAmount: payments.dueAmount,
        totalAmount: payments.totalAmount,
        paymentMethod: payments.paymentMethod,
        afterMarriageFee: payments.afterMarriageFee,
        invoiceGenerated: payments.invoiceGenerated,
        status: payments.status,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(traffic, eq(payments.trafficId, traffic.id))
      .where(eq(payments.status, 'pending'))
      .orderBy(desc(payments.createdAt));
    
    return result as PaymentRequest[];
  }

  async updatePaymentStatus(id: string, statusData: UpdatePaymentStatus): Promise<Payment> {
    // Atomic update: only update if payment exists and status is pending
    const [payment] = await db
      .update(payments)
      .set({ status: statusData.status })
      .where(sql`${payments.id} = ${id} AND ${payments.status} = 'pending'`)
      .returning();

    if (!payment) {
      // Check if payment exists to distinguish 404 vs 409
      const existingPayment = await this.getPaymentById(id);
      if (!existingPayment) {
        throw new Error('Payment not found');
      }
      throw new Error(`Payment status is already ${existingPayment.status}`);
    }

    // If payment is accepted, update the corresponding traffic status to 'paid'
    if (statusData.status === 'accepted' && payment.trafficId) {
      await db
        .update(traffic)
        .set({ status: 'paid' })
        .where(eq(traffic.id, payment.trafficId));
    }

    return payment;
  }

  async getTrafficCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(traffic);
    return result.count;
  }

  async getPaidClientsCount(params: {
    gender?: string;
    birthYear?: string;
    age?: string;
    height?: string;
    maritalStatus?: string;
    qualification?: string;
    profession?: string;
    permanentCountry?: string;
    permanentCity?: string;
    presentCountry?: string;
    presentCity?: string;
    q?: string;
  } = {}, currentUser?: User): Promise<number> {
    if (!currentUser) {
      // For dashboard stats - get count of all accepted payments
      const [result] = await db
        .select({ count: count() })
        .from(payments)
        .where(eq(payments.status, 'accepted'));
      return result.count;
    }

    // For paid clients page with filtering
    const conditions = [eq(payments.status, 'accepted')];
    
    // Role-based access: non-admins see only their assigned traffic
    if (currentUser.role !== 'super_admin') {
      conditions.push(eq(traffic.assignedBy, currentUser.id));
    }

    // Add filters
    if (params.gender) conditions.push(eq(traffic.gender, params.gender));
    if (params.height) conditions.push(eq(traffic.height, params.height));
    if (params.maritalStatus) conditions.push(eq(traffic.maritalStatus, params.maritalStatus));
    if (params.qualification) conditions.push(eq(traffic.qualification, params.qualification));
    if (params.profession) conditions.push(eq(traffic.profession, params.profession));
    if (params.permanentCountry) conditions.push(eq(traffic.permanentCountry, params.permanentCountry));
    if (params.permanentCity) conditions.push(eq(traffic.permanentCity, params.permanentCity));
    if (params.presentCountry) conditions.push(eq(traffic.presentCountry, params.presentCountry));
    if (params.presentCity) conditions.push(eq(traffic.presentCity, params.presentCity));
    
    // Manual search across multiple fields
    if (params.q) {
      const searchTerm = `%${params.q}%`;
      conditions.push(
        or(
          ilike(traffic.name, searchTerm),
          ilike(traffic.contactNumber, searchTerm),
          ilike(traffic.email, searchTerm),
          ilike(traffic.profession, searchTerm),
          ilike(traffic.qualification, searchTerm),
          ilike(traffic.permanentCity, searchTerm),
          ilike(traffic.permanentCountry, searchTerm),
          ilike(traffic.presentCity, searchTerm),
          ilike(traffic.presentCountry, searchTerm),
          ilike(traffic.organization, searchTerm),
          ilike(traffic.requirements, searchTerm)
        )!
      );
    }

    const [result] = await db
      .select({ count: count() })
      .from(payments)
      .innerJoin(traffic, eq(payments.trafficId, traffic.id))
      .where(and(...conditions));
    
    return result.count;
  }

  async getPaidClients(params: {
    page?: number;
    pageSize?: number;
    gender?: string;
    birthYear?: string;
    age?: string;
    height?: string;
    maritalStatus?: string;
    qualification?: string;
    profession?: string;
    permanentCountry?: string;
    permanentCity?: string;
    presentCountry?: string;
    presentCity?: string;
    q?: string;
  }, currentUser: User): Promise<PaidClientWithPayment[]> {
    const conditions = [eq(payments.status, 'accepted')];
    
    // Role-based access: non-admins see only their assigned traffic
    if (currentUser.role !== 'super_admin') {
      conditions.push(eq(traffic.assignedBy, currentUser.id));
    }

    // Add filters
    if (params.gender) conditions.push(eq(traffic.gender, params.gender));
    if (params.height) conditions.push(eq(traffic.height, params.height));
    if (params.maritalStatus) conditions.push(eq(traffic.maritalStatus, params.maritalStatus));
    if (params.qualification) conditions.push(eq(traffic.qualification, params.qualification));
    if (params.profession) conditions.push(eq(traffic.profession, params.profession));
    if (params.permanentCountry) conditions.push(eq(traffic.permanentCountry, params.permanentCountry));
    if (params.permanentCity) conditions.push(eq(traffic.permanentCity, params.permanentCity));
    if (params.presentCountry) conditions.push(eq(traffic.presentCountry, params.presentCountry));
    if (params.presentCity) conditions.push(eq(traffic.presentCity, params.presentCity));
    
    // Manual search across multiple fields
    if (params.q) {
      const searchTerm = `%${params.q}%`;
      conditions.push(
        or(
          ilike(traffic.name, searchTerm),
          ilike(traffic.contactNumber, searchTerm),
          ilike(traffic.email, searchTerm),
          ilike(traffic.profession, searchTerm),
          ilike(traffic.qualification, searchTerm),
          ilike(traffic.permanentCity, searchTerm),
          ilike(traffic.permanentCountry, searchTerm),
          ilike(traffic.presentCity, searchTerm),
          ilike(traffic.presentCountry, searchTerm),
          ilike(traffic.organization, searchTerm),
          ilike(traffic.requirements, searchTerm)
        )!
      );
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const result = await db
      .select({
        // Traffic fields
        id: traffic.id,
        name: traffic.name,
        contactNumber: traffic.contactNumber,
        email: traffic.email,
        priority: traffic.priority,
        status: traffic.status,
        assignedBy: traffic.assignedBy,
        profession: traffic.profession,
        jobType: traffic.jobType,
        dateOfBirth: traffic.dateOfBirth,
        maritalStatus: traffic.maritalStatus,
        gender: traffic.gender,
        permanentCountry: traffic.permanentCountry,
        permanentCity: traffic.permanentCity,
        presentCountry: traffic.presentCountry,
        presentCity: traffic.presentCity,
        height: traffic.height,
        qualification: traffic.qualification,
        organization: traffic.organization,
        religion: traffic.religion,
        socialTitle: traffic.socialTitle,
        profilePicture: traffic.profilePicture,
        candidatePictures: traffic.candidatePictures,
        curriculumVitae: traffic.curriculumVitae,
        requirements: traffic.requirements,
        createdBy: traffic.createdBy,
        createdAt: traffic.createdAt,
        // Payment fields
        paymentDate: payments.createdAt,
        paymentId: payments.id,
        packageType: payments.packageType,
        paidAmount: payments.paidAmount,
        paymentMethod: payments.paymentMethod,
      })
      .from(payments)
      .innerJoin(traffic, eq(payments.trafficId, traffic.id))
      .where(and(...conditions))
      .orderBy(desc(payments.createdAt))
      .limit(pageSize)
      .offset(offset);
    
    return result.map(item => ({
      ...item,
      paymentDate: item.paymentDate?.toISOString() || '',
    })) as PaidClientWithPayment[];
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
          role: "super_admin",
          isEnabled: true
        });
      } else {
        await this.createUser({
          username: "admin",
          password: await hashPassword(adminPassword),
          role: "super_admin",
          isEnabled: true
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
