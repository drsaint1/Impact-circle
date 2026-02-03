"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Heart,
  Clock,
  Sparkles,
  ArrowRight,
  Target,
  Award,
  Brain,
  Zap,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

interface DashboardStats {
  totalHours: number;
  activeCircles: number;
  peopleHelped: number;
  impactScore: number;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalHours: 0,
    activeCircles: 0,
    peopleHelped: 0,
    impactScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadAIInsights();
  }, []);

  const loadAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const [insightsRes, engagementRes] = await Promise.all([
        fetch("/api/insights/comprehensive", {
          method: "POST",
          headers: { "Authorization": `Bearer ${session.access_token}` },
        }),
        fetch("/api/engagement/check", {
          method: "POST",
          headers: { "Authorization": `Bearer ${session.access_token}` },
        }),
      ]);

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setAiInsights(data.insights);
      }

      if (engagementRes.ok) {
        const data = await engagementRes.json();
        setEngagement(data.engagement);
      }
    } catch (error) {
      console.error("Error loading AI insights:", error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No active session");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/users/dashboard-stats", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error("Failed to load dashboard stats:", await response.text());
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 lg:p-8 text-white">
        <h1 className="heading-1 mb-2">
          Welcome back, {profile?.fullName?.split(" ")[0]}! 👋
        </h1>
        <p className="text-lg text-primary-100 mb-6">
          You&apos;re making a real difference in {profile?.location.city}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/discover" className="btn bg-white text-primary-600 hover:bg-gray-100">
            <Sparkles className="w-5 h-5 mr-2" />
            Discover Opportunities
          </Link>
          <Link href="/circles" className="btn bg-primary-700 text-white hover:bg-primary-800">
            <Users className="w-5 h-5 mr-2" />
            My Circles
          </Link>
        </div>
      </div>

      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Hours Contributed"
          value={stats.totalHours}
          color="primary"
          suffix=" hrs"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Active Circles"
          value={stats.activeCircles}
          color="success"
        />
        <StatCard
          icon={<Heart className="w-6 h-6" />}
          label="People Helped"
          value={stats.peopleHelped}
          color="danger"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          label="Impact Score"
          value={stats.impactScore}
          color="warning"
        />
      </div>

      
      <div className="card">
        <h2 className="heading-3 mb-4">Quick Actions</h2>
        <div className="grid gap-3">
          <QuickActionButton
            icon={<Target className="w-5 h-5" />}
            title="Find New Opportunities"
            description="Get AI-matched to local issues"
            href="/discover"
            color="primary"
          />
          <QuickActionButton
            icon={<Users className="w-5 h-5" />}
            title="Join an Action Circle"
            description="Connect with others making impact"
            href="/circles"
            color="success"
          />
          <QuickActionButton
            icon={<TrendingUp className="w-5 h-5" />}
            title="View Your Impact"
            description="See the difference you've made"
            href="/impact"
            color="purple"
          />
        </div>
      </div>

      {/* AI Insights & Engagement */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Insights - Master Coordinator Agent */}
        <div className="card bg-gradient-to-br from-purple-50 to-primary-50 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="heading-3">AI Insights</h2>
                <p className="text-xs text-gray-600">Master Coordinator Agent</p>
              </div>
            </div>
            <button
              onClick={loadAIInsights}
              disabled={loadingInsights}
              className="btn btn-sm bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              {loadingInsights ? "Loading..." : "Refresh"}
            </button>
          </div>
          {!loadingInsights && aiInsights ? (
            <div>
              {aiInsights.personalizedRecommendations && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                    <Lightbulb className="w-4 h-4" />
                    For You
                  </h4>
                  <ul className="space-y-2">
                    {aiInsights.personalizedRecommendations.slice(0, 3).map((rec: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-purple-300">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiInsights.impactOpportunities && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Impact Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {aiInsights.impactOpportunities.slice(0, 2).map((opp: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-purple-300">
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">Get personalized insights from AI</p>
              <button
                onClick={loadAIInsights}
                disabled={loadingInsights}
                className="btn btn-sm bg-purple-600 text-white hover:bg-purple-700"
              >
                {loadingInsights ? "Loading..." : "Get Insights"}
              </button>
            </div>
          )}
        </div>

        {/* Engagement Status - Engagement Coach Agent */}
        <div className={`card border-2 ${
          engagement?.status === 'at_risk'
            ? 'bg-warning-50 border-warning-300'
            : engagement?.status === 'declining'
            ? 'bg-orange-50 border-orange-300'
            : 'bg-success-50 border-success-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {engagement?.status === 'at_risk' || engagement?.status === 'declining' ? (
                <AlertCircle className="w-6 h-6 text-warning-600" />
              ) : (
                <Zap className="w-6 h-6 text-success-600" />
              )}
              <div>
                <h2 className="heading-3">Engagement Check</h2>
                <p className="text-xs text-gray-600">Engagement Coach Agent</p>
              </div>
            </div>
            <button
              onClick={loadAIInsights}
              disabled={loadingInsights}
              className="btn btn-sm bg-white text-gray-700 hover:bg-gray-100"
            >
              {loadingInsights ? "Checking..." : "Check Now"}
            </button>
          </div>
          {!loadingInsights && engagement ? (
            <div>
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  engagement.status === 'at_risk'
                    ? 'bg-warning-100 text-warning-800'
                    : engagement.status === 'declining'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-success-100 text-success-800'
                }`}>
                  {engagement.status === 'at_risk' ? '⚠️ Needs Attention' :
                   engagement.status === 'declining' ? '📉 Declining' :
                   '✅ Active'}
                </span>
              </div>
              {engagement.suggestions && engagement.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Suggestions:</h4>
                  <ul className="space-y-2">
                    {engagement.suggestions.slice(0, 3).map((sug: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-success-600 mt-0.5">•</span>
                        {sug}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">Check your engagement status</p>
              <button
                onClick={loadAIInsights}
                disabled={loadingInsights}
                className="btn btn-sm bg-success-600 text-white hover:bg-success-700"
              >
                {loadingInsights ? "Checking..." : "Check Now"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="heading-3 mb-4">Your Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile?.skills.slice(0, 6).map((skill) => (
              <span key={skill} className="badge badge-primary">
                {skill}
              </span>
            ))}
            {profile?.skills && profile.skills.length > 6 && (
              <span className="badge badge-gray">
                +{profile.skills.length - 6} more
              </span>
            )}
          </div>
          <Link
            href="/profile"
            className="text-sm text-primary-600 hover:text-primary-700 mt-4 inline-flex items-center gap-1"
          >
            Update skills
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="card">
          <h2 className="heading-3 mb-4">Your Interests</h2>
          <div className="flex flex-wrap gap-2">
            {profile?.interests.map((interest) => (
              <span key={interest} className="badge badge-success">
                {interest}
              </span>
            ))}
          </div>
          <Link
            href="/profile"
            className="text-sm text-primary-600 hover:text-primary-700 mt-4 inline-flex items-center gap-1"
          >
            Update interests
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  suffix = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "primary" | "success" | "danger" | "warning";
  suffix?: string;
}) {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-600",
    success: "bg-success-100 text-success-600",
    danger: "bg-danger-100 text-danger-600",
    warning: "bg-warning-100 text-warning-600",
  };

  return (
    <div className="card">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-3`}>
        {icon}
      </div>
      <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
        {value}
        {suffix}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function QuickActionButton({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  const colorClasses = {
    primary: "bg-primary-50 text-primary-600 hover:bg-primary-100",
    success: "bg-success-50 text-success-600 hover:bg-success-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  }[color];

  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
    >
      <div className={`p-3 rounded-lg ${colorClasses}`}>{icon}</div>
      <div className="flex-1">
        <div className="font-semibold text-gray-900 mb-1">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <ArrowRight className="w-5 h-5 text-gray-400" />
    </Link>
  );
}