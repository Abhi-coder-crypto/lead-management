import { Handler } from "@netlify/functions";
import { connectDB } from "./utils/db";
import { storage } from "./utils/storage";
import { authenticateRequest, createResponse, handleOptions } from "./utils/auth";
import { insertNoteSchema } from "../../shared/schema";
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

    const pathParts = event.path.split('/');
    const leadId = pathParts[pathParts.length - 2]; // /api/leads/:leadId/notes
    
    if (!leadId) {
      return createResponse(400, { message: "Lead ID is required" });
    }

    // Handle POST /api/leads/:leadId/notes
    if (event.httpMethod === "POST") {
      // Verify the lead belongs to the current user before allowing note creation
      const leadExists = await storage.getLeadById(leadId, auth.user.userId);
      if (!leadExists) {
        return createResponse(404, { message: "Lead not found" });
      }

      const noteData = insertNoteSchema.parse({
        ...JSON.parse(event.body || "{}"),
        leadId: leadId,
        userId: auth.user.userId
      });
      
      const note = await storage.addNote(noteData);
      return createResponse(201, note);
    }

    // Handle GET /api/leads/:leadId/notes
    if (event.httpMethod === "GET") {
      const notes = await storage.getLeadNotes(leadId, auth.user.userId);
      return createResponse(200, notes);
    }

    return createResponse(405, { message: "Method not allowed" });
  } catch (error) {
    console.error("Lead notes error:", error);
    if (error instanceof z.ZodError) {
      return createResponse(400, { message: "Invalid input", errors: error.errors });
    }
    return createResponse(500, { message: "Internal server error" });
  }
};