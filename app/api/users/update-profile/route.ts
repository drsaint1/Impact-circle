import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    console.log("=== UPDATE PROFILE API CALLED ===");

    
    const authHeader = request.headers.get("authorization");
    console.log("Auth header present:", !!authHeader);

    if (!authHeader) {
      console.error("No authorization header");
      return NextResponse.json({ error: "Unauthorized - No auth token" }, { status: 401 });
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

    console.log("User from auth:", user ? user.id : "NO USER");

    if (!user) {
      console.error("No user found - invalid token");
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    const updates = await request.json();
    console.log("Received updates:", JSON.stringify(updates, null, 2));

    
    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
    if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
    if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
    if (updates.profileImage !== undefined) dbUpdates.profile_image = updates.profileImage;

    console.log("Transformed to DB format:", JSON.stringify(dbUpdates, null, 2));
    console.log("Updating user ID:", user.id);

    const { data, error } = await supabase
      .from("users")
      .update(dbUpdates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating profile:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return NextResponse.json({
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }

    console.log("Profile updated successfully");

    
    const responseData = {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      location: data.location,
      skills: data.skills || [],
      interests: data.interests || [],
      availability: data.availability || {},
      onboardingCompleted: data.onboarding_completed,
      profileImage: data.profile_image,
      createdAt: data.created_at,
    };

    console.log("Sending success response");
    return NextResponse.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error("API exception:", error);
    console.error("Exception stack:", error.stack);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}