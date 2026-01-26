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

  useEffect(() => {
    loadDashboardData();
  }, []);

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
          You're making a real difference in {profile?.location.city}
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
            href="/profile"
            color="purple"
          />
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