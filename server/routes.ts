import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTrafficSchema, insertPaymentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  await setupAuth(app);

  // Traffic management routes
  app.get("/api/traffic", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const trafficData = await storage.getAllTraffic();
      res.json(trafficData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch traffic data" });
    }
  });

  app.post("/api/traffic", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

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

  app.put("/api/traffic/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const trafficData = insertTrafficSchema.partial().parse(req.body);
      const updatedTraffic = await storage.updateTraffic(req.params.id, trafficData);
      res.json(updatedTraffic);
    } catch (error) {
      res.status(400).json({ message: "Failed to update traffic", error });
    }
  });

  app.delete("/api/traffic/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      await storage.deleteTraffic(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete traffic" });
    }
  });

  // Payment routes
  app.post("/api/payments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const newPayment = await storage.createPayment(paymentData);
      res.status(201).json(newPayment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data", error });
    }
  });

  // Dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

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

  const httpServer = createServer(app);
  return httpServer;
}
