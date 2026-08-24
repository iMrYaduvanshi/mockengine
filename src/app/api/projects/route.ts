import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Saare projects list karna (with endpoints aur logs count)
export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { endpoints: true, logs: true },
        },
        endpoints: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST: Naya project create karna
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Slug ko URL-friendly format me sanitize karna (spaces -> hyphens, lowercase)
    const formattedSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    // Check duplicate slug
    const existing = await db.project.findUnique({
      where: { slug: formattedSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 409 }
      );
    }

    const project = await db.project.create({
      data: {
        name,
        slug: formattedSlug,
        description: description || "",
      },
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}