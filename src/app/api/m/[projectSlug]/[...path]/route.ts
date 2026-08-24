import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper: CORS Headers taaki koi bhi external frontend app is mock API ko call kar sake
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

// Browser ki pre-flight OPTIONS request handle karne ke liye
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// Common Handler for all HTTP Methods (GET, POST, PUT, DELETE, PATCH)
async function handleMockRequest(
  req: NextRequest,
  { params }: { params: Promise<{ projectSlug: string; path: string[] }> }
) {
  const startTime = Date.now();
  const { projectSlug, path } = await params;
  const method = req.method.toUpperCase();

  // URL path ko string me convert karo (e.g. ["cart", "checkout"] -> "/cart/checkout")
  const requestedPath = "/" + (path ? path.join("/") : "");

  try {
    // 1. Project find karo slug ke through
    const project = await db.project.findUnique({
      where: { slug: projectSlug },
      include: { endpoints: true },
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "Project Not Found",
          message: `No project found with slug '${projectSlug}'`,
        },
        { status: 404, headers: corsHeaders }
      );
    }

    // 2. Matching Mock Endpoint dhoondo (Path aur HTTP Method dono match hone chahiye)
    const endpoint = project.endpoints.find(
      (ep) =>
        ep.path.toLowerCase() === requestedPath.toLowerCase() &&
        ep.method.toUpperCase() === method
    );

    if (!endpoint) {
      // Agar endpoint nahi mila to user ko batao ki is project me kaunse endpoints available hain
      const availableEndpoints = project.endpoints.map(
        (ep) => `${ep.method} ${ep.path}`
      );

      return NextResponse.json(
        {
          error: "Endpoint Not Found",
          message: `No mock route configured for ${method} ${requestedPath}`,
          availableEndpoints,
        },
        { status: 404, headers: corsHeaders }
      );
    }

    // 3. Agar endpoint disabled hai
    if (!endpoint.isActive) {
      return NextResponse.json(
        { error: "Endpoint Disabled", message: "This mock endpoint is currently disabled." },
        { status: 503, headers: corsHeaders }
      );
    }

    // 4. Chaos Feature: Latency Simulation (Artificial Delay)
    if (endpoint.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, endpoint.delayMs));
    }

    // 5. Chaos Feature: Fault Injection (Random Error Rate)
    if (endpoint.errorRate > 0 && Math.random() < endpoint.errorRate) {
      const duration = Date.now() - startTime;
      
      // Request log record karo
      await logRequest(project.id, endpoint.id, req, requestedPath, 500, duration);

      return NextResponse.json(
        {
          error: "Simulated Chaos Error",
          message: `Triggered by MockEngine fault injection (Error rate: ${endpoint.errorRate * 100}%)`,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // 6. Response Body aur Custom Headers parse karo
    let responseData = {};
    try {
      responseData = JSON.parse(endpoint.responseBody);
    } catch {
      responseData = { raw: endpoint.responseBody };
    }

    let customHeaders: Record<string, string> = { ...corsHeaders };
    if (endpoint.headers) {
      try {
        const parsedCustomHeaders = JSON.parse(endpoint.headers);
        customHeaders = { ...customHeaders, ...parsedCustomHeaders };
      } catch {
        // Agar header json invalid hai to ignore karo
      }
    }

    const duration = Date.now() - startTime;

    // 7. Request Log Database me save karo (Live Request Inspector ke liye)
    await logRequest(project.id, endpoint.id, req, requestedPath, endpoint.statusCode, duration);

    // 8. Custom JSON Response return karo
    return NextResponse.json(responseData, {
      status: endpoint.statusCode,
      headers: customHeaders,
    });
  } catch (error) {
    console.error("MockEngine Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to process mock request." },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Helper function: Request details ko Database me log karna
async function logRequest(
  projectId: string,
  endpointId: string | null,
  req: NextRequest,
  path: string,
  status: number,
  duration: number
) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";
    
    // Headers ko JSON object banana
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    let bodyStr: string | null = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        bodyStr = await req.text();
      } catch {
        bodyStr = null;
      }
    }

    await db.requestLog.create({
      data: {
        projectId,
        endpointId,
        method: req.method.toUpperCase(),
        path,
        ip,
        userAgent,
        requestHeaders: JSON.stringify(headersObj),
        requestBody: bodyStr,
        responseStatus: status,
        responseDuration: duration,
      },
    });
  } catch (err) {
    console.error("Failed to save request log:", err);
  }
}

// Saare HTTP Methods export karo
export const GET = handleMockRequest;
export const POST = handleMockRequest;
export const PUT = handleMockRequest;
export const DELETE = handleMockRequest;
export const PATCH = handleMockRequest;