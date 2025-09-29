import { Handler } from "@netlify/functions";
import { connectDB } from "./utils/db";
import { storage } from "./utils/storage";
import { authenticateRequest, createResponse, handleOptions } from "./utils/auth";
import { insertLeadSchema } from "../../shared/schema";
import { z } from "zod";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptions();
  }

  try {
    await connectDB();

    const auth = authenticateRequest(event);
    if (!auth.isAuthenticated || !auth.user) {
      return createResponse(401, { message: auth.error || "Unauthorized" });
    }

    // Handle GET /api/leads
    if (event.httpMethod === "GET") {
      const {
        search,
        status,
        source,
        startDate,
        endDate,
        page = "1",
        limit = "10"
      } = event.queryStringParameters || {};

      const filters = {
        search,
        status,
        source,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await storage.getLeads(auth.user.userId, filters);
      return createResponse(200, result);
    }

    // Handle POST /api/leads
    if (event.httpMethod === "POST") {
      const leadData = insertLeadSchema.parse({
        ...JSON.parse(event.body || "{}"),
        userId: auth.user.userId
      });
      
      const lead = await storage.createLead(leadData);
      return createResponse(201, lead);
    }

    return createResponse(405, { message: "Method not allowed" });
  } catch (error) {
    console.error("Leads error:", error);
    if (error instanceof z.ZodError) {
      return createResponse(400, { message: "Invalid input", errors: error.errors });
    }
    return createResponse(500, { message: "Internal server error" });
  }
};