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

    const { title, description, type, scheduled_date } = await request.json();

    if (!title || !description || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from("circle_members")
      .select("*")
      .eq("circle_id", params.id)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: "You must be a member of this circle to create activities" },
        { status: 403 }
      );
    }

    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .insert({
        circle_id: params.id,
        title,
        description,
        type,
        scheduled_date: scheduled_date || null,
        status: "planned",
      })
      .select()
      .single();

    if (activityError) {
      console.error("Error creating activity:", activityError);
      return NextResponse.json(
        { error: "Failed to create activity" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error: any) {
    console.error("Error in activity creation:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const { activity_id, status, impact } = await request.json();

    if (!activity_id) {
      return NextResponse.json(
        { error: "Activity ID required" },
        { status: 400 }
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from("circle_members")
      .select("*")
      .eq("circle_id", params.id)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: "You must be a member of this circle" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (impact) updateData.impact = impact;
    if (status === "completed") updateData.completed_date = new Date().toISOString();

    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .update(updateData)
      .eq("id", activity_id)
      .eq("circle_id", params.id)
      .select()
      .single();

    if (activityError) {
      console.error("Error updating activity:", activityError);
      return NextResponse.json(
        { error: "Failed to update activity" },
        { status: 500 }
      );
    }

    if (status === "completed" && impact) {
      const { data: circle } = await supabase
        .from("circles")
        .select("impact_metrics")
        .eq("id", params.id)
        .single();

      if (circle) {
        const currentMetrics = circle.impact_metrics || {};
        const updatedMetrics = {
          peopleHelped: (currentMetrics.peopleHelped || 0) + (impact.peopleHelped || 0),
          hoursContributed: (currentMetrics.hoursContributed || 0) + (impact.hoursContributed || 0),
          ...Object.keys(impact).reduce((acc, key) => {
            if (key !== 'peopleHelped' && key !== 'hoursContributed') {
              acc[key] = (currentMetrics[key] || 0) + (impact[key] || 0);
            }
            return acc;
          }, {} as any)
        };

        await supabase
          .from("circles")
          .update({ impact_metrics: updatedMetrics })
          .eq("id", params.id);
      }
    }

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error: any) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
