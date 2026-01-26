/**
 * Seed script to populate database with demo data
 * Run: node scripts/seed-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DEMO_ISSUES = [
  {
    title: "Community Food Bank Needs Volunteers",
    description: "Our local food bank is experiencing record demand. We need volunteers to help sort donations, pack boxes, and distribute food to families in need.",
    category: "Food Security",
    location: { city: "San Francisco", state: "CA" },
    severity: "high",
    status: "open",
    required_skills: ["Organization", "Physical Work", "Customer Service"],
    estimated_impact: 500
  },
  {
    title: "After-School Tutoring Program",
    description: "Low-income students need tutoring in math and reading. Help bridge the educational gap by volunteering 2-3 hours per week.",
    category: "Education",
    location: { city: "Oakland", state: "CA" },
    severity: "medium",
    status: "open",
    required_skills: ["Teaching", "Math", "Communication"],
    estimated_impact: 50
  },
  {
    title: "Homeless Shelter Renovation",
    description: "Local shelter needs renovation. Looking for volunteers with construction, painting, or handyman skills to help create a safer environment.",
    category: "Housing",
    location: { city: "San Jose", state: "CA" },
    severity: "high",
    status: "open",
    required_skills: ["Construction", "Painting", "Physical Work"],
    estimated_impact: 200
  },
  {
    title: "Mental Health Support Hotline",
    description: "Train to become a crisis counselor for our community mental health hotline. Flexible shifts available.",
    category: "Healthcare",
    location: { city: "Berkeley", state: "CA" },
    severity: "urgent",
    status: "open",
    required_skills: ["Counseling", "Active Listening", "Communication"],
    estimated_impact: 1000
  },
  {
    title: "Community Garden Expansion",
    description: "Help us expand our urban garden to provide fresh produce to local families. Need volunteers for planting, maintenance, and harvest.",
    category: "Environment",
    location: { city: "San Francisco", state: "CA" },
    severity: "low",
    status: "open",
    required_skills: ["Gardening", "Physical Work", "Organization"],
    estimated_impact: 100
  },
  {
    title: "Senior Center Tech Literacy",
    description: "Teach seniors how to use smartphones, computers, and stay connected with family. One-on-one sessions weekly.",
    category: "Education",
    location: { city: "Palo Alto", state: "CA" },
    severity: "medium",
    status: "open",
    required_skills: ["Teaching", "Technology", "Communication"],
    estimated_impact: 75
  },
  {
    title: "Youth Mentorship Program",
    description: "Be a mentor to at-risk youth. Build relationships, provide guidance, and help them achieve their goals.",
    category: "Youth Development",
    location: { city: "Oakland", state: "CA" },
    severity: "high",
    status: "open",
    required_skills: ["Mentoring", "Communication", "Active Listening"],
    estimated_impact: 30
  },
  {
    title: "Free Legal Aid Clinic",
    description: "Volunteer lawyers needed to provide free legal consultations to low-income families facing eviction or workplace issues.",
    category: "Legal Aid",
    location: { city: "San Francisco", state: "CA" },
    severity: "urgent",
    status: "open",
    required_skills: ["Legal", "Research", "Communication"],
    estimated_impact: 150
  },
  {
    title: "Neighborhood Cleanup Initiative",
    description: "Monthly cleanup events to remove litter, graffiti, and maintain public spaces. All ages welcome.",
    category: "Environment",
    location: { city: "San Jose", state: "CA" },
    severity: "low",
    status: "open",
    required_skills: ["Physical Work", "Organization"],
    estimated_impact: 300
  },
  {
    title: "Refugee Resettlement Support",
    description: "Help newly arrived refugees with language practice, cultural orientation, and navigating essential services.",
    category: "Immigration Support",
    location: { city: "San Francisco", state: "CA" },
    severity: "high",
    status: "open",
    required_skills: ["Language Translation", "Teaching", "Cultural Competency"],
    estimated_impact: 40
  }
];

const DEMO_CIRCLES = [
  {
    name: "Food Bank Warriors",
    description: "Dedicated team distributing food to 500+ families weekly",
    status: "active",
    max_members: 10,
    meeting_schedule: { frequency: "weekly", day: "Saturday", time: "09:00" }
  },
  {
    name: "Math Tutors United",
    description: "After-school tutoring for middle school students",
    status: "forming",
    max_members: 8,
    meeting_schedule: { frequency: "weekly", day: "Tuesday", time: "16:00" }
  },
  {
    name: "Home Builders Collective",
    description: "Construction volunteers renovating shelters",
    status: "active",
    max_members: 12,
    meeting_schedule: { frequency: "bi-weekly", day: "Sunday", time: "10:00" }
  },
  {
    name: "Crisis Support Network",
    description: "Trained counselors providing 24/7 mental health support",
    status: "active",
    max_members: 15,
    meeting_schedule: { frequency: "monthly", day: "Monday", time: "18:00" }
  },
  {
    name: "Urban Gardeners",
    description: "Growing fresh produce for the community",
    status: "forming",
    max_members: 10,
    meeting_schedule: { frequency: "weekly", day: "Wednesday", time: "17:00" }
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Insert issues
    console.log('📋 Inserting demo issues...');
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .insert(DEMO_ISSUES)
      .select();

    if (issuesError) {
      console.error('❌ Error inserting issues:', issuesError);
      return;
    }

    console.log(`✅ Inserted ${issues.length} issues\n`);

    // Insert circles (link to first 5 issues)
    console.log('⭕ Inserting demo circles...');
    const circlesWithIssues = DEMO_CIRCLES.map((circle, index) => ({
      ...circle,
      issue_id: issues[index]?.id
    }));

    const { data: circles, error: circlesError } = await supabase
      .from('circles')
      .insert(circlesWithIssues)
      .select();

    if (circlesError) {
      console.error('❌ Error inserting circles:', circlesError);
      return;
    }

    console.log(`✅ Inserted ${circles.length} circles\n`);

    console.log('🎉 Database seeded successfully!\n');
    console.log('Summary:');
    console.log(`- ${issues.length} community issues`);
    console.log(`- ${circles.length} action circles`);
    console.log('\nYou can now browse these in the Discover page!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

seedDatabase();
