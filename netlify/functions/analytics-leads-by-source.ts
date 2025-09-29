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

    const { period } = event.queryStringParameters || {};
    const data = await storage.getLeadsBySource(auth.user.userId, period);
    return createResponse(200, data);
  } catch (error) {
    console.error("Analytics leads by source error:", error);
    return createResponse(500, { message: "Internal server error" });
  }
};