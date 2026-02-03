import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized - No auth token" },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const { data: issue, error } = await supabase
      .from("issues")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !issue) {
      console.error("Error fetching issue:", error);
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }


    const { data: circles } = await supabase
      .from("circles")
      .select(`
        *,
        members:circle_members(count)
      `)
      .eq("issue_id", params.id)
      .in("status", ["forming", "active"]);

    const transformedIssue = {
      ...issue,
      skillsNeeded: issue.skills_needed || [],
      volunteersNeeded: issue.volunteers_needed || 0,
      volunteersJoined: issue.volunteers_joined || 0,
      estimatedHours: issue.estimated_hours || 0,
      createdBy: issue.created_by,
      createdAt: issue.created_at,
      aiGenerated: issue.ai_generated,
      startDate: issue.start_date,
      endDate: issue.end_date,
    };

    return NextResponse.json({
      success: true,
      issue: transformedIssue,
      circles: circles || [],
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}