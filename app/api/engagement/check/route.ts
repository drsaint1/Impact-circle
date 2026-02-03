import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { engagementCoachAgent } from "@/lib/ai/agents";

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

    const { data: circles } = await supabase
      .from("circle_members")
      .select("circle:circles(*, activities(*))")
      .eq("user_id", user.id)
      .eq("status", "active");

    const engagement = await engagementCoachAgent.checkEngagement({
      userId: user.id,
      circles: circles?.map((c: any) => c.circle) || [],
      recentActivity: [],
    });

    if (engagement.success) {
      return NextResponse.json({
        success: true,
        engagement: engagement.data,
      });
    }

    return NextResponse.json({
      success: false,
      error: engagement.error || "Failed to check engagement",
    });
  } catch (error: any) {
    console.error("Engagement check error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
