import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Kisi specific project ke live request logs fetch karna
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "ProjectId is required" }, { status: 400 });
    }

    const logs = await db.requestLog.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 50, // Last 50 recent requests
    });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}