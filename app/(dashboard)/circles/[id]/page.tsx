"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import {
  Users,
  MapPin,
  Calendar,
  Activity,
  MessageCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Target,
  TrendingUp,
  Plus,
  Send
} from "lucide-react";

interface CircleDetails {
  id: string;
  name: string;
  description: string;
  status: string;
  max_members: number;
  meeting_schedule: any;
  created_at: string;
  issue: {
    title: string;
    category: string;
    location: { city: string; state: string };
  };
  members: Array<{
    user_id: string;
    role: string;
    joined_at: string;
    user: {
      full_name: string;
      email: string;
    };
  }>;
  activities: Array<{
    id: string;
    title: string;
    description: string;
    scheduled_date: string;
    status: string;
    created_at: string;
  }>;
}

export default function CircleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [circle, setCircle] = useState<CircleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activities" | "members" | "chat">("activities");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadCircleDetails();
  }, [params.id]);

  const loadCircleDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No active session");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/circles/${params.id}`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCircle(data.circle);
      } else {
        console.error("Failed to load circle details");
      }
    } catch (error) {
      console.error("Error loading circle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCircle = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No active session");
        return;
      }

      const response = await fetch(`/api/circles/${params.id}/join`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        await loadCircleDetails();
      }
    } catch (error) {
      console.error("Error joining circle:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No active session");
        setSendingMessage(false);
        return;
      }

      const response = await fetch(`/api/circles/${params.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="text-center py-12">
        <h2 className="heading-2 mb-4">Circle not found</h2>
        <button onClick={() => router.push("/circles")} className="btn btn-primary">
          Back to Circles
        </button>
      </div>
    );
  }

  const isMember = circle.members.some((m) => m.user_id === user?.id);
  const currentMemberCount = circle.members.length;
  const progressPercentage = (currentMemberCount / circle.max_members) * 100;

  return (
    <div className="space-y-6 lg:space-y-8">
      
      <button
        onClick={() => router.push("/circles")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Circles
      </button>

      
      <div className="card">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`badge ${
                circle.status === "active" ? "badge-success" : "badge-warning"
              }`}>
                {circle.status}
              </span>
              <span className="badge badge-primary">{circle.issue.category}</span>
            </div>

            <h1 className="heading-1 mb-3">{circle.name}</h1>
            <p className="text-gray-600 mb-4">{circle.description}</p>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Target className="w-4 h-4" />
                <span className="font-medium">Issue:</span> {circle.issue.title}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                {circle.issue.location.city}, {circle.issue.location.state}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Meets:</span>{" "}
                {circle.meeting_schedule.frequency} on {circle.meeting_schedule.day}s
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                {circle.meeting_schedule.time}
              </div>
            </div>
          </div>

          
          <div className="w-full lg:w-auto">
            {isMember ? (
              <div className="card bg-success-50 border-2 border-success-200">
                <div className="flex items-center gap-2 text-success-700 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">You're a member</span>
                </div>
                <p className="text-sm text-success-600">
                  Access activities and chat below
                </p>
              </div>
            ) : (
              <button onClick={handleJoinCircle} className="btn btn-primary w-full lg:w-auto">
                <Users className="w-5 h-5 mr-2" />
                Join This Circle
              </button>
            )}

            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Members</span>
                <span className="text-sm text-gray-600">
                  {currentMemberCount}/{circle.max_members}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="card">
        <div className="flex gap-2 border-b border-gray-200 -mx-4 -mt-4 px-4 mb-6">
          <button
            onClick={() => setActiveTab("activities")}
            className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "activities"
                ? "text-primary-600 border-primary-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Activities
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "members"
                ? "text-primary-600 border-primary-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Members ({currentMemberCount})
          </button>
          {isMember && (
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === "chat"
                  ? "text-primary-600 border-primary-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Chat
            </button>
          )}
        </div>

        
        {activeTab === "activities" && (
          <div className="space-y-4">
            {isMember && (
              <button className="btn btn-primary w-full sm:w-auto mb-4">
                <Plus className="w-5 h-5 mr-2" />
                Create New Activity
              </button>
            )}

            {circle.activities.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No activities scheduled yet</p>
                {isMember && (
                  <p className="text-sm text-gray-500 mt-2">
                    Be the first to create an activity!
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {circle.activities.map((activity) => (
                  <div key={activity.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <span className={`badge ${
                        activity.status === "completed" ? "badge-success" :
                        activity.status === "in_progress" ? "badge-primary" :
                        "badge-warning"
                      }`}>
                        {activity.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(activity.scheduled_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        
        {activeTab === "members" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {circle.members.map((member) => (
              <div key={member.user_id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {member.user.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{member.user.full_name}</h4>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  {member.role === "coordinator" && (
                    <span className="badge badge-primary text-xs">Coordinator</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        
        {activeTab === "chat" && isMember && (
          <div>
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No messages yet</p>
                  <p className="text-sm text-gray-500 mt-2">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{msg.sender_name}</span>
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-gray-700">{msg.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="input flex-1"
                disabled={sendingMessage}
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !newMessage.trim()}
                className="btn btn-primary"
              >
                {sendingMessage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      
      {isMember && (
        <div className="card bg-gradient-to-br from-success-50 to-primary-50">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-success-600" />
            <h2 className="heading-3">Circle Impact</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {circle.activities.filter(a => a.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600">Activities Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600 mb-1">
                {currentMemberCount}
              </div>
              <div className="text-sm text-gray-600">Active Volunteers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning-600 mb-1">
                {circle.activities.filter(a => a.status === "planned").length}
              </div>
              <div className="text-sm text-gray-600">Upcoming Activities</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}