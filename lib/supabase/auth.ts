import { supabase } from "./client";
import type { User } from "@/types";

export const authHelpers = {
  async signUp(email: string, password: string, userData: Partial<User>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;

    // User profile is automatically created by database trigger
    // No need to manually insert into users table

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    // Transform database snake_case to TypeScript camelCase
    return {
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
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    // Transform camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
    if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
    if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
    if (updates.profileImage !== undefined) dbUpdates.profile_image = updates.profileImage;

    const { data, error } = await supabase
      .from("users")
      .update(dbUpdates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    // Transform response back to camelCase
    return {
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
  },
};
