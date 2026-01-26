import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
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

    const circleData = await request.json();

    
    if (!circleData.name || !circleData.issue_id) {
      return NextResponse.json(
        { error: "Missing required fields: name and issue_id" },
        { status: 400 }
      );
    }

    
    const { data: circle, error: circleError } = await supabase
      .from("circles")
      .insert({
        name: circleData.name,
        description: circleData.description || "",
        goal: circleData.goal || "",
        issue_id: circleData.issue_id,
        max_members: circleData.max_members || 10,
        status: "forming",
        meeting_schedule: circleData.meeting_schedule || {},
        created_by: user.id,
      })
      .select()
      .single();

    if (circleError) {
      console.error("Error creating circle:", circleError);
      return NextResponse.json(
        { error: circleError.message },
        { status: 500 }
      );
    }

    
    const { error: memberError } = await supabase
      .from("circle_members")
      .insert({
        circle_id: circle.id,
        user_id: user.id,
        role: "coordinator",
      });

    if (memberError) {
      console.error("Error adding creator as member:", memberError);
      
    }

    return NextResponse.json({
      success: true,
      circle,
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}