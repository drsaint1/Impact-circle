"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { MapPin, Briefcase, Heart, Clock, ArrowRight, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { commonSkills } from "@/lib/data/demo-data";

const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna",
  "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
];

const NIGERIA_CITIES: Record<string, string[]> = {
  "Lagos": ["Ikeja", "Victoria Island", "Lekki", "Surulere", "Yaba", "Ikoyi", "Ajah", "Maryland", "Festac"],
  "Abuja": ["Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Kubwa", "Lugbe", "Jabi"],
  "Kano": ["Kano Municipal", "Fagge", "Dala", "Gwale", "Tarauni", "Nassarawa"],
  "Ibadan": ["Ibadan North", "Ibadan South", "Egbeda", "Akinyele", "Lagelu", "Ido"],
  "Port Harcourt": ["Port Harcourt", "Obio-Akpor", "Eleme", "Okrika", "Degema"],
  "Benin City": ["Benin City", "Ikpoba-Okha", "Egor", "Oredo", "Ovia"],
  "Kaduna": ["Kaduna North", "Kaduna South", "Zaria", "Kafanchan", "Sabon Gari"],
  "Enugu": ["Enugu East", "Enugu North", "Enugu South", "Nsukka", "Udi"],
  "Abia": ["Aba", "Umuahia", "Ohafia", "Arochukwu"],
  "Akwa Ibom": ["Uyo", "Eket", "Ikot Ekpene", "Oron"],
  "Anambra": ["Awka", "Onitsha", "Nnewi", "Ekwulobia"],
  "Rivers": ["Port Harcourt", "Obio-Akpor", "Eleme", "Okrika"],
  "Ogun": ["Abeokuta", "Ijebu Ode", "Sagamu", "Ota"],
  "Oyo": ["Ibadan", "Ogbomoso", "Oyo", "Iseyin"],
  "Delta": ["Asaba", "Warri", "Sapele", "Ughelli"],
  "Edo": ["Benin City", "Auchi", "Ekpoma", "Uromi"],
  "Imo": ["Owerri", "Orlu", "Okigwe", "Oguta"],
  "FCT": ["Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa"],
};

const CATEGORIES = [
  { value: "environment", label: "Environment", icon: "🌱" },
  { value: "homelessness", label: "Homelessness", icon: "🏠" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "seniors", label: "Seniors", icon: "👴" },
  { value: "youth", label: "Youth", icon: "👶" },
  { value: "health", label: "Health", icon: "⚕️" },
  { value: "food-security", label: "Food Security", icon: "🍽️" },
  { value: "housing", label: "Housing", icon: "🏘️" },
  { value: "community-development", label: "Community", icon: "🤝" },
  { value: "arts-culture", label: "Arts & Culture", icon: "🎨" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = ["Morning (6am-12pm)", "Afternoon (12pm-6pm)", "Evening (6pm-10pm)"];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);

  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    setCity("");
    setAvailableCities(NIGERIA_CITIES[selectedState] || []);
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (profile?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [user, profile, router]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

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

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleDay = (day: string) => {
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleTime = (time: string) => {
    setPreferredTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleComplete = async () => {
    setSaving(true);

    try {
      
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session - please sign in again");
      }

      const response = await fetch("/api/users/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          location: { city, state },
          skills,
          interests,
          availability: {
            hoursPerWeek,
            preferredDays,
            preferredTimes,
          },
          onboardingCompleted: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("API Error Response:", result);
        throw new Error(result.error || "Failed to update profile");
      }

      console.log("Profile updated successfully:", result);
      await refreshProfile();
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      alert(`Failed to save profile: ${error.message}\nCheck console for details.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {step} of 4
            </span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-success-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        
        <div className="card">
          
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <MapPin className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="heading-2 mb-2">Where are you located?</h2>
                <p className="text-gray-600">
                  We&apos;ll match you with local opportunities in your area
                </p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <div className="form-group">
                  <label htmlFor="state" className="form-label">
                    State
                  </label>
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="select"
                    required
                  >
                    <option value="">Select state</option>
                    {NIGERIA_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="city" className="form-label">
                    City/LGA
                  </label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="select"
                    required
                    disabled={!state}
                  >
                    <option value="">
                      {state ? "Select city/LGA" : "Select state first"}
                    </option>
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
                  <Briefcase className="w-8 h-8 text-success-600" />
                </div>
                <h2 className="heading-2 mb-2">What are your skills?</h2>
                <p className="text-gray-600">
                  Select all that apply or add your own
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {commonSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${skills.includes(skill)
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
                    placeholder="Add a custom skill..."
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="btn btn-secondary whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>

                {skills.length > 0 && (
                  <p className="text-sm text-gray-600">
                    {skills.length} skill{skills.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </div>
          )}

          
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-warning-100 rounded-full mb-4">
                  <Heart className="w-8 h-8 text-warning-600" />
                </div>
                <h2 className="heading-2 mb-2">What causes matter to you?</h2>
                <p className="text-gray-600">
                  We&apos;ll prioritize issues you care about
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => toggleInterest(category.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${interests.includes(category.value)
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className="font-medium text-sm">{category.label}</div>
                  </button>
                ))}
              </div>

              {interests.length > 0 && (
                <p className="text-sm text-gray-600 text-center">
                  {interests.length} interest{interests.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="heading-2 mb-2">When can you volunteer?</h2>
                <p className="text-gray-600">
                  Help us match you to opportunities that fit your schedule
                </p>
              </div>

              <div className="space-y-6">
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

                <div className="form-group">
                  <label className="form-label">Preferred days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${preferredDays.includes(day)
                            ? "bg-success-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred times</label>
                  <div className="space-y-2">
                    {TIMES.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => toggleTime(time)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${preferredTimes.includes(time)
                            ? "bg-success-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-secondary flex items-center gap-2"
                disabled={saving}
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={
                  (step === 1 && (!city || !state)) ||
                  (step === 2 && skills.length === 0) ||
                  (step === 3 && interests.length === 0)
                }
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={saving || preferredDays.length === 0 || preferredTimes.length === 0}
                className="btn btn-success flex-1 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete Setup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}