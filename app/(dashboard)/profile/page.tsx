"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { User, MapPin, Briefcase, Heart, Clock, Save, Loader2 } from "lucide-react";
import { commonSkills } from "@/lib/data/demo-data";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [city, setCity] = useState(profile?.location.city || "");
  const [state, setState] = useState(profile?.location.state || "");
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [hoursPerWeek, setHoursPerWeek] = useState(profile?.availability.hoursPerWeek || 5);
  const [customSkill, setCustomSkill] = useState("");

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Session expired. Please sign in again.");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/users/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          location: { city, state },
          skills,
          interests,
          availability: {
            ...profile?.availability,
            hoursPerWeek,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      await refreshProfile();
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(profile?.fullName || "");
    setCity(profile?.location.city || "");
    setState(profile?.location.state || "");
    setSkills(profile?.skills || []);
    setInterests(profile?.interests || []);
    setHoursPerWeek(profile?.availability.hoursPerWeek || 5);
    setEditing(false);
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-4xl">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="heading-1 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn btn-primary w-full sm:w-auto"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="btn btn-secondary flex-1 sm:flex-none"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-success flex-1 sm:flex-none"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save
                </>
              )}
            </button>
          </div>
        )}
      </div>

      
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="heading-3">Basic Information</h2>
        </div>

        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            {editing ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                placeholder="Your name"
              />
            ) : (
              <p className="text-gray-900">{profile?.fullName}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <p className="text-gray-900">{profile?.email}</p>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </div>

      
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-success-600" />
          </div>
          <h2 className="heading-3">Location</h2>
        </div>

        {editing ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input"
                placeholder="San Francisco"
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="select"
              >
                <option value="">Select state</option>
                {US_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <p className="text-gray-900">
            {profile?.location.city}, {profile?.location.state}
          </p>
        )}
      </div>

      
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-warning-600" />
          </div>
          <h2 className="heading-3">Skills</h2>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {commonSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    skills.includes(skill)
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                className="input flex-1"
                placeholder="Add custom skill..."
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="btn btn-secondary whitespace-nowrap"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile?.skills.map((skill) => (
              <span key={skill} className="badge badge-primary">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="heading-3">Availability</h2>
        </div>

        {editing ? (
          <div className="form-group">
            <label className="form-label">
              Hours per week: <span className="text-primary-600 font-semibold">{hoursPerWeek}</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 hr</span>
              <span>20 hrs</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-900">{profile?.availability.hoursPerWeek} hours per week</p>
        )}
      </div>
    </div>
  );
}