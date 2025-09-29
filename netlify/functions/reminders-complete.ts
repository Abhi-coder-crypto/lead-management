import { Handler } from "@netlify/functions";
import { connectDB } from "./utils/db";
import { storage } from "./utils/storage";
import { authenticateRequest, createResponse, handleOptions } from "./utils/auth";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptions();
  }

  if (event.httpMethod !== "POST") {
    return createResponse(405, { message: "Method not allowed" });
  }

  try {
    await connectDB();

    const auth = authenticateRequest(event);
    if (!auth.isAuthenticated || !auth.user) {
      return createResponse(401, { message: auth.error || "Unauthorized" });
    }

    const pathParts = event.path.split('/');
    const id = pathParts[pathParts.length - 2]; // /api/reminders/:id/complete
    
    if (!id) {
      return createResponse(400, { message: "Reminder ID is required" });
    }

    const success = await storage.completeReminder(id, auth.user.userId);
    if (!success) {
      return createResponse(404, { message: "Reminder not found" });
    }

    return createResponse(200, { message: "Reminder completed" });
  } catch (error) {
    console.error("Complete reminder error:", error);
    return createResponse(500, { message: "Internal server error" });
  }
};