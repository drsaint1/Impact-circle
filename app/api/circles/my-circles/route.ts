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

    
    const { data: memberCircles, error: memberError } = await supabase
      .from("circle_members")
      .select("circle_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (memberError) {
      console.error("Error fetching member circles:", memberError);
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    if (!memberCircles || memberCircles.length === 0) {
      return NextResponse.json({ success: true, circles: [] });
    }

    const circleIds = memberCircles.map((mc) => mc.circle_id);

    
    const { data: circles, error: circlesError } = await supabase
      .from("circles")
      .select(`
        *,
        members:circle_members(count),
        issue:issues(title, category, location)
      `)
      .in("id", circleIds);

    if (circlesError) {
      console.error("Error fetching circles:", circlesError);
      return NextResponse.json({ error: circlesError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, circles: circles || [] });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}