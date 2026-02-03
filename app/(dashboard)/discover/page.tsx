"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Sparkles, MapPin, Users, Clock, TrendingUp, Filter, Loader2, Plus } from "lucide-react";
import { categories, commonSkills } from "@/lib/data/demo-data";
import type { CommunityIssue, MatchRecommendation } from "@/types";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";

export default function DiscoverPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [matches, setMatches] = useState<MatchRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMatches, setShowMatches] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [issueUrgency, setIssueUrgency] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [volunteersNeeded, setVolunteersNeeded] = useState(5);
  const [hoursNeeded, setHoursNeeded] = useState(10);
  const [issueSkills, setIssueSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const response = await fetch("/api/issues/list");
      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues || []);
      }
    } catch (error) {
      console.error("Error loading issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = selectedCategory === "all"
    ? issues
    : issues.filter(issue => issue.category === selectedCategory);

  const handleGetMatches = async () => {
    console.log("🔍 AI Matching clicked!");
    console.log("Profile:", profile);
    console.log("Issues count:", issues.length);
    console.log("Filtered issues:", filteredIssues.length);

    if (!profile) {
      console.error("❌ No profile found!");
      toast.error("Please complete your profile first to get AI matches");
      return;
    }

    if (!profile.skills || profile.skills.length === 0) {
      console.error("❌ No skills in profile!");
      toast.warning("Please add skills to your profile to get better matches");
      return;
    }

    if (filteredIssues.length === 0) {
      console.error("❌ No issues to match against!");
      toast.error("No issues available. Please create some issues first.");
      return;
    }

    console.log("✅ Starting AI matching...");
    setMatchLoading(true);
    setShowMatches(true);

    try {
      console.log("📤 Sending request to /api/matching/recommend");
      const response = await fetch("/api/matching/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: profile,
          issues: filteredIssues,
        }),
      });

      console.log("📥 Response status:", response.status);
      const result = await response.json();
      console.log("📥 Response data:", result);

      if (result.success && result.data) {
        console.log("✅ Got", result.data.length, "matches!");
        setMatches(result.data);
        toast.success(`Found ${result.data.length} AI-powered matches for you!`);
      } else {
        console.error("❌ No matches returned:", result);
        toast.warning("No matches found. Try adjusting your skills or interests.");
      }
    } catch (error) {
      console.error("❌ Failed to get matches:", error);
      toast.error("Failed to get AI matches. Please try again.");
    } finally {
      setMatchLoading(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!issueTitle || !issueCategory || !issueDescription) {
      toast.warning("Please fill in title, category, and description");
      return;
    }

    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("Session expired. Please sign in again.");
        setCreating(false);
        return;
      }

      const response = await fetch("/api/issues/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: issueTitle,
          description: issueDescription,
          category: issueCategory,
          urgency: issueUrgency,
          location: profile?.location || { city: "", state: "" },
          volunteers_needed: volunteersNeeded,
          volunteers_joined: 0,
          estimated_hours: hoursNeeded,
          skills_needed: issueSkills,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create issue");
      }

      
      setIssueTitle("");
      setIssueDescription("");
      setIssueCategory("");
      setIssueUrgency("medium");
      setVolunteersNeeded(5);
      setHoursNeeded(10);
      setIssueSkills([]);
      setShowCreateModal(false);

      
      await loadIssues();
      toast.success("Issue created successfully!");
    } catch (error) {
      console.error("Error creating issue:", error);
      toast.error("Failed to create issue. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const toggleIssueSkill = (skill: string) => {
    setIssueSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomIssueSkill = () => {
    if (customSkill.trim() && !issueSkills.includes(customSkill.trim())) {
      setIssueSkills([...issueSkills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 lg:space-y-8">

      
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl p-6 lg:p-8">
        <h1 className="heading-1 mb-2 lg:mb-4">Discover Community Issues</h1>
        <p className="text-base lg:text-xl text-primary-100 mb-4 lg:mb-6">
          Find local opportunities where your skills can make real impact
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGetMatches}
            disabled={matchLoading || !profile}
            className="btn bg-white text-primary-600 hover:bg-gray-100 w-full sm:w-auto"
          >
          {matchLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Finding Your Matches...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Get AI-Powered Matches
            </>
          )}
        </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn bg-primary-700 text-white hover:bg-primary-800 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Issue
          </button>
        </div>
      </div>

      
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Filter className="w-5 h-5 text-gray-400 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select w-full sm:max-w-xs"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600">
            {filteredIssues.length} opportunit{filteredIssues.length !== 1 ? "ies" : "y"}
          </span>
        </div>
      </div>

      
      <div>
        {showMatches && matches.length > 0 ? (
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-success-600" />
              <h2 className="heading-2">Your Top Matches</h2>
            </div>
            <div className="grid gap-4 lg:gap-6">
              {matches.map((match) => (
                <MatchCard
                  key={match.issueId}
                  match={match}
                  onClick={() => router.push(`/issues/${match.issueId}`)}
                />
              ))}
            </div>
            <button
              onClick={() => setShowMatches(false)}
              className="btn btn-secondary w-full sm:w-auto"
            >
              Show All Issues
            </button>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onClick={() => router.push(`/issues/${issue.id}`)} />
          ))}
        </div>
      </div>

      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="heading-2 mb-6">Report a Community Issue</h2>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Title *
                </label>
                <input
                  type="text"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  className="input w-full"
                  placeholder="e.g., Need volunteers for park cleanup"
                  required
                />
              </div>

              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="input w-full"
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.filter(c => c.value !== "all").map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency *
                  </label>
                  <select
                    value={issueUrgency}
                    onChange={(e) => setIssueUrgency(e.target.value as any)}
                    className="input w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="input w-full"
                  rows={4}
                  placeholder="Describe the issue and what needs to be done..."
                  required
                />
              </div>

              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volunteers Needed: {volunteersNeeded}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={volunteersNeeded}
                    onChange={(e) => setVolunteersNeeded(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours Needed: {hoursNeeded}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={hoursNeeded}
                    onChange={(e) => setHoursNeeded(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills Needed
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {["Community Organizing", "Physical Labor", "Communication", "Event Planning", "Leadership"].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleIssueSkill(skill)}
                      className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                        issueSkills.includes(skill)
                          ? "bg-primary-100 border-primary-500 text-primary-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add custom skill..."
                    className="input flex-1"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomIssueSkill())}
                  />
                  <button
                    type="button"
                    onClick={addCustomIssueSkill}
                    className="btn btn-secondary"
                  >
                    Add
                  </button>
                </div>
                {issueSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {issueSkills.map((skill) => (
                      <span key={skill} className="badge badge-primary">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Create Issue
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function IssueCard({ issue, onClick }: { issue: CommunityIssue; onClick?: () => void }) {
  const urgencyColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-warning-100 text-warning-800",
    high: "bg-primary-100 text-primary-800",
    critical: "bg-danger-100 text-danger-800",
  };

  return (
    <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-start mb-3">
        <span className={`badge ${urgencyColors[issue.urgency]}`}>
          {issue.urgency.toUpperCase()}
        </span>
        <span className="badge badge-primary">{issue.category.replace("-", " ")}</span>
      </div>

      <h3 className="text-xl font-semibold mb-2">{issue.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{issue.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {issue.location.city}, {issue.location.state}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          ~{issue.estimatedHours} hours
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          {issue.volunteersJoined}/{issue.volunteersNeeded} volunteers
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {issue.skillsNeeded && issue.skillsNeeded.length > 0 ? (
          <>
            {issue.skillsNeeded.slice(0, 3).map((skill) => (
              <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                {skill}
              </span>
            ))}
            {issue.skillsNeeded.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-sm">
                +{issue.skillsNeeded.length - 3} more
              </span>
            )}
          </>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-sm italic">
            No specific skills required
          </span>
        )}
      </div>

      <button onClick={onClick} className="btn btn-primary w-full">
        View Details
      </button>
    </div>
  );
}

function MatchCard({ match, onClick }: { match: MatchRecommendation; onClick?: () => void }) {
  return (
    <div className="card bg-gradient-to-br from-primary-50 to-success-50 border-2 border-primary-200 cursor-pointer hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <span className="text-lg font-bold text-primary-600">
              {match.matchScore}% Match
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-2">{match.issue.title}</h3>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{match.reasoning}</p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="font-semibold text-success-700 mb-2">💪 Your Strengths:</div>
          <ul className="space-y-1">
            {match.strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-gray-700">• {strength}</li>
            ))}
          </ul>
        </div>
        {match.considerations.length > 0 && (
          <div>
            <div className="font-semibold text-primary-700 mb-2">🤔 Consider:</div>
            <ul className="space-y-1">
              {match.considerations.map((consideration, idx) => (
                <li key={idx} className="text-sm text-gray-700">• {consideration}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onClick} className="btn btn-primary flex-1">
          View Details
        </button>
      </div>
    </div>
  );
}