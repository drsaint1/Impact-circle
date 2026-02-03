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
  Send,
  BarChart3,
  Zap,
  Sparkles,
  Upload,
  X,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";

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
  const { toasts, toast, removeToast } = useToast();
  const [circle, setCircle] = useState<CircleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activities" | "members" | "chat">("activities");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [showImpactModal, setShowImpactModal] = useState(false);
  const [impactMetrics, setImpactMetrics] = useState({
    peopleHelped: 0,
    hoursContributed: 0,
    customMetric: "",
    customValue: 0,
  });
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [submittingImpact, setSubmittingImpact] = useState(false);

  const [actionPlan, setActionPlan] = useState<any>(null);
  const [loadingActionPlan, setLoadingActionPlan] = useState(false);

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
    type: "event" as "event" | "task" | "meeting" | "milestone",
    scheduled_date: "",
  });
  const [creatingActivity, setCreatingActivity] = useState(false);

  const [completingActivity, setCompletingActivity] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [completionImpact, setCompletionImpact] = useState({
    peopleHelped: 0,
    hoursContributed: 0,
  });

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Limit to 3 images
    const maxImages = 3;
    if (evidenceImages.length + files.length > maxImages) {
      toast.warning(`Maximum ${maxImages} images allowed`);
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.warning(`Image ${file.name} is too large. Maximum 5MB per image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEvidenceImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setEvidenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleReportImpact = async () => {
    if (impactMetrics.peopleHelped === 0 && impactMetrics.hoursContributed === 0) {
      toast.warning("Please enter at least one metric");
      return;
    }

    setSubmittingImpact(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      const metrics: Record<string, number> = {
        peopleHelped: impactMetrics.peopleHelped,
        hoursContributed: impactMetrics.hoursContributed,
      };

      if (impactMetrics.customMetric && impactMetrics.customValue > 0) {
        metrics[impactMetrics.customMetric] = impactMetrics.customValue;
      }

      const response = await fetch(`/api/circles/${params.id}/impact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reportedMetrics: metrics,
          evidenceImages: evidenceImages, // Include images for AI validation
        }),
      });

      const result = await response.json();

      if (result.success && result.validation) {
        const confidence = Math.round(result.validation.confidence * 100);
        toast.success(`✅ Impact validated! AI Confidence: ${confidence}%`);

        if (result.validation.flags && result.validation.flags.length > 0) {
          toast.warning(`Note: ${result.validation.feedback}`);
        }

        setShowImpactModal(false);
        setImpactMetrics({
          peopleHelped: 0,
          hoursContributed: 0,
          customMetric: "",
          customValue: 0,
        });
      } else {
        toast.error(result.error || "Failed to validate impact");
      }
    } catch (error) {
      console.error("Error reporting impact:", error);
      toast.error("Failed to report impact. Please try again.");
    } finally {
      setSubmittingImpact(false);
    }
  };

  const handleGetActionPlan = async () => {
    setLoadingActionPlan(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      const response = await fetch(`/api/circles/${params.id}/plan-activities`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.actionPlan) {
        setActionPlan(result.actionPlan);
        toast.success("AI Action Plan generated!");
      } else {
        toast.error(result.error || "Failed to generate action plan");
      }
    } catch (error) {
      console.error("Error getting action plan:", error);
      toast.error("Failed to get action plan. Please try again.");
    } finally {
      setLoadingActionPlan(false);
    }
  };

  const handleCreateActivity = async () => {
    if (!activityForm.title || !activityForm.description) {
      toast.warning("Please fill in all required fields");
      return;
    }

    setCreatingActivity(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      const response = await fetch(`/api/circles/${params.id}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(activityForm),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Activity created successfully!");
        setShowActivityModal(false);
        setActivityForm({
          title: "",
          description: "",
          type: "event",
          scheduled_date: "",
        });
        await loadCircleDetails();
      } else {
        toast.error(result.error || "Failed to create activity");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      toast.error("Failed to create activity. Please try again.");
    } finally {
      setCreatingActivity(false);
    }
  };

  const handleCompleteActivity = async () => {
    if (!selectedActivity) return;

    setCompletingActivity(selectedActivity.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      const response = await fetch(`/api/circles/${params.id}/activities`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          activity_id: selectedActivity.id,
          status: "completed",
          impact: completionImpact,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Activity completed! Impact has been recorded.");
        setShowCompleteModal(false);
        setSelectedActivity(null);
        setCompletionImpact({ peopleHelped: 0, hoursContributed: 0 });
        await loadCircleDetails();
      } else {
        toast.error(result.error || "Failed to complete activity");
      }
    } catch (error) {
      console.error("Error completing activity:", error);
      toast.error("Failed to complete activity. Please try again.");
    } finally {
      setCompletingActivity(null);
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
              <button
                onClick={() => setShowActivityModal(true)}
                className="btn btn-primary w-full sm:w-auto mb-4"
              >
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
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          activity.status === "completed" ? "badge-success" :
                          activity.status === "in-progress" ? "badge-primary" :
                          "badge-warning"
                        }`}>
                          {activity.status.replace("-", " ")}
                        </span>
                        {isMember && activity.status !== "completed" && (
                          <button
                            onClick={() => {
                              setSelectedActivity(activity);
                              setShowCompleteModal(true);
                            }}
                            className="btn bg-success-600 text-white hover:bg-success-700 text-xs py-1 px-3"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {activity.scheduled_date ? new Date(activity.scheduled_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }) : "No date set"}
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
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
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

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowImpactModal(true)}
              className="btn bg-success-600 text-white hover:bg-success-700 flex-1"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Report Impact
            </button>
            <button
              onClick={handleGetActionPlan}
              disabled={loadingActionPlan}
              className="btn bg-primary-600 text-white hover:bg-primary-700 flex-1"
            >
              {loadingActionPlan ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get AI Action Plan
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {isMember && actionPlan && (
        <div className="card bg-gradient-to-br from-purple-50 to-primary-50 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-purple-600" />
            <h2 className="heading-3">AI-Powered Action Plan</h2>
          </div>

          {/* Phases */}
          <div className="space-y-6">
            {actionPlan.phases && actionPlan.phases.map((phase: any, phaseIdx: number) => (
              <div key={phaseIdx} className="bg-white rounded-lg p-5 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{phase.name}</h3>
                  <span className="badge badge-primary">{phase.duration}</span>
                </div>

                <div className="space-y-3">
                  {phase.activities && phase.activities.map((activity: any, actIdx: number) => (
                    <div key={actIdx} className="pl-4 border-l-2 border-purple-300">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                              {activity.type}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {activity.estimatedHours}h
                            </span>
                            {activity.assignedRoles && activity.assignedRoles.map((role: string, roleIdx: number) => (
                              <span key={roleIdx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Milestones */}
          {actionPlan.milestones && actionPlan.milestones.length > 0 && (
            <div className="mt-6 bg-white rounded-lg p-5 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Key Milestones
              </h3>
              <div className="space-y-3">
                {actionPlan.milestones.map((milestone: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-700">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      <span className="text-xs text-purple-600 mt-1 inline-block">Target: {milestone.targetDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="heading-2 mb-4">Create New Activity</h2>
            <p className="text-sm text-gray-600 mb-6">
              Plan an activity for your circle to work on together.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Title *
                </label>
                <input
                  type="text"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({
                    ...activityForm,
                    title: e.target.value
                  })}
                  className="input w-full"
                  placeholder="e.g., Community Cleanup Day"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({
                    ...activityForm,
                    description: e.target.value
                  })}
                  className="input w-full"
                  rows={3}
                  placeholder="Describe what you'll do..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Type
                </label>
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({
                    ...activityForm,
                    type: e.target.value as any
                  })}
                  className="input w-full"
                >
                  <option value="event">Event</option>
                  <option value="task">Task</option>
                  <option value="meeting">Meeting</option>
                  <option value="milestone">Milestone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={activityForm.scheduled_date}
                  onChange={(e) => setActivityForm({
                    ...activityForm,
                    scheduled_date: e.target.value
                  })}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowActivityModal(false);
                  setActivityForm({
                    title: "",
                    description: "",
                    type: "event",
                    scheduled_date: "",
                  });
                }}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1"
                disabled={creatingActivity}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateActivity}
                disabled={creatingActivity}
                className="btn btn-primary flex-1"
              >
                {creatingActivity ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Activity
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="heading-2 mb-4">Complete Activity</h2>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{selectedActivity.title}</strong>
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Record the impact this activity had on your community.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  People Helped
                </label>
                <input
                  type="number"
                  min="0"
                  value={completionImpact.peopleHelped || ""}
                  onChange={(e) => setCompletionImpact({
                    ...completionImpact,
                    peopleHelped: Number(e.target.value)
                  })}
                  className="input w-full"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours Contributed
                </label>
                <input
                  type="number"
                  min="0"
                  value={completionImpact.hoursContributed || ""}
                  onChange={(e) => setCompletionImpact({
                    ...completionImpact,
                    hoursContributed: Number(e.target.value)
                  })}
                  className="input w-full"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedActivity(null);
                  setCompletionImpact({ peopleHelped: 0, hoursContributed: 0 });
                }}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1"
                disabled={!!completingActivity}
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteActivity}
                disabled={!!completingActivity}
                className="btn btn-success flex-1"
              >
                {completingActivity ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete Activity
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImpactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="heading-2 mb-4">Report Your Impact</h2>
            <p className="text-sm text-gray-600 mb-6">
              Share the results of your circle's activities. Our AI will validate the metrics.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  People Helped
                </label>
                <input
                  type="number"
                  min="0"
                  value={impactMetrics.peopleHelped || ""}
                  onChange={(e) => setImpactMetrics({
                    ...impactMetrics,
                    peopleHelped: Number(e.target.value)
                  })}
                  className="input w-full"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours Contributed
                </label>
                <input
                  type="number"
                  min="0"
                  value={impactMetrics.hoursContributed || ""}
                  onChange={(e) => setImpactMetrics({
                    ...impactMetrics,
                    hoursContributed: Number(e.target.value)
                  })}
                  className="input w-full"
                  placeholder="0"
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Metric (Optional)
                </label>
                <input
                  type="text"
                  value={impactMetrics.customMetric}
                  onChange={(e) => setImpactMetrics({
                    ...impactMetrics,
                    customMetric: e.target.value
                  })}
                  className="input w-full mb-3"
                  placeholder="e.g., Trees Planted, Books Donated"
                />
                <input
                  type="number"
                  min="0"
                  value={impactMetrics.customValue || ""}
                  onChange={(e) => setImpactMetrics({
                    ...impactMetrics,
                    customValue: Number(e.target.value)
                  })}
                  className="input w-full"
                  placeholder="Value"
                  disabled={!impactMetrics.customMetric}
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Evidence Images (Optional but Recommended)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload photos showing your impact for AI verification. Maximum 3 images, 5MB each.
                </p>

                {evidenceImages.length < 3 && (
                  <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">Click to upload images</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {evidenceImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {evidenceImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowImpactModal(false);
                  setImpactMetrics({
                    peopleHelped: 0,
                    hoursContributed: 0,
                    customMetric: "",
                    customValue: 0,
                  });
                  setEvidenceImages([]);
                }}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1"
                disabled={submittingImpact}
              >
                Cancel
              </button>
              <button
                onClick={handleReportImpact}
                disabled={submittingImpact}
                className="btn btn-primary flex-1"
              >
                {submittingImpact ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Submit for AI Validation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}