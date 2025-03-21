import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertJobSchema, 
  insertCompanySchema, 
  insertApplicationSchema,
  jobTypeEnum, 
  userRoleEnum
} from "@shared/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user has a specific role
const hasRole = (roles: string[]) => (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (roles.includes(req.user!.role)) {
    return next();
  }
  
  res.status(403).json({ message: "Forbidden" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Jobs API
  app.get("/api/jobs", async (req, res) => {
    try {
      const { search, location, type, category } = req.query;
      const jobs = await storage.getJobs({
        search: search as string,
        location: location as string,
        type: type as string,
        category: category as string
      });
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(parseInt(req.params.id));
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job details" });
    }
  });

  app.post("/api/jobs", isAuthenticated, hasRole(['company', 'admin']), async (req, res) => {
    try {
      const jobData = insertJobSchema.parse({
        ...req.body,
        postedBy: req.user!.id,
      });
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid job data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create job" });
      }
    }
  });

  app.put("/api/jobs/:id", isAuthenticated, hasRole(['company', 'admin']), async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const existingJob = await storage.getJob(jobId);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if user owns the job or is an admin
      if (existingJob.postedBy !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedJob = await storage.updateJob(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", isAuthenticated, hasRole(['company', 'admin']), async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const existingJob = await storage.getJob(jobId);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if user owns the job or is an admin
      if (existingJob.postedBy !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteJob(jobId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Applications API
  app.post("/api/jobs/:id/apply", isAuthenticated, hasRole(['job_seeker']), async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        jobId,
        userId: req.user!.id,
      });
      
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid application data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit application" });
      }
    }
  });

  app.get("/api/applications", isAuthenticated, async (req, res) => {
    try {
      let applications;
      
      if (req.user!.role === 'job_seeker') {
        // Job seekers can only see their own applications
        applications = await storage.getApplicationsByUser(req.user!.id);
      } else if (req.user!.role === 'company') {
        // Companies can see applications for their jobs
        applications = await storage.getApplicationsByCompany(req.user!.id);
      } else if (req.user!.role === 'admin') {
        // Admins can see all applications
        applications = await storage.getAllApplications();
      }
      
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Companies API
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(parseInt(req.params.id));
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company details" });
    }
  });

  app.put("/api/companies/:id", isAuthenticated, hasRole(['company', 'admin']), async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      // Check if user owns the company or is an admin
      if (company.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedCompany = await storage.updateCompany(companyId, req.body);
      res.json(updatedCompany);
    } catch (error) {
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  // Company Dashboard API - Get jobs posted by company
  app.get("/api/dashboard/jobs", isAuthenticated, hasRole(['company']), async (req, res) => {
    try {
      const jobs = await storage.getJobsByCompany(req.user!.id);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Get list of enums for frontend forms
  app.get("/api/enums", (req, res) => {
    try {
      const enums = {
        jobTypes: jobTypeEnum.enumValues,
        userRoles: userRoleEnum.enumValues
      };
      res.json(enums);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enums" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
