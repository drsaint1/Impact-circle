import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const db = {
  // Users
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    return { data, error };
  },

  async updateUser(userId: string, updates: any) {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    return { data, error };
  },

  // Issues
  async getIssues(filters?: { category?: string; location?: string }) {
    let query = supabase.from("issues").select("*").eq("status", "active");

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.location) {
      query = query.ilike("location->>city", `%${filters.location}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    return { data, error };
  },

  async getIssue(issueId: string) {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("id", issueId)
      .single();
    return { data, error };
  },

  async createIssue(issue: any) {
    const { data, error } = await supabase
      .from("issues")
      .insert(issue)
      .select()
      .single();
    return { data, error };
  },

  // Circles
  async getCircles(userId?: string) {
    let query = supabase.from("circles").select(`
      *,
      members:circle_members(*)
    `);

    if (userId) {
      query = query.contains("members", [{ user_id: userId }]);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    return { data, error };
  },

  async getCircle(circleId: string) {
    const { data, error } = await supabase
      .from("circles")
      .select(`
        *,
        members:circle_members(*),
        activities:activities(*)
      `)
      .eq("id", circleId)
      .single();
    return { data, error };
  },

  async createCircle(circle: any) {
    const { data, error } = await supabase
      .from("circles")
      .insert(circle)
      .select()
      .single();
    return { data, error };
  },

  async joinCircle(circleId: string, userId: string) {
    const { data, error } = await supabase
      .from("circle_members")
      .insert({
        circle_id: circleId,
        user_id: userId,
        role: "member",
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();
    return { data, error };
  },

  // Messages
  async getMessages(circleId: string, limit = 50) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("circle_id", circleId)
      .order("timestamp", { ascending: false })
      .limit(limit);
    return { data: data?.reverse(), error };
  },

  async sendMessage(message: any) {
    const { data, error } = await supabase
      .from("messages")
      .insert(message)
      .select()
      .single();
    return { data, error };
  },

  // Impact tracking
  async getUserImpact(userId: string) {
    const { data, error } = await supabase
      .from("user_impact")
      .select("*")
      .eq("user_id", userId)
      .single();
    return { data, error };
  },

  async updateImpact(circleId: string, metrics: any) {
    const { data, error } = await supabase
      .from("circles")
      .update({ impact_metrics: metrics })
      .eq("id", circleId)
      .select()
      .single();
    return { data, error };
  },
};
