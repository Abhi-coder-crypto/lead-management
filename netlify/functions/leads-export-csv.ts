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

    const { leads } = await storage.getLeads(auth.user.userId, { limit: 10000 });
    
    const csvHeaders = "Name,Email,Phone,Company,Source,Status,Created At\n";
    const csvData = leads.map(lead => 
      `"${lead.name}","${lead.email || ''}","${lead.phone || ''}","${lead.company || ''}","${lead.source}","${lead.status}","${lead.createdAt.toISOString()}"`
    ).join('\n');
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="leads.csv"',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body: csvHeaders + csvData,
    };
  } catch (error) {
    console.error("Export CSV error:", error);
    return createResponse(500, { message: "Internal server error" });
  }
};