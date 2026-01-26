import { NextRequest, NextResponse } from "next/server";
import { skillMatcherAgent } from "@/lib/ai/agents";
import { initOpikServer } from "@/lib/opik/server";
import type { User, CommunityIssue } from "@/types";


initOpikServer();

export async function POST(request: NextRequest) {
  try {
    const { user, issues } = await request.json();

    console.log("🎯 Matching API called");
    console.log("User ID:", user?.id);
    console.log("User skills:", user?.skills);
    console.log("Issues count:", issues?.length);

    if (!user || !issues) {
      console.error("❌ Missing data - user:", !!user, "issues:", !!issues);
      return NextResponse.json(
        { success: false, error: "Missing user or issues data" },
        { status: 400 }
      );
    }

    if (!user.skills || user.skills.length === 0) {
      console.error("❌ User has no skills");
      return NextResponse.json(
        { success: false, error: "User profile must have skills for AI matching" },
        { status: 400 }
      );
    }

    console.log("✅ Calling Skill Matcher Agent...");

    
    const result = await skillMatcherAgent.matchUserToIssues(
      user as User,
      issues as CommunityIssue[],
      5 
    );

    console.log("✅ Agent returned:", result.success ? "Success" : "Failed");
    console.log("Matches count:", result.data?.length || 0);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌ Matching API error:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate matches",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}