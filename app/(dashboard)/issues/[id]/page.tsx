"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import {
  MapPin,
  Users,
  Clock,
  Target,
  TrendingUp,
  ArrowLeft,
  Loader2,
  Heart,
  Calendar,
  Sparkles,
} from "lucide-react";
import type { CommunityIssue } from "@/types";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { toasts, toast, removeToast } = useToast();
  const [issue, setIssue] = useState<CommunityIssue | null>(null);
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [volunteering, setVolunteering] = useState(false);
  const [showCircleSelect, setShowCircleSelect] = useState(false);

  useEffect(() => {
    loadIssueDetails();
  }, [params.id]);

  const loadIssueDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No active session");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/issues/${params.id}`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIssue(data.issue);
        setCircles(data.circles || []);

        
        if (profile && data.issue && data.issue.skillsNeeded && data.issue.skillsNeeded.length > 0) {
          const matchingSkills = profile.skills.filter((skill: string) =>
            data.issue.skillsNeeded.includes(skill)
          );
          const score = Math.round((matchingSkills.length / data.issue.skillsNeeded.length) * 100);
          setMatchScore(score);
        }
      }
    } catch (error) {
      console.error("Error loading issue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteer = async () => {
    if (!profile) {
      toast.error("Please sign in to volunteer");
      return;
    }

    if (circles.length === 0) {
      toast.warning("No action circles found for this issue yet. This might be an older issue - try creating a new circle to get started!");
      setTimeout(() => {
        router.push(`/circles/create?issueId=${params.id}`);
      }, 1500);
      return;
    }

    if (circles.length === 1) {
      await joinCircle(circles[0].id);
    } else {
      setShowCircleSelect(true);
    }
  };

  const joinCircle = async (circleId: string) => {
    setVolunteering(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      const response = await fetch(`/api/circles/${circleId}/join`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Successfully joined the circle!");
        setShowCircleSelect(false);
        router.push(`/circles/${circleId}`);
      } else {
        toast.error(result.error || "Failed to join circle");
      }
    } catch (error) {
      console.error("Error joining circle:", error);
      toast.error("Failed to join circle. Please try again.");
    } finally {
      setVolunteering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-12">
        <h2 className="heading-2 mb-4">Issue not found</h2>
        <button onClick={() => router.push("/discover")} className="btn btn-primary">
          Back to Discover
        </button>
      </div>
    );
  }

  const urgencyColors = {
    low: "bg-gray-100 text-gray-800 border-gray-300",
    medium: "bg-warning-100 text-warning-800 border-warning-300",
    high: "bg-primary-100 text-primary-800 border-primary-300",
    critical: "bg-danger-100 text-danger-800 border-danger-300",
  };

  const progress = (issue.volunteersJoined / issue.volunteersNeeded) * 100;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 lg:space-y-8 max-w-5xl">
      
      <button
        onClick={() => router.push("/discover")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Discover
      </button>

      
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`badge border-2 ${urgencyColors[issue.urgency]}`}>
            {issue.urgency.toUpperCase()} PRIORITY
          </span>
          <span className="badge badge-primary">{issue.category.replace("-", " ")}</span>
          {matchScore !== null && matchScore > 60 && (
            <span className="badge bg-success-100 text-success-700 border-2 border-success-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {matchScore}% Match
            </span>
          )}
        </div>

        <h1 className="heading-1 mb-4">{issue.title}</h1>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">{issue.description}</p>

        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Location</div>
              <div className="font-medium text-gray-900">
                {issue.location.city}, {issue.location.state}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-warning-600 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Time Needed</div>
              <div className="font-medium text-gray-900">~{issue.estimatedHours} hours</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-success-600 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Volunteers</div>
              <div className="font-medium text-gray-900">
                {issue.volunteersJoined}/{issue.volunteersNeeded}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Target className="w-5 h-5 text-primary-600 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Impact</div>
              <div className="font-medium text-gray-900">
                {circles.reduce((total, circle) => total + (circle.impactMetrics?.peopleHelped || 0), 0) || 50}+ people
              </div>
            </div>
          </div>
        </div>

        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Volunteer Progress</span>
            <span className="text-gray-900 font-semibold">{Math.round(progress)}% filled</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-success-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>


        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleVolunteer}
            disabled={volunteering || !profile}
            className="btn btn-primary flex-1"
          >
            {volunteering ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 mr-2" />
                Volunteer for This Issue
              </>
            )}
          </button>
          <button className="btn btn-secondary">Share</button>
        </div>
      </div>

      
      <div className="card">
        <h2 className="heading-3 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary-600" />
          Skills Needed
        </h2>
        <div className="flex flex-wrap gap-2">
          {issue.skillsNeeded && issue.skillsNeeded.length > 0 ? (
            issue.skillsNeeded.map((skill) => {
              const hasSkill = profile?.skills.includes(skill);
              return (
                <span
                  key={skill}
                  className={`px-4 py-2 rounded-lg font-medium text-sm border-2 ${
                    hasSkill
                      ? "bg-success-50 text-success-700 border-success-300"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {skill}
                  {hasSkill && " ✓"}
                </span>
              );
            })
          ) : (
            <span className="px-4 py-2 rounded-lg font-medium text-sm border-2 bg-gray-50 text-gray-500 border-gray-200 italic">
              No specific skills required
            </span>
          )}
        </div>
        {matchScore !== null && (
          <p className="text-sm text-gray-600 mt-4">
            You have {profile?.skills.filter((s: string) => issue.skillsNeeded.includes(s)).length} out of{" "}
            {issue.skillsNeeded.length} required skills
          </p>
        )}
      </div>

      
      {circles.length > 0 && (
        <div className="card">
          <h2 className="heading-3 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-success-600" />
            Active Circles Working on This
          </h2>
          <div className="space-y-3">
            {circles.map((circle: any) => (
              <div
                key={circle.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors cursor-pointer"
                onClick={() => router.push(`/circles/${circle.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{circle.name}</h3>
                  <span className={`badge ${
                    circle.status === "active" ? "badge-success" : "badge-warning"
                  }`}>
                    {circle.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{circle.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {circle.members?.length || 0}/{circle.max_members} members
                  </span>
                  <span className="text-primary-600 font-medium">Join Circle →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
      <div className="card bg-gradient-to-br from-success-50 to-primary-50">
        <h2 className="heading-3 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-success-600" />
          Expected Impact
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-3xl font-bold text-primary-600 mb-1">
              {circles.reduce((total, circle) => total + (circle.impactMetrics?.peopleHelped || 0), 0) || 50}+
            </div>
            <div className="text-sm text-gray-600">People Helped</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-3xl font-bold text-success-600 mb-1">
              {(issue.estimatedHours || 10) * (issue.volunteersNeeded || 5)}
            </div>
            <div className="text-sm text-gray-600">Total Volunteer Hours</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-3xl font-bold text-warning-600 mb-1">
              Local
            </div>
            <div className="text-sm text-gray-600">Community Reach</div>
          </div>
        </div>
      </div>


      <div className="text-center text-sm text-gray-500">
        <Calendar className="w-4 h-4 inline mr-1" />
        Posted {new Date(issue.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>


      {showCircleSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="heading-2 mb-4">Choose a Circle to Join</h2>
            <p className="text-gray-600 mb-6">
              Multiple circles are working on this issue. Choose which one you&apos;d like to join:
            </p>
            <div className="space-y-3 mb-6">
              {circles.map((circle: any) => (
                <button
                  key={circle.id}
                  onClick={() => joinCircle(circle.id)}
                  disabled={volunteering}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{circle.name}</h3>
                    <span className={`badge ${
                      circle.status === "active" ? "badge-success" : "badge-warning"
                    }`}>
                      {circle.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{circle.description}</p>
                  <div className="text-xs text-gray-500">
                    {circle.members?.length || 0}/{circle.max_members} members
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCircleSelect(false)}
              disabled={volunteering}
              className="btn btn-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}