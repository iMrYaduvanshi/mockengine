import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper: Universal CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

// Browser pre-flight OPTIONS handler
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// In-Memory Project Endpoint Cache (10-second TTL to eliminate repeated DB lookup latency)
const projectCache: Record<string, { data: any; expiry: number }> = {};

async function getProjectWithEndpoints(projectSlug: string) {
  const now = Date.now();
  const cached = projectCache[projectSlug];
  if (cached && cached.expiry > now) {
    return cached.data;
  }

  const project = await db.project.findUnique({
    where: { slug: projectSlug },
    include: { endpoints: true },
  });

  if (project) {
    projectCache[projectSlug] = { data: project, expiry: now + 10000 }; // 10s cache
  }

  return project;
}

// Common Handler for all HTTP Methods (GET, POST, PUT, DELETE, PATCH)
async function handleMockRequest(
  req: NextRequest,
  { params }: { params: Promise<{ projectSlug: string; path: string[] }> }
) {
  const { projectSlug, path } = await params;
  const method = req.method.toUpperCase();
  const requestedPath = "/" + (path ? path.join("/") : "");

  // Capture client metadata for logging
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";
  const headersObj: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  let bodyStr: string | null = null;
  if (method !== "GET" && method !== "HEAD") {
    try {
      bodyStr = await req.clone().text();
    } catch {
      bodyStr = null;
    }
  }

  try {
    // 1. Fetch Project & Endpoints (with in-memory cache for sub-millisecond lookups)
    const project = await getProjectWithEndpoints(projectSlug);

    if (!project) {
      return NextResponse.json(
        {
          error: "Project Not Found",
          message: `No project found with slug '${projectSlug}'`,
        },
        { status: 404, headers: corsHeaders }
      );
    }

    // 2. Match Mock Endpoint (Path + HTTP Method)
    const endpoint = project.endpoints.find(
      (ep: any) =>
        ep.path.toLowerCase() === requestedPath.toLowerCase() &&
        ep.method.toUpperCase() === method
    );

    if (!endpoint) {
      const availableEndpoints = project.endpoints.map(
        (ep: any) => `${ep.method} ${ep.path}`
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

    // 3. If Endpoint is Disabled
    if (!endpoint.isActive) {
      return NextResponse.json(
        { error: "Endpoint Disabled", message: "This mock endpoint is currently disabled." },
        { status: 503, headers: corsHeaders }
      );
    }

    // 4. Chaos Feature: Latency Simulation (Precise Artificial Delay)
    if (endpoint.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, endpoint.delayMs));
    }

    // 5. Chaos Feature: Fault Injection (Random 500 Error Rate)
    if (endpoint.errorRate > 0 && Math.random() < endpoint.errorRate) {
      // Background Non-Blocking Log (Fire & Forget)
      saveLogBackground(project.id, endpoint.id, method, requestedPath, ip, userAgent, headersObj, bodyStr, 500, endpoint.delayMs);

      return NextResponse.json(
        {
          error: "Simulated Chaos Error",
          message: `Triggered by MockEngine fault injection (Error rate: ${Math.round(endpoint.errorRate * 100)}%)`,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // 6. Response Body and Custom Headers parsing
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
        // ignore invalid JSON
      }
    }

    // 7. Background Non-Blocking Log (Fire & Forget - DOES NOT DELAY THE RESPONSE!)
    saveLogBackground(
      project.id,
      endpoint.id,
      method,
      requestedPath,
      ip,
      userAgent,
      headersObj,
      bodyStr,
      endpoint.statusCode,
      endpoint.delayMs || 15
    );

    // 8. Send Immediate JSON Response
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

// Background Fire-and-Forget Logger (Non-blocking)
function saveLogBackground(
  projectId: string,
  endpointId: string | null,
  method: string,
  path: string,
  ip: string,
  userAgent: string,
  headersObj: Record<string, string>,
  bodyStr: string | null,
  status: number,
  duration: number
) {
  db.requestLog
    .create({
      data: {
        projectId,
        endpointId,
        method,
        path,
        ip,
        userAgent,
        requestHeaders: JSON.stringify(headersObj),
        requestBody: bodyStr,
        responseStatus: status,
        responseDuration: duration,
      },
    })
    .catch((err) => {
      console.error("Async log save failed:", err);
    });
}

// Export All HTTP Handlers
export const GET = handleMockRequest;
export const POST = handleMockRequest;
export const PUT = handleMockRequest;
export const DELETE = handleMockRequest;
export const PATCH = handleMockRequest;