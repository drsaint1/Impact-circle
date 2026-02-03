"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import {
  TrendingUp,
  Users,
  Heart,
  Clock,
  Award,
  Target,
  Calendar,
  CheckCircle,
  BarChart3,
  Zap,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface CircleImpact {
  id: string;
  name: string;
  status: string;
  impact_metrics: {
    peopleHelped?: number;
    hoursContributed?: number;
    [key: string]: number | undefined;
  };
  activities: Array<{
    id: string;
    title: string;
    status: string;
    scheduled_date: string;
  }>;
  members: Array<{ count: number }>;
}

interface UserStats {
  totalHours: number;
  totalPeopleHelped: number;
  activeCircles: number;
  completedActivities: number;
  impactScore: number;
}

export default function ImpactPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [circles, setCircles] = useState<CircleImpact[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalHours: 0,
    totalPeopleHelped: 0,
    activeCircles: 0,
    completedActivities: 0,
    impactScore: 0,
  });

  useEffect(() => {
    loadImpactData();
  }, [user]);

  const loadImpactData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No active session");
        setLoading(false);
        return;
      }

      const [circlesResponse, statsResponse] = await Promise.all([
        fetch("/api/circles/my-circles", {
          headers: { "Authorization": `Bearer ${session.access_token}` },
        }),
        fetch("/api/users/dashboard-stats", {
          headers: { "Authorization": `Bearer ${session.access_token}` },
        }),
      ]);

      if (circlesResponse.ok) {
        const circlesData = await circlesResponse.json();
        setCircles(circlesData.circles || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error loading impact data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const customMetrics: { label: string; value: number }[] = [];
  circles.forEach((circle) => {
    if (circle.impact_metrics) {
      Object.entries(circle.impact_metrics).forEach(([key, value]) => {
        if (key !== "peopleHelped" && key !== "hoursContributed" && value) {
          const existing = customMetrics.find((m) => m.label === key);
          if (existing) {
            existing.value += value;
          } else {
            customMetrics.push({ label: key, value });
          }
        }
      });
    }
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-8 h-8" />
          <h1 className="heading-1">Your Impact Dashboard</h1>
        </div>
        <p className="text-lg text-primary-100">
          Track the real difference you're making in {profile?.location?.city || "your community"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Total Hours"
          value={stats.totalHours}
          color="primary"
          suffix=" hrs"
        />
        <StatCard
          icon={<Heart className="w-6 h-6" />}
          label="People Helped"
          value={stats.totalPeopleHelped}
          color="danger"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Activities Completed"
          value={stats.completedActivities}
          color="success"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          label="Impact Score"
          value={stats.impactScore}
          color="warning"
        />
      </div>

      {customMetrics.length > 0 && (
        <div className="card bg-gradient-to-br from-purple-50 to-primary-50 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <h2 className="heading-3">Additional Impact Metrics</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {customMetrics.map((metric, idx) => (
              <div key={idx} className="text-center p-4 bg-white rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {metric.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {metric.label.replace(/([A-Z])/g, " $1").trim()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-primary-600" />
          <h2 className="heading-3">Impact by Circle</h2>
        </div>

        {circles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">You haven't joined any circles yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Join a circle to start tracking your impact
            </p>
            <Link href="/discover" className="btn btn-primary">
              <Target className="w-5 h-5 mr-2" />
              Discover Opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {circles.map((circle) => {
              const completedActivities = circle.activities?.filter(
                (a) => a.status === "completed"
              ).length || 0;
              const totalActivities = circle.activities?.length || 0;
              const peopleHelped = circle.impact_metrics?.peopleHelped || 0;
              const hours = circle.impact_metrics?.hoursContributed || 0;

              return (
                <div
                  key={circle.id}
                  className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {circle.name}
                        </h3>
                        <span
                          className={`badge ${
                            circle.status === "active"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {circle.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="text-xl font-bold text-primary-600">
                            {completedActivities}/{totalActivities}
                          </div>
                          <div className="text-xs text-gray-600">Activities</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="text-xl font-bold text-danger-600">
                            {peopleHelped}
                          </div>
                          <div className="text-xs text-gray-600">People Helped</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="text-xl font-bold text-success-600">
                            {hours}
                          </div>
                          <div className="text-xs text-gray-600">Hours</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="text-xl font-bold text-warning-600">
                            {circle.members?.[0]?.count || 0}
                          </div>
                          <div className="text-xs text-gray-600">Members</div>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/circles/${circle.id}`}
                      className="btn bg-primary-600 text-white hover:bg-primary-700 whitespace-nowrap"
                    >
                      View Details
                      <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card bg-gradient-to-br from-success-50 to-primary-50 border-2 border-success-200">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-success-600" />
          <h2 className="heading-3">Keep the Momentum Going!</h2>
        </div>
        <p className="text-gray-700 mb-4">
          You're making a real difference in your community. Here's how you can increase your impact:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/discover"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-success-200 hover:border-success-300 transition-all"
          >
            <Target className="w-5 h-5 text-success-600" />
            <div>
              <div className="font-semibold text-gray-900">Find New Issues</div>
              <div className="text-sm text-gray-600">Discover more ways to help</div>
            </div>
          </Link>
          <Link
            href="/circles"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-success-200 hover:border-success-300 transition-all"
          >
            <Users className="w-5 h-5 text-success-600" />
            <div>
              <div className="font-semibold text-gray-900">Join More Circles</div>
              <div className="text-sm text-gray-600">Expand your network</div>
            </div>
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
        {(value || 0).toLocaleString()}
        {suffix}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
