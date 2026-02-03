"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Users, Target, TrendingUp, Sparkles, ArrowRight, Menu, X } from "lucide-react";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container-custom">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Impact Circle</span>
            </Link>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="btn btn-secondary">
                Sign In
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200 animate-fade-in">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block btn btn-secondary w-full text-center"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block btn btn-primary w-full text-center"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      <section className="container-custom py-12 lg:py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Community Impact
          </div>
          <h1 className="heading-1 mb-4 lg:mb-6">
            Turn Your 2026 Resolution
            <br className="hidden sm:block" />
            Into <span className="text-primary-600">Real Impact</span>
          </h1>
          <p className="text-base lg:text-xl text-gray-600 mb-6 lg:mb-8 max-w-2xl mx-auto px-4">
            Connect with local community issues, join action circles, and create measurable
            change—guided by AI that matches your unique skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/signup" className="btn btn-primary w-full sm:w-auto">
              Start Making Impact
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </Link>
            <Link href="/login" className="btn btn-secondary w-full sm:w-auto">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="container-custom">
          <h2 className="heading-2 text-center mb-8 lg:mb-12">How Impact Circle Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="AI-Powered Matching"
              description="Get matched to local issues where your unique skills create the most impact"
              color="primary"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Join Action Circles"
              description="Small groups (5-10 people) working together on specific community problems"
              color="success"
            />
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="Coordinate Activities"
              description="AI coordinator helps plan events, assign tasks, and keep everyone aligned"
              color="primary"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Track Your Impact"
              description="See measurable results: people helped, hours contributed, community transformed"
              color="success"
            />
          </div>
        </div>
      </section>

      <section className="container-custom py-12 lg:py-16">
        <div className="grid sm:grid-cols-3 gap-6 lg:gap-8 text-center">
          <StatCard number="1,000+" label="Active Volunteers" />
          <StatCard number="150+" label="Community Issues Addressed" />
          <StatCard number="25,000+" label="Hours of Impact" />
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary-600 to-primary-700 py-12 lg:py-16">
        <div className="container-custom text-center text-white">
          <h2 className="heading-2 mb-4">Ready to Make a Difference?</h2>
          <p className="text-base lg:text-xl mb-6 lg:mb-8 text-primary-100 max-w-2xl mx-auto">
            Join thousands of volunteers creating real change in their communities.
          </p>
          <Link href="/signup" className="btn bg-white text-primary-600 hover:bg-gray-100 w-full sm:w-auto">
            Start Your Impact Journey
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-6 lg:py-8">
        <div className="container-custom text-center">
          <p className="text-sm">&copy; 2026 Impact Circle. Built with AI to empower communities.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "success";
}) {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-600",
    success: "bg-success-100 text-success-600",
  };

  return (
    <div className="text-center">
      <div className={`inline-flex p-4 rounded-2xl ${colorClasses[color]} mb-4`}>{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="card">
      <div className="text-4xl font-bold text-primary-600 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}