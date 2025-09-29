import { Handler } from "@netlify/functions";
import { connectDB } from "./utils/db";
import { storage } from "./utils/storage";
import { authenticateRequest, createResponse, handleOptions } from "./utils/auth";
import { insertReminderSchema } from "../../shared/schema";
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

    const id = event.path.split('/').pop();
    if (!id) {
      return createResponse(400, { message: "Reminder ID is required" });
    }

    // Handle PUT /api/reminders/:id
    if (event.httpMethod === "PUT") {
      const body = JSON.parse(event.body || "{}");
      const updates = insertReminderSchema.partial().omit({ userId: true }).parse(body);
      
      if (body.dueDate) {
        updates.dueDate = new Date(body.dueDate);
      }

      // Verify lead ownership if leadId is being updated
      if (updates.leadId) {
        const leadExists = await storage.getLeadById(updates.leadId, auth.user.userId);
        if (!leadExists) {
          return createResponse(404, { message: "Lead not found" });
        }
      }
      
      const reminder = await storage.updateReminder(id, updates, auth.user.userId);
      if (!reminder) {
        return createResponse(404, { message: "Reminder not found" });
      }
      
      return createResponse(200, reminder);
    }

    return createResponse(405, { message: "Method not allowed" });
  } catch (error) {
    console.error("Reminder detail error:", error);
    if (error instanceof z.ZodError) {
      return createResponse(400, { message: "Invalid input", errors: error.errors });
    }
    return createResponse(500, { message: "Internal server error" });
  }
};