import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { impactMeasurementAgent } from "@/lib/ai/agents";

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
        { error: "Unauthorized" },
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

    const { reportedMetrics, evidenceImages } = await request.json();

    const { data: circle } = await supabase
      .from("circles")
      .select("*, issue:issues(*)")
      .eq("id", params.id)
      .single();

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    const validation = await impactMeasurementAgent.validateImpact(
      { id: circle.id, title: circle.name, description: circle.description, type: "circle" } as any,
      reportedMetrics,
      evidenceImages // Pass images to AI for validation
    );

    if (validation.success && validation.data) {
      await supabase
        .from("circles")
        .update({
          impact_metrics: reportedMetrics,
        })
        .eq("id", params.id);

      return NextResponse.json({
        success: true,
        validation: validation.data,
      });
    }

    return NextResponse.json({
      success: false,
      error: validation.error || "Validation failed",
    });
  } catch (error: any) {
    console.error("Impact tracking error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
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

    const { data: circle } = await supabase
      .from("circles")
      .select("*, activities(*)")
      .eq("id", params.id)
      .single();

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    const report = await impactMeasurementAgent.generateReport(
      circle.name,
      circle.activities || [],
      circle.impact_metrics || {
        volunteersEngaged: 0,
        hoursContributed: 0,
        peopleHelped: 0,
        customMetrics: {},
      }
    );

    if (report.success) {
      return NextResponse.json({
        success: true,
        report: report.data,
      });
    }

    return NextResponse.json({
      success: false,
      error: report.error || "Failed to generate report",
    });
  } catch (error: any) {
    console.error("Impact report error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
