import { Handler } from "@netlify/functions";
import { connectDB } from "./utils/db";
import { storage } from "./utils/storage";
import { hashPassword, generateToken, createResponse, handleOptions } from "./utils/auth";
import { insertUserSchema } from "../../shared/schema";
import { z } from "zod";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptions();
  }

  if (event.httpMethod !== "POST") {
    return createResponse(405, { message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { name, email, password } = insertUserSchema.parse(JSON.parse(event.body || "{}"));
    
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return createResponse(400, { message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
      name,
      email,
      password: hashedPassword
    });

    const token = generateToken({ userId: user.id, email: user.email });
    
    return createResponse(200, {
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error instanceof z.ZodError) {
      return createResponse(400, { message: "Invalid input", errors: error.errors });
    }
    return createResponse(500, { message: "Internal server error" });
  }
};