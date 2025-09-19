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

  app.get("/api/payments/pending", requireEnabledUser, async (req, res) => {
    try {
      const pendingPayments = await storage.getPendingPayments();
      res.json(pendingPayments);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      res.status(500).json({ message: "Failed to fetch pending payments" });
    }
  });

  app.post("/api/payments/:id/accept", requireEnabledUser, async (req, res) => {
    // Check if user is super_admin
    if (req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: "Only Super Admin can accept payment requests" });
    }

    try {
      const paymentId = req.params.id;
      const updatedPayment = await storage.updatePaymentStatus(paymentId, { status: 'accepted' });
      res.json(updatedPayment);
    } catch (error: any) {
      console.error('Error accepting payment:', error);
      if (error.message === 'Payment not found') {
        return res.status(404).json({ message: "Payment not found" });
      }
      if (error.message.includes('Payment status is already')) {
        return res.status(409).json({ message: "Payment is not in pending status" });
      }
      res.status(500).json({ message: "Failed to accept payment request" });
    }
  });

  app.post("/api/payments/:id/cancel", requireEnabledUser, async (req, res) => {
    // Check if user is super_admin
    if (req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: "Only Super Admin can cancel payment requests" });
    }

    try {
      const paymentId = req.params.id;
      const updatedPayment = await storage.updatePaymentStatus(paymentId, { status: 'cancelled' });
      res.json(updatedPayment);
    } catch (error: any) {
      console.error('Error cancelling payment:', error);
      if (error.message === 'Payment not found') {
        return res.status(404).json({ message: "Payment not found" });
      }
      if (error.message.includes('Payment status is already')) {
        return res.status(409).json({ message: "Payment is not in pending status" });
      }
      res.status(500).json({ message: "Failed to cancel payment request" });
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

  app.delete("/api/accounts/:id", requireEnabledUser, async (req, res) => {
    // Only super_admin can delete accounts
    if (req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: "Access denied. Only Super Admin can delete accounts." });
    }

    const userIdToDelete = req.params.id;

    // Prevent self-deletion
    if (req.user?.id === userIdToDelete) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    try {
      // Get the user to be deleted before deletion
      const userToDelete = await storage.getUser(userIdToDelete);
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found." });
      }

      // Delete the user
      await storage.deleteUser(userIdToDelete);

      // If the deleted user is currently logged in somewhere, invalidate their session
      // This is handled by the session store and the deserializeUser function
      
      res.json({ message: "Account deleted successfully.", deletedUser: { id: userToDelete.id, username: userToDelete.username } });
    } catch (error: any) {
      // Provide cleaner error messages without exposing internal details
      if (error.message === 'User not found') {
        return res.status(404).json({ message: "User not found." });
      }
      if (error.message.includes('traffic records associated')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to delete account. Please try again." });
    }
  });

  // Paid Clients routes\n  app.get(\"/api/paid-clients\", requireEnabledUser, async (req, res) => {\n    try {\n      const { page = \"1\", pageSize = \"10\", ...rest } = req.query as Record<string, string>;\n      const allow = new Set([\"gender\",\"birthYear\",\"age\",\"height\",\"maritalStatus\",\"qualification\",\"profession\",\"permanentCountry\",\"permanentCity\",\"presentCountry\",\"presentCity\",\"q\"]);\n      const filters: any = {};\n      for (const k of Object.keys(rest)) if (allow.has(k)) filters[k] = rest[k];\n      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);\n      const sizeNum = Math.min(100, Math.max(1, parseInt(String(pageSize), 10) || 10));\n\n      const [data, total] = await Promise.all([\n        storage.getPaidClients({ page: pageNum, pageSize: sizeNum, ...filters }, req.user!),\n        storage.getPaidClientsCount(filters, req.user),\n      ]);\n\n      res.json({\n        data,\n        pagination: {\n          page: pageNum,\n          pageSize: sizeNum,\n          total,\n          totalPages: Math.ceil(total / sizeNum),\n        },\n      });\n    } catch (err) {\n      console.error('Error fetching paid clients:', err);\n      res.status(500).json({ message: \"Failed to fetch paid clients\" });\n    }\n  });\n\n  app.patch(\"/api/paid-clients/:trafficId\", requireEnabledUser, async (req, res) => {\n    if (req.user?.role !== \"super_admin\") {\n      return res.status(403).json({ message: \"Only Super Admin can edit paid clients\" });\n    }\n    try {\n      const data = insertTrafficSchema.partial().parse(req.body);\n      const updated = await storage.updateTraffic(req.params.trafficId, data);\n      res.json(updated);\n    } catch (error: any) {\n      console.error('Error updating paid client:', error);\n      const zErr = error?.issues ? 422 : 400;\n      res.status(zErr).json({ message: \"Failed to update client\", error });\n    }\n  });\n\n  const httpServer = createServer(app);
  return httpServer;
}
