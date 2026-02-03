import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { actionCoordinatorAgent } from "@/lib/ai/agents";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const { data: circle } = await supabase
      .from("circles")
      .select("*, issue:issues(*), members:circle_members(count)")
      .eq("id", params.id)
      .single();

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    const actionPlan = await actionCoordinatorAgent.planActions({
      issueId: circle.issue_id,
      issueTitle: circle.issue?.title || circle.name,
      issueDescription: circle.issue?.description || circle.description,
      circleSize: circle.members[0]?.count || 0,
      timeframe: "1 month",
    });

    if (actionPlan.success) {
      return NextResponse.json({
        success: true,
        actionPlan: actionPlan.data,
      });
    }

    return NextResponse.json({
      success: false,
      error: actionPlan.error || "Failed to create action plan",
    });
  } catch (error: any) {
    console.error("Action planning error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
