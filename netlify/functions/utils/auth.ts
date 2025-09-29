import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { HandlerEvent } from "@netlify/functions";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required for production deployment");
}

const secret: string = JWT_SECRET;

interface JwtPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

export function authenticateRequest(event: HandlerEvent): { isAuthenticated: boolean; user?: JwtPayload; error?: string } {
  const authHeader = event.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return { isAuthenticated: false, error: "Access token required" };
  }

  try {
    const decoded = verifyToken(token);
    return { isAuthenticated: true, user: decoded };
  } catch (error) {
    return { isAuthenticated: false, error: "Invalid or expired token" };
  }
}

export function createResponse(statusCode: number, body: any, headers: Record<string, string> = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

export function handleOptions() {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
    body: "",
  };
}