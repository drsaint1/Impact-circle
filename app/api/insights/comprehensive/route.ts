import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { masterCoordinatorAgent } from "@/lib/ai/agents";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
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

    const [userData, circlesData, issuesData] = await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase
        .from("circle_members")
        .select("circle:circles(*, activities(*))")
        .eq("user_id", user.id),
      supabase
        .from("issues")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // @ts-expect-error - Agent method exists at runtime
    const insights = await masterCoordinatorAgent.getComprehensiveInsights({
      userProfile: userData.data,
      userCircles: circlesData.data?.map((c: any) => c.circle) || [],
      recentIssues: issuesData.data || [],
      communityStats: {
        totalCircles: circlesData.data?.length || 0,
        totalIssues: issuesData.data?.length || 0,
      },
    });

    if (insights.success) {
      return NextResponse.json({
        success: true,
        insights: insights.data,
      });
    }

    return NextResponse.json({
      success: false,
      error: insights.error || "Failed to generate insights",
    });
  } catch (error: any) {
    console.error("Comprehensive insights error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
