import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(
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

    
    const { data: circle, error: circleError } = await supabase
      .from("circles")
      .select("*, members:circle_members(count)")
      .eq("id", params.id)
      .single();

    if (circleError || !circle) {
      return NextResponse.json(
        { error: "Circle not found" },
        { status: 404 }
      );
    }

    const currentMembers = circle.members[0]?.count || 0;
    if (currentMembers >= circle.max_members) {
      return NextResponse.json(
        { error: "Circle is full" },
        { status: 400 }
      );
    }

    
    const { data: existingMember } = await supabase
      .from("circle_members")
      .select("*")
      .eq("circle_id", params.id)
      .eq("user_id", user.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: "Already a member of this circle" },
        { status: 400 }
      );
    }

    
    const { data: newMember, error: joinError } = await supabase
      .from("circle_members")
      .insert({
        circle_id: params.id,
        user_id: user.id,
        role: "member",
      })
      .select()
      .single();

    if (joinError) {
      console.error("Error joining circle:", joinError);
      return NextResponse.json(
        { error: joinError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined circle",
      member: newMember,
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}