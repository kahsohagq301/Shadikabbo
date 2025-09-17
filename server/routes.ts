import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTrafficSchema, insertPaymentSchema, insertUserSchema, userSafeUpdateSchema, userAdminUpdateSchema } from "@shared/schema";
import { hashPassword } from "./security";

// Middleware to block disabled users
function requireEnabledUser(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  
  if (!req.user?.isEnabled) {
    return res.status(403).json({ message: "Access denied. Account is disabled." });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  await setupAuth(app);

  // Traffic management routes
  app.get("/api/traffic", requireEnabledUser, async (req, res) => {
    
    try {
      const trafficData = await storage.getAllTraffic();
      res.json(trafficData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch traffic data" });
    }
  });

  app.post("/api/traffic", requireEnabledUser, async (req, res) => {

    try {
      const trafficData = insertTrafficSchema.parse({
        ...req.body,
        createdBy: req.user?.id,
        assignedBy: req.user?.id,
      });
      
      const newTraffic = await storage.createTraffic(trafficData);
      res.status(201).json(newTraffic);
    } catch (error) {
      res.status(400).json({ message: "Invalid traffic data", error });
    }
  });

  app.put("/api/traffic/:id", requireEnabledUser, async (req, res) => {

    try {
      const trafficData = insertTrafficSchema.partial().parse(req.body);
      const updatedTraffic = await storage.updateTraffic(req.params.id, trafficData);
      res.json(updatedTraffic);
    } catch (error) {
      res.status(400).json({ message: "Failed to update traffic", error });
    }
  });

  app.delete("/api/traffic/:id", requireEnabledUser, async (req, res) => {

    try {
      await storage.deleteTraffic(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete traffic" });
    }
  });

  // Payment routes
  app.post("/api/payments", requireEnabledUser, async (req, res) => {

    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const newPayment = await storage.createPayment(paymentData);
      res.status(201).json(newPayment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data", error });
    }
  });

  // Dashboard statistics
  app.get("/api/dashboard/stats", requireEnabledUser, async (req, res) => {

    try {
      const [trafficCount, paidClientsCount, totalPayments] = await Promise.all([
        storage.getTrafficCount(),
        storage.getPaidClientsCount(),
        storage.getTotalPayments(),
      ]);

      res.json({
        trafficCount,
        paidClientsCount,
        successStories: Math.floor(paidClientsCount * 0.25), // Assuming 25% success rate
        totalPayments: totalPayments / 100000, // Convert to lakhs
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Account management routes
  app.get("/api/accounts", requireEnabledUser, async (req, res) => {
    // Check if user is super_admin or only getting their own account
    const currentUser = req.user;
    if (!currentUser) return res.sendStatus(401);

    try {
      const role = req.query.role as string;
      
      // Role-based access control
      if (currentUser.role !== 'super_admin') {
        // Non-super admins can only see their own account
        const user = await storage.getUser(currentUser.id);
        if (!user) return res.sendStatus(404);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.json([userWithoutPassword]);
        return;
      }

      // Super admin can see all accounts
      let accounts;
      if (role && role !== 'all') {
        accounts = await storage.getUsersByRole(role);
      } else {
        accounts = await storage.getAllUsers();
      }

      // Remove passwords from all accounts
      const accountsWithoutPasswords = accounts.map(({ password, ...account }) => account);
      res.json(accountsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", requireEnabledUser, async (req, res) => {
    // Only super_admin can create new accounts
    if (req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: "Access denied. Only Super Admin can create accounts." });
    }

    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Hash the password before storing
      const hashedPassword = await hashPassword(userData.password);
      const userWithHashedPassword = {
        ...userData,
        password: hashedPassword
      };

      const newUser = await storage.createUser(userWithHashedPassword);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.put("/api/accounts/:id", requireEnabledUser, async (req, res) => {
    const currentUser = req.user;
    const targetUserId = req.params.id;

    // Role-based access control
    if (currentUser?.role !== 'super_admin' && currentUser?.id !== targetUserId) {
      return res.status(403).json({ message: "Access denied. You can only update your own account." });
    }

    try {
      let userData;
      
      // Field filtering based on user role
      if (currentUser?.role === 'super_admin') {
        // Super admin can update all fields
        userData = userAdminUpdateSchema.parse(req.body);
      } else {
        // Non-super admin can only update safe fields
        userData = userSafeUpdateSchema.parse(req.body);
      }
      
      // If password is being updated, hash it
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }

      const updatedUser = await storage.updateUser(targetUserId, userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to update account", error });
    }
  });

  app.put("/api/accounts/:id/toggle", requireEnabledUser, async (req, res) => {
    // Only super_admin can enable/disable accounts
    if (req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: "Access denied. Only Super Admin can enable/disable accounts." });
    }

    try {
      const updatedUser = await storage.toggleUserStatus(req.params.id);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to toggle account status", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
