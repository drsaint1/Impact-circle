/**
 * Quick seed script for demo data
 * Run: node scripts/quick-seed.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🌱 Starting seed script...');
console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const demoIssues = [
  {
    title: "Community Food Bank Needs Volunteers",
    description: "Our local food bank is experiencing record demand. We need volunteers to help sort donations, pack boxes, and distribute food to families in need. Every Saturday morning, 9 AM - 12 PM.",
    category: "food-security",
    location: { city: "San Francisco", state: "CA", coordinates: { lat: 37.7749, lng: -122.4194 } },
    urgency: "high",
    skills_needed: ["Organization", "Physical Labor", "Customer Service"],
    volunteers_needed: 15,
    volunteers_joined: 3,
    estimated_hours: 3,
    status: "active",
    ai_generated: false
  },
  {
    title: "After-School Math & Reading Tutoring",
    description: "Low-income elementary students need tutoring in math and reading. Help bridge the educational gap by volunteering 2-3 hours per week. Training provided!",
    category: "education",
    location: { city: "Oakland", state: "CA", coordinates: { lat: 37.8044, lng: -122.2712 } },
    urgency: "medium",
    skills_needed: ["Teaching", "Math", "Communication", "Patience"],
    volunteers_needed: 10,
    volunteers_joined: 5,
    estimated_hours: 3,
    status: "active",
    ai_generated: false
  },
  {
    title: "Homeless Shelter Renovation Project",
    description: "Local shelter needs renovation to serve more families. Looking for volunteers with construction, painting, or handyman skills. Weekend project, all materials provided.",
    category: "housing",
    location: { city: "San Jose", state: "CA", coordinates: { lat: 37.3382, lng: -121.8863 } },
    urgency: "high",
    skills_needed: ["Construction", "Painting", "Physical Labor", "Carpentry"],
    volunteers_needed: 20,
    volunteers_joined: 8,
    estimated_hours: 8,
    status: "active",
    ai_generated: false
  },
  {
    title: "24/7 Mental Health Crisis Hotline",
    description: "Train to become a crisis counselor for our community mental health hotline. Comprehensive training provided. Flexible evening and weekend shifts available.",
    category: "healthcare",
    location: { city: "Berkeley", state: "CA", coordinates: { lat: 37.8715, lng: -122.2730 } },
    urgency: "critical",
    skills_needed: ["Counseling", "Active Listening", "Communication", "Empathy"],
    volunteers_needed: 12,
    volunteers_joined: 2,
    estimated_hours: 4,
    status: "active",
    ai_generated: false
  },
  {
    title: "Urban Community Garden Expansion",
    description: "Help us expand our urban garden to provide fresh produce to 200+ local families. Need volunteers for planting, maintenance, and harvest. Great for families!",
    category: "environment",
    location: { city: "San Francisco", state: "CA", coordinates: { lat: 37.7749, lng: -122.4194 } },
    urgency: "low",
    skills_needed: ["Gardening", "Physical Labor", "Organization"],
    volunteers_needed: 8,
    volunteers_joined: 6,
    estimated_hours: 4,
    status: "active",
    ai_generated: false
  },
  {
    title: "Senior Tech Literacy Program",
    description: "Teach seniors how to use smartphones, video calls, and stay connected with family. One-on-one sessions, once a week. Make a huge difference in reducing isolation!",
    category: "education",
    location: { city: "Palo Alto", state: "CA", coordinates: { lat: 37.4419, lng: -122.1430 } },
    urgency: "medium",
    skills_needed: ["Teaching", "Technology", "Communication", "Patience"],
    volunteers_needed: 6,
    volunteers_joined: 4,
    estimated_hours: 2,
    status: "active",
    ai_generated: false
  },
  {
    title: "Youth Mentorship - At-Risk Teens",
    description: "Be a mentor to at-risk youth aged 13-18. Build relationships, provide guidance, and help them achieve their goals. Background check required.",
    category: "youth-development",
    location: { city: "Oakland", state: "CA", coordinates: { lat: 37.8044, lng: -122.2712 } },
    urgency: "high",
    skills_needed: ["Mentoring", "Communication", "Active Listening", "Leadership"],
    volunteers_needed: 10,
    volunteers_joined: 3,
    estimated_hours: 2,
    status: "active",
    ai_generated: false
  },
  {
    title: "Free Legal Aid Clinic for Families",
    description: "Volunteer lawyers needed to provide free legal consultations to low-income families facing eviction or workplace issues. 2 hours per month minimum.",
    category: "legal-aid",
    location: { city: "San Francisco", state: "CA", coordinates: { lat: 37.7749, lng: -122.4194 } },
    urgency: "critical",
    skills_needed: ["Legal", "Research", "Communication", "Document Review"],
    volunteers_needed: 8,
    volunteers_joined: 2,
    estimated_hours: 2,
    status: "active",
    ai_generated: false
  },
  {
    title: "Monthly Neighborhood Cleanup",
    description: "Monthly cleanup events to remove litter, graffiti, and maintain public parks and spaces. All ages welcome! Bring the family!",
    category: "environment",
    location: { city: "San Jose", state: "CA", coordinates: { lat: 37.3382, lng: -121.8863 } },
    urgency: "low",
    skills_needed: ["Physical Labor", "Organization", "Community Organizing"],
    volunteers_needed: 25,
    volunteers_joined: 15,
    estimated_hours: 3,
    status: "active",
    ai_generated: false
  },
  {
    title: "Refugee Family Resettlement Support",
    description: "Help newly arrived refugee families with language practice, cultural orientation, and navigating healthcare, schools, and essential services.",
    category: "immigration-support",
    location: { city: "San Francisco", state: "CA", coordinates: { lat: 37.7749, lng: -122.4194 } },
    urgency: "high",
    skills_needed: ["Language Translation", "Teaching", "Cultural Competency", "Communication"],
    volunteers_needed: 7,
    volunteers_joined: 2,
    estimated_hours: 3,
    status: "active",
    ai_generated: false
  }
];

async function seedData() {
  try {
    console.log('\n📦 Inserting demo issues...');

    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .insert(demoIssues)
      .select();

    if (issuesError) {
      console.error('❌ Error inserting issues:', issuesError);
      return;
    }

    console.log(`✅ Successfully inserted ${issues.length} issues!`);

    // Print issue IDs for reference
    console.log('\n📋 Created issues:');
    issues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}. ${issue.title} (ID: ${issue.id})`);
    });

    console.log('\n🎉 Seed complete! You can now:');
    console.log('   1. Go to /discover to see all issues');
    console.log('   2. Click "Create Circle" and select an issue from dropdown');
    console.log('   3. Test AI matching with real data\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

seedData();
