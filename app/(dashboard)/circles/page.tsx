"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Users,
  Plus,
  MapPin,
  TrendingUp,
  Loader2,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";

interface Circle {
  id: string;
  name: string;
  description: string;
  goal: string;
  members: any[];
  max_members: number;
  status: string;
  issue: {
    title: string;
    category: string;
    location: any;
  };
}

export default function CirclesPage() {
  const { user } = useAuth();
  const { toasts, toast, removeToast } = useToast();
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [availableCircles, setAvailableCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my" | "available">("my");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);

  
  const [circleName, setCircleName] = useState("");
  const [circleDescription, setCircleDescription] = useState("");
  const [circleGoal, setCircleGoal] = useState("");
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [maxMembers, setMaxMembers] = useState(10);

  useEffect(() => {
    loadCircles();
    loadIssues();
  }, []);

  const loadCircles = async () => {
    try {
      
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No active session");
        setLoading(false);
        return;
      }

      const [myResponse, availableResponse] = await Promise.all([
        fetch("/api/circles/my-circles", {
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
          },
        }),
        fetch("/api/circles/available", {
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
          },
        }),
      ]);

      if (myResponse.ok) {
        const data = await myResponse.json();
        setMyCircles(data.circles || []);
      }

      if (availableResponse.ok) {
        const data = await availableResponse.json();
        setAvailableCircles(data.circles || []);
      }
    } catch (error) {
      console.error("Error loading circles:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadIssues = async () => {
    try {
      const response = await fetch("/api/issues/list");
      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues || []);
      }
    } catch (error) {
      console.error("Error loading issues:", error);
    }
  };

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!circleName || !selectedIssueId) {
      toast.warning("Please fill in circle name and select an issue");
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

      const response = await fetch("/api/circles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: circleName,
          description: circleDescription,
          goal: circleGoal,
          issue_id: selectedIssueId,
          max_members: maxMembers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create circle");
      }

      
      setCircleName("");
      setCircleDescription("");
      setCircleGoal("");
      setSelectedIssueId("");
      setMaxMembers(10);
      setShowCreateModal(false);

      
      await loadCircles();
      toast.success("Circle created successfully!");
    } catch (error) {
      console.error("Error creating circle:", error);
      toast.error("Failed to create circle. Please try again.");
    } finally{
      setCreating(false);
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
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="heading-1 mb-2">Action Circles</h1>
          <p className="text-gray-600">
            Join or create circles to make impact together
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Circle
        </button>
      </div>

      
      <div className="bg-white rounded-xl border border-gray-200 p-1 flex">
        <button
          onClick={() => setActiveTab("my")}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            activeTab === "my"
              ? "bg-primary-100 text-primary-700"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Circles ({myCircles.length})
        </button>
        <button
          onClick={() => setActiveTab("available")}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            activeTab === "available"
              ? "bg-primary-100 text-primary-700"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Discover ({availableCircles.length})
        </button>
      </div>

      
      {activeTab === "my" ? (
        myCircles.length > 0 ? (
          <div className="grid gap-4 lg:gap-6">
            {myCircles.map((circle) => (
              <CircleCard key={circle.id} circle={circle} isMember={true} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="heading-3 mb-2">No circles yet</h3>
            <p className="text-gray-600 mb-6">
              Join a circle to start making impact with others
            </p>
            <button
              onClick={() => setActiveTab("available")}
              className="btn btn-primary mx-auto"
            >
              Discover Circles
            </button>
          </div>
        )
      ) : (
        <div className="grid gap-4 lg:gap-6">
          {availableCircles.map((circle) => (
            <CircleCard key={circle.id} circle={circle} isMember={false} />
          ))}
        </div>
      )}

      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="heading-2 mb-6">Create New Action Circle</h2>

            <form onSubmit={handleCreateCircle} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Circle Name *
                </label>
                <input
                  type="text"
                  value={circleName}
                  onChange={(e) => setCircleName(e.target.value)}
                  className="input w-full"
                  placeholder="e.g., Downtown Cleanup Crew"
                  required
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Issue *
                </label>
                <select
                  value={selectedIssueId}
                  onChange={(e) => setSelectedIssueId(e.target.value)}
                  className="input w-full"
                  required
                >
                  <option value="">Choose an issue to address...</option>
                  {issues.map((issue) => (
                    <option key={issue.id} value={issue.id}>
                      {issue.title} - {issue.category}
                    </option>
                  ))}
                </select>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={circleDescription}
                  onChange={(e) => setCircleDescription(e.target.value)}
                  className="input w-full"
                  rows={3}
                  placeholder="What will this circle do?"
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal
                </label>
                <input
                  type="text"
                  value={circleGoal}
                  onChange={(e) => setCircleGoal(e.target.value)}
                  className="input w-full"
                  placeholder="e.g., Clean 10 blocks per month"
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Members: {maxMembers}
                </label>
                <input
                  type="range"
                  min="3"
                  max="50"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(Number(e.target.value))}
                  className="w-full"
                />
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
                      Create Circle
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

function CircleCard({
  circle,
  isMember,
}: {
  circle: Circle;
  isMember: boolean;
}) {
  const progress = (circle.members.length / circle.max_members) * 100;

  return (
    <Link
      href={`/circles/${circle.id}`}
      className="card hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="heading-3">{circle.name}</h3>
            {isMember && (
              <span className="badge badge-success text-xs">Member</span>
            )}
          </div>
          <p className="text-gray-600 mb-3">{circle.description}</p>
          {circle.issue && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="badge badge-primary">{circle.issue.category}</span>
              {circle.issue.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {circle.issue.location.city}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Circle Progress</span>
          <span className="font-medium text-gray-900">
            {circle.members.length}/{circle.max_members} members
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-success-500 to-success-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      
      <div className="mt-4 flex justify-between items-center">
        <span className={`text-sm font-medium ${
          circle.status === "active" ? "text-success-600" : "text-gray-500"
        }`}>
          {circle.status.charAt(0).toUpperCase() + circle.status.slice(1)}
        </span>
        {isMember ? (
          <span className="text-primary-600 font-medium text-sm flex items-center gap-1">
            View Details
            <TrendingUp className="w-4 h-4" />
          </span>
        ) : (
          <button className="btn btn-primary text-sm">Join Circle</button>
        )}
      </div>
    </Link>
  );
}