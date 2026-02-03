import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: issues, error } = await supabase
      .from("issues")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching issues:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const transformedIssues = issues?.map(issue => ({
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
    })) || [];

    return NextResponse.json({ success: true, issues: transformedIssues });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const issueData = await request.json();

    const { data, error } = await supabase
      .from("issues")
      .insert({
        ...issueData,
        created_by: user.id,
        status: "active",
        ai_generated: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating issue:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: circleData, error: circleError } = await supabase
      .from("circles")
      .insert({
        issue_id: data.id,
        name: `${issueData.title} - Action Circle`,
        description: `Working together to address: ${issueData.title}`,
        goal: `Successfully resolve this community issue through collaborative action`,
        max_members: issueData.volunteers_needed || 10,
        status: "forming",
        created_by: user.id,
      })
      .select()
      .single();

    if (circleError) {
      console.warn("Circle creation failed, but issue created:", circleError);
    } else {
      await supabase.from("circle_members").insert({
        circle_id: circleData.id,
        user_id: user.id,
        role: "leader",
      });
    }

    return NextResponse.json({ success: true, issue: data, circle: circleData });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}