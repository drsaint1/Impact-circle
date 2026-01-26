import { NextRequest, NextResponse } from "next/server";
import { communityIntelligenceAgent } from "@/lib/ai/agents";

export async function POST(request: NextRequest) {
  try {
    const { location, interests } = await request.json();

    if (!location || !location.city || !location.state) {
      return NextResponse.json(
        { success: false, error: "Missing location data" },
        { status: 400 }
      );
    }

    
    const result = await communityIntelligenceAgent.discoverIssues(
      location,
      interests
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Discovery API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to discover issues",
      },
      { status: 500 }
    );
  }
}