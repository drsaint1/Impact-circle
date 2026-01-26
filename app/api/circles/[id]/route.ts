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

    
    const { data: circle, error } = await supabase
      .from("circles")
      .select(`
        *,
        issue:issues(title, category, location),
        members:circle_members(
          user_id,
          role,
          joined_at,
          user:users(full_name, email)
        ),
        activities:activities(
          id,
          title,
          description,
          scheduled_date,
          status,
          created_at
        )
      `)
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching circle:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, circle });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}