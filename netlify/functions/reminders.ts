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

    // Handle GET /api/reminders
    if (event.httpMethod === "GET") {
      const { date, overdue, completed } = event.queryStringParameters || {};
      
      const filters = {
        date: date ? new Date(date) : undefined,
        overdue: overdue === "true",
        completed: completed !== undefined ? completed === "true" : undefined
      };

      const reminders = await storage.getReminders(auth.user.userId, filters);
      return createResponse(200, reminders);
    }

    // Handle POST /api/reminders
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      
      // Verify the lead belongs to the current user if leadId is provided
      if (body.leadId) {
        const leadExists = await storage.getLeadById(body.leadId, auth.user.userId);
        if (!leadExists) {
          return createResponse(404, { message: "Lead not found" });
        }
      }

      const reminderData = insertReminderSchema.parse({
        ...body,
        userId: auth.user.userId
      });
      
      const reminder = await storage.createReminder(reminderData);
      return createResponse(201, reminder);
    }

    return createResponse(405, { message: "Method not allowed" });
  } catch (error) {
    console.error("Reminders error:", error);
    if (error instanceof z.ZodError) {
      return createResponse(400, { message: "Invalid input", errors: error.errors });
    }
    return createResponse(500, { message: "Internal server error" });
  }
};