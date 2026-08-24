import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST: Naya Mock Endpoint create karna
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId,
      name,
      path,
      method = "GET",
      statusCode = 200,
      responseBody = "{}",
      headers = "{}",
      delayMs = 0,
      errorRate = 0.0,
    } = body;

    if (!projectId || !name || !path) {
      return NextResponse.json(
        { error: "ProjectId, name, and path are required" },
        { status: 400 }
      );
    }

    // Path formatting (Ensure it starts with '/')
    const formattedPath = path.startsWith("/") ? path : `/${path}`;

    const endpoint = await db.mockEndpoint.create({
      data: {
        projectId,
        name,
        path: formattedPath,
        method: method.toUpperCase(),
        statusCode: Number(statusCode),
        responseBody: typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody),
        headers: typeof headers === "string" ? headers : JSON.stringify(headers),
        delayMs: Number(delayMs) || 0,
        errorRate: Number(errorRate) || 0.0,
      },
    });

    return NextResponse.json({ success: true, endpoint }, { status: 201 });
  } catch (error) {
    console.error("Error creating endpoint:", error);
    return NextResponse.json(
      { error: "Failed to create endpoint" },
      { status: 500 }
    );
  }
}

// PUT: Endpoint update karna (Toggle status, change delay, response body)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Endpoint ID is required" }, { status: 400 });
    }

    if (updateData.path && !updateData.path.startsWith("/")) {
      updateData.path = `/${updateData.path}`;
    }

    const endpoint = await db.mockEndpoint.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, endpoint });
  } catch (error) {
    console.error("Error updating endpoint:", error);
    return NextResponse.json(
      { error: "Failed to update endpoint" },
      { status: 500 }
    );
  }
}

// DELETE: Endpoint delete karna
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Endpoint ID is required" }, { status: 400 });
    }

    await db.mockEndpoint.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Endpoint deleted successfully" });
  } catch (error) {
    console.error("Error deleting endpoint:", error);
    return NextResponse.json(
      { error: "Failed to delete endpoint" },
      { status: 500 }
    );
  }
}