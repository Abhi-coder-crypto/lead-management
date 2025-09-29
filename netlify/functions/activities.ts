import { Handler } from "@netlify/functions";
import { connectDB } from "./utils/db";
import { storage } from "./utils/storage";
import { authenticateRequest, createResponse, handleOptions } from "./utils/auth";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptions();
  }

  if (event.httpMethod !== "GET") {
    return createResponse(405, { message: "Method not allowed" });
  }

  try {
    await connectDB();

    const auth = authenticateRequest(event);
    if (!auth.isAuthenticated || !auth.user) {
      return createResponse(401, { message: auth.error || "Unauthorized" });
    }

    const { limit = "10" } = event.queryStringParameters || {};
    const activities = await storage.getRecentActivities(auth.user.userId, parseInt(limit));
    
    return createResponse(200, activities);
  } catch (error) {
    console.error("Activities error:", error);
    return createResponse(500, { message: "Internal server error" });
  }
};