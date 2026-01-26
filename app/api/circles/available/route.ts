import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
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

    
    const { data: circles, error } = await supabase
      .from("circles")
      .select(`
        *,
        members:circle_members(count),
        issue:issues(title, category, location)
      `)
      .in("status", ["forming", "active"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching circles:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    
    const { data: userCircles } = await supabase
      .from("circle_members")
      .select("circle_id")
      .eq("user_id", user.id);

    const userCircleIds = userCircles?.map((uc) => uc.circle_id) || [];
    const availableCircles = circles?.filter(
      (c) => !userCircleIds.includes(c.id)
    ) || [];

    return NextResponse.json({ success: true, circles: availableCircles });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}