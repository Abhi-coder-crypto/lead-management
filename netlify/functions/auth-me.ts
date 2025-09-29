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

    const user = await storage.getUser(auth.user.userId);
    if (!user) {
      return createResponse(404, { message: "User not found" });
    }

    return createResponse(200, { id: user.id, name: user.name, email: user.email });
  } catch (error) {
    console.error("Auth me error:", error);
    return createResponse(500, { message: "Internal server error" });
  }
};