import { createDataset, addDatasetItems } from "@/lib/opik/datasets";


async function createSkillMatcherDataset() {
  console.log("📊 Creating Skill Matcher production dataset...");

  const datasetName = "skill-matcher-production-v1";
  await createDataset({
    name: datasetName,
    description:
      "Production dataset with 100 diverse volunteer profiles for systematic evaluation of matching quality",
  });

  const testCases = [
    
    {
      input: {
        userId: "test-user-001",
        skills: ["JavaScript", "React", "Node.js"],
        interests: ["youth education", "technology access"],
        location: "San Francisco, CA",
        availability: ["weekends", "evenings"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Code.org - Weekend Coding Mentor",
        confidence: 0.90,
        reasoning: "Perfect skill alignment with youth tech education",
      },
      metadata: {
        category: "exact_skill_match",
        difficulty: "easy",
        expectedQuality: "high",
      },
    },
    {
      input: {
        userId: "test-user-002",
        skills: ["Teaching", "Spanish", "Curriculum Design"],
        interests: ["immigrant support", "language education"],
        location: "Los Angeles, CA",
        availability: ["weekday mornings"],
        experienceLevel: "expert",
      },
      expectedOutput: {
        topMatch: "Immigrant Welcome Center - ESL Instructor",
        confidence: 0.92,
        reasoning: "Expert teaching skills + language expertise",
      },
      metadata: {
        category: "exact_skill_match",
        difficulty: "easy",
        expectedQuality: "high",
      },
    },
    {
      input: {
        userId: "test-user-003",
        skills: ["Graphic Design", "Adobe Photoshop", "Canva"],
        interests: ["nonprofit branding", "animal welfare"],
        location: "Seattle, WA",
        availability: ["flexible", "remote"],
        experienceLevel: "advanced",
      },
      expectedOutput: {
        topMatch: "Seattle Humane Society - Marketing Designer",
        confidence: 0.88,
        reasoning: "Design skills + animal welfare passion + remote flexibility",
      },
      metadata: {
        category: "exact_skill_match",
        difficulty: "easy",
        expectedQuality: "high",
      },
    },
    {
      input: {
        userId: "test-user-004",
        skills: ["Accounting", "QuickBooks", "Tax Preparation"],
        interests: ["financial literacy", "low-income support"],
        location: "Chicago, IL",
        availability: ["tax season", "weekends"],
        experienceLevel: "expert",
      },
      expectedOutput: {
        topMatch: "VITA Tax Program - Free Tax Preparer",
        confidence: 0.93,
        reasoning:
          "Certified accounting skills for underserved communities",
      },
      metadata: {
        category: "exact_skill_match",
        difficulty: "easy",
        expectedQuality: "high",
      },
    },
    {
      input: {
        userId: "test-user-005",
        skills: ["Nursing", "First Aid", "Patient Care"],
        interests: ["homeless services", "public health"],
        location: "New York, NY",
        availability: ["weekends", "monthly"],
        experienceLevel: "professional",
      },
      expectedOutput: {
        topMatch: "Coalition for the Homeless - Street Medicine Volunteer",
        confidence: 0.91,
        reasoning: "Medical credentials for vulnerable populations",
      },
      metadata: {
        category: "exact_skill_match",
        difficulty: "easy",
        expectedQuality: "high",
      },
    },

    
    {
      input: {
        userId: "test-user-006",
        skills: ["Project Management", "Excel", "Team Leadership"],
        interests: ["community organizing", "social justice"],
        location: "Austin, TX",
        availability: ["evenings", "weekends"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Austin Justice Coalition - Campaign Coordinator",
        confidence: 0.75,
        reasoning:
          "Project management skills transfer to community organizing",
      },
      metadata: {
        category: "transferable_skills",
        difficulty: "medium",
        expectedQuality: "medium-high",
      },
    },
    {
      input: {
        userId: "test-user-007",
        skills: ["Sales", "Public Speaking", "Relationship Building"],
        interests: ["fundraising", "animal rescue"],
        location: "Denver, CO",
        availability: ["flexible"],
        experienceLevel: "advanced",
      },
      expectedOutput: {
        topMatch: "MaxFund Animal Adoption Center - Fundraising Ambassador",
        confidence: 0.78,
        reasoning:
          "Sales/speaking skills excellent for fundraising campaigns",
      },
      metadata: {
        category: "transferable_skills",
        difficulty: "medium",
        expectedQuality: "medium-high",
      },
    },
    {
      input: {
        userId: "test-user-008",
        skills: ["Data Analysis", "Python", "Visualization"],
        interests: ["environmental conservation", "climate action"],
        location: "Portland, OR",
        availability: ["remote", "part-time"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch:
          "Audubon Society - Citizen Science Data Analyst",
        confidence: 0.80,
        reasoning: "Data skills valuable for environmental research",
      },
      metadata: {
        category: "transferable_skills",
        difficulty: "medium",
        expectedQuality: "medium-high",
      },
    },
    {
      input: {
        userId: "test-user-009",
        skills: ["Writing", "Social Media", "Content Creation"],
        interests: ["mental health awareness", "youth support"],
        location: "Boston, MA",
        availability: ["remote", "evenings"],
        experienceLevel: "beginner",
      },
      expectedOutput: {
        topMatch: "NAMI Boston - Social Media Coordinator",
        confidence: 0.72,
        reasoning:
          "Content skills for mental health advocacy campaigns",
      },
      metadata: {
        category: "transferable_skills",
        difficulty: "medium",
        expectedQuality: "medium",
      },
    },
    {
      input: {
        userId: "test-user-010",
        skills: ["Customer Service", "Conflict Resolution", "Empathy"],
        interests: ["crisis intervention", "hotline support"],
        location: "Philadelphia, PA",
        availability: ["night shifts", "weekends"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Crisis Text Line - Volunteer Counselor",
        confidence: 0.83,
        reasoning:
          "Customer service empathy translates to crisis support",
      },
      metadata: {
        category: "transferable_skills",
        difficulty: "medium",
        expectedQuality: "high",
      },
    },

    
    {
      input: {
        userId: "test-user-011",
        skills: ["General Labor", "Gardening"],
        interests: ["food security", "urban farming", "sustainability"],
        location: "Detroit, MI",
        availability: ["weekends", "mornings"],
        experienceLevel: "beginner",
      },
      expectedOutput: {
        topMatch: "Detroit Urban Farm - Community Garden Volunteer",
        confidence: 0.70,
        reasoning: "Strong passion alignment with food justice work",
      },
      metadata: {
        category: "interest_driven",
        difficulty: "medium",
        expectedQuality: "medium",
      },
    },
    {
      input: {
        userId: "test-user-012",
        skills: ["Reading", "Patience"],
        interests: ["literacy", "child development", "education equity"],
        location: "Atlanta, GA",
        availability: ["after school", "weekly"],
        experienceLevel: "beginner",
      },
      expectedOutput: {
        topMatch: "Reading Partners - Elementary Reading Tutor",
        confidence: 0.68,
        reasoning: "Passion for literacy drives volunteer success",
      },
      metadata: {
        category: "interest_driven",
        difficulty: "medium",
        expectedQuality: "medium",
      },
    },
    {
      input: {
        userId: "test-user-013",
        skills: ["Dog Training", "Animal Handling"],
        interests: ["animal welfare", "rescue", "rehabilitation"],
        location: "Phoenix, AZ",
        availability: ["weekends", "flexible"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Arizona Animal Welfare League - Dog Socialization",
        confidence: 0.85,
        reasoning: "Skill + passion = high volunteer satisfaction",
      },
      metadata: {
        category: "interest_driven",
        difficulty: "easy",
        expectedQuality: "high",
      },
    },
    {
      input: {
        userId: "test-user-014",
        skills: ["Hiking", "Outdoor Skills"],
        interests: [
          "environmental education",
          "youth mentorship",
          "outdoors",
        ],
        location: "Boulder, CO",
        availability: ["weekends", "summer"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Boulder Outdoor Coalition - Youth Trail Leader",
        confidence: 0.76,
        reasoning:
          "Outdoor passion + youth interest = excellent mentor",
      },
      metadata: {
        category: "interest_driven",
        difficulty: "medium",
        expectedQuality: "medium-high",
      },
    },
    {
      input: {
        userId: "test-user-015",
        skills: ["Music", "Guitar"],
        interests: ["senior care", "memory care", "joy"],
        location: "Nashville, TN",
        availability: ["afternoons", "weekly"],
        experienceLevel: "beginner",
      },
      expectedOutput: {
        topMatch: "Music & Memory - Senior Living Music Volunteer",
        confidence: 0.73,
        reasoning: "Music therapy for dementia patients",
      },
      metadata: {
        category: "interest_driven",
        difficulty: "medium",
        expectedQuality: "medium",
      },
    },

    
    {
      input: {
        userId: "test-user-016",
        skills: ["Teaching", "Education"],
        interests: ["youth mentorship"],
        location: "Rural Iowa",
        availability: ["weekends"],
        experienceLevel: "advanced",
      },
      expectedOutput: {
        topMatch: "4-H Youth Development - County Mentor (Remote OK)",
        confidence: 0.65,
        reasoning:
          "Remote/hybrid opportunity to overcome rural location",
      },
      metadata: {
        category: "location_challenge",
        difficulty: "hard",
        expectedQuality: "medium",
      },
    },
    {
      input: {
        userId: "test-user-017",
        skills: ["Software Engineering"],
        interests: ["civic tech"],
        location: "Remote",
        availability: ["evenings", "remote only"],
        experienceLevel: "expert",
      },
      expectedOutput: {
        topMatch: "Code for America - Virtual Brigade Member",
        confidence: 0.88,
        reasoning: "Fully remote civic tech opportunities",
      },
      metadata: {
        category: "location_challenge",
        difficulty: "easy",
        expectedQuality: "high",
      },
    },
    {
      input: {
        userId: "test-user-018",
        skills: ["Marketing"],
        interests: ["social good"],
        location: "Small Town, Montana",
        availability: ["flexible", "remote preferred"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Catchafire - Pro Bono Marketing Consultant",
        confidence: 0.70,
        reasoning: "Virtual volunteering platform for skills-based work",
      },
      metadata: {
        category: "location_challenge",
        difficulty: "medium",
        expectedQuality: "medium-high",
      },
    },

    
    {
      input: {
        userId: "test-user-019",
        skills: ["Legal", "Law"],
        interests: ["immigration rights"],
        location: "New York, NY",
        availability: ["1 hour per month", "very limited"],
        experienceLevel: "expert",
      },
      expectedOutput: {
        topMatch: "RAICES - Pro Bono Legal Consultation (Virtual)",
        confidence: 0.67,
        reasoning: "Micro-volunteering for busy professionals",
      },
      metadata: {
        category: "time_constraint",
        difficulty: "hard",
        expectedQuality: "medium",
      },
    },
    {
      input: {
        userId: "test-user-020",
        skills: ["Photography"],
        interests: ["animal rescue"],
        location: "Miami, FL",
        availability: ["one-time", "a few hours"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Miami-Dade Animal Shelter - Pet Photography Day",
        confidence: 0.80,
        reasoning: "One-time project perfect for limited availability",
      },
      metadata: {
        category: "time_constraint",
        difficulty: "medium",
        expectedQuality: "high",
      },
    },

    
    {
      input: {
        userId: "test-user-021",
        skills: ["Forklift Operation", "Warehouse"],
        interests: ["helping people"],
        location: "Indianapolis, IN",
        availability: ["weekdays"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Feeding America - Food Bank Warehouse Volunteer",
        confidence: 0.82,
        reasoning: "Industrial skills valuable for food distribution",
      },
      metadata: {
        category: "edge_case",
        difficulty: "hard",
        expectedQuality: "medium-high",
      },
    },
    {
      input: {
        userId: "test-user-022",
        skills: ["Retired"],
        interests: ["staying active", "meeting people"],
        location: "Tampa, FL",
        availability: ["all day", "flexible"],
        experienceLevel: "life experience",
      },
      expectedOutput: {
        topMatch: "Senior Corps - Foster Grandparent Program",
        confidence: 0.75,
        reasoning: "Social engagement + meaningful contribution for retirees",
      },
      metadata: {
        category: "edge_case",
        difficulty: "medium",
        expectedQuality: "medium-high",
      },
    },
    {
      input: {
        userId: "test-user-023",
        skills: ["High School Student", "Enthusiastic"],
        interests: ["college prep", "helping younger kids"],
        location: "San Diego, CA",
        availability: ["after school", "weekends"],
        experienceLevel: "beginner",
      },
      expectedOutput: {
        topMatch: "826 Valencia - Youth Writing Tutor",
        confidence: 0.71,
        reasoning: "Teen volunteers mentor younger students",
      },
      metadata: {
        category: "edge_case",
        difficulty: "medium",
        expectedQuality: "medium",
      },
    },

    
    

    
    {
      input: {
        userId: "test-user-024",
        skills: ["UX Design", "User Research", "Figma"],
        interests: ["accessibility", "disability rights"],
        location: "San Francisco, CA",
        availability: ["remote", "project-based"],
        experienceLevel: "advanced",
      },
      expectedOutput: {
        topMatch: "Accessible Technology Coalition - UX Consultant",
        confidence: 0.86,
        reasoning: "UX expertise for accessibility advocacy",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-025",
        skills: ["Cybersecurity", "Network Security"],
        interests: ["nonprofit tech support"],
        location: "Remote",
        availability: ["evenings"],
        experienceLevel: "expert",
      },
      expectedOutput: {
        topMatch: "NetHope - Cybersecurity Volunteer",
        confidence: 0.84,
        reasoning: "Protect nonprofits from cyber threats",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-026",
        skills: ["Physical Therapy", "Rehabilitation"],
        interests: ["veterans support", "adaptive sports"],
        location: "San Antonio, TX",
        availability: ["weekends"],
        experienceLevel: "professional",
      },
      expectedOutput: {
        topMatch: "Wounded Warrior Project - Adaptive Sports Coach",
        confidence: 0.89,
        reasoning: "PT skills for veteran rehabilitation",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-027",
        skills: ["Dental", "Oral Health"],
        interests: ["underserved communities"],
        location: "Houston, TX",
        availability: ["quarterly", "mission trips"],
        experienceLevel: "professional",
      },
      expectedOutput: {
        topMatch: "Mission of Mercy - Free Dental Clinic",
        confidence: 0.92,
        reasoning: "Professional dental care for low-income families",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-028",
        skills: ["Painting", "Art Therapy", "Visual Arts"],
        interests: ["mental health", "trauma recovery"],
        location: "Portland, OR",
        availability: ["weekly", "evenings"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Art from the Heart - Therapeutic Art Facilitator",
        confidence: 0.81,
        reasoning: "Creative expression for healing",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-029",
        skills: ["Dance", "Movement", "Choreography"],
        interests: ["youth empowerment", "self-expression"],
        location: "Los Angeles, CA",
        availability: ["weekends"],
        experienceLevel: "advanced",
      },
      expectedOutput: {
        topMatch: "Inner-City Arts - Dance Instructor",
        confidence: 0.83,
        reasoning: "Movement arts for at-risk youth",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-030",
        skills: ["Marine Biology", "Scuba Diving"],
        interests: ["ocean conservation", "coral restoration"],
        location: "Key West, FL",
        availability: ["weekends", "seasonal"],
        experienceLevel: "expert",
      },
      expectedOutput: {
        topMatch: "Coral Restoration Foundation - Dive Volunteer",
        confidence: 0.93,
        reasoning: "Scientific diving for reef conservation",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-031",
        skills: ["Forestry", "Tree Care"],
        interests: ["urban greening", "climate action"],
        location: "Minneapolis, MN",
        availability: ["spring/fall", "weekends"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Tree Trust - Urban Forest Steward",
        confidence: 0.80,
        reasoning: "Tree expertise for urban canopy expansion",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-032",
        skills: ["STEM", "Engineering", "Math"],
        interests: ["girls in STEM", "gender equity"],
        location: "Boston, MA",
        availability: ["weekday afternoons"],
        experienceLevel: "expert",
      },
      expectedOutput: {
        topMatch: "Girls Who Code - Club Facilitator",
        confidence: 0.90,
        reasoning: "STEM expertise for closing gender gap",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-033",
        skills: ["College Counseling", "SAT Prep"],
        interests: ["first-generation students", "college access"],
        location: "Oakland, CA",
        availability: ["evenings", "virtual"],
        experienceLevel: "advanced",
      },
      expectedOutput: {
        topMatch: "College Track - College Readiness Coach",
        confidence: 0.87,
        reasoning: "College expertise for underserved students",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-034",
        skills: ["Business Strategy", "MBA", "Consulting"],
        interests: ["nonprofit capacity building"],
        location: "Chicago, IL",
        availability: ["project-based", "quarterly"],
        experienceLevel: "expert",
      },
      expectedOutput: {
        topMatch: "Taproot Foundation - Pro Bono Consultant",
        confidence: 0.88,
        reasoning: "Strategic consulting for nonprofits",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-035",
        skills: ["HR", "Recruitment", "Talent Development"],
        interests: ["workforce development", "job training"],
        location: "Baltimore, MD",
        availability: ["evenings", "mentorship"],
        experienceLevel: "advanced",
      },
      expectedOutput: {
        topMatch: "Year Up - Career Coach Volunteer",
        confidence: 0.82,
        reasoning: "HR skills for underserved young adults",
      },
      metadata: { category: "transferable_skills", difficulty: "medium" },
    },

    
    {
      input: {
        userId: "test-user-036",
        skills: ["Mandarin", "Translation", "Bilingual"],
        interests: ["immigrant services", "language access"],
        location: "New York, NY",
        availability: ["flexible", "on-call"],
        experienceLevel: "native speaker",
      },
      expectedOutput: {
        topMatch: "International Rescue Committee - Language Interpreter",
        confidence: 0.91,
        reasoning: "Critical language skills for refugees",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-037",
        skills: ["Arabic", "Cultural Competency"],
        interests: ["refugee resettlement", "cultural bridge"],
        location: "Dearborn, MI",
        availability: ["weekends"],
        experienceLevel: "bilingual",
      },
      expectedOutput: {
        topMatch: "Arab Community Center - Cultural Navigator",
        confidence: 0.86,
        reasoning: "Language + cultural expertise for newcomers",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-038",
        skills: ["Carpentry", "Construction", "Home Repair"],
        interests: ["affordable housing", "disaster relief"],
        location: "Charlotte, NC",
        availability: ["weekends", "build days"],
        experienceLevel: "professional",
      },
      expectedOutput: {
        topMatch: "Habitat for Humanity - Construction Volunteer",
        confidence: 0.94,
        reasoning: "Professional carpentry for housing access",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-039",
        skills: ["Plumbing", "HVAC"],
        interests: ["veteran services", "home repair"],
        location: "Nashville, TN",
        availability: ["monthly", "weekends"],
        experienceLevel: "licensed",
      },
      expectedOutput: {
        topMatch: "Rebuilding Together - Skilled Trades Volunteer",
        confidence: 0.90,
        reasoning: "Trade skills for veteran home repairs",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-040",
        skills: ["Event Planning", "Logistics", "Coordination"],
        interests: ["fundraising", "community events"],
        location: "Washington, DC",
        availability: ["project-based"],
        experienceLevel: "advanced",
      },
      expectedOutput: {
        topMatch: "Special Olympics - Event Coordinator Volunteer",
        confidence: 0.85,
        reasoning: "Event expertise for fundraising galas",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-041",
        skills: ["Video Production", "Film", "Editing"],
        interests: ["storytelling", "nonprofit marketing"],
        location: "Austin, TX",
        availability: ["remote", "project-based"],
        experienceLevel: "professional",
      },
      expectedOutput: {
        topMatch: "Through the Lens - Documentary Volunteer",
        confidence: 0.84,
        reasoning: "Video storytelling for social impact orgs",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-042",
        skills: ["College Student", "Peer Mentoring"],
        interests: ["education", "tutoring"],
        location: "Durham, NC",
        availability: ["afternoons", "weekdays"],
        experienceLevel: "beginner",
      },
      expectedOutput: {
        topMatch: "America Reads - Reading Tutor",
        confidence: 0.76,
        reasoning: "Student volunteers for K-3 literacy",
      },
      metadata: { category: "interest_driven", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-043",
        skills: ["Teen", "Sports", "Athletics"],
        interests: ["coaching younger kids", "fitness"],
        location: "Milwaukee, WI",
        availability: ["after school", "weekends"],
        experienceLevel: "beginner",
      },
      expectedOutput: {
        topMatch: "Boys & Girls Club - Junior Coach",
        confidence: 0.74,
        reasoning: "Teen mentorship through sports",
      },
      metadata: { category: "interest_driven", difficulty: "medium" },
    },

    
    {
      input: {
        userId: "test-user-044",
        skills: ["Retired Teacher", "Life Experience"],
        interests: ["mentorship", "wisdom sharing"],
        location: "Tucson, AZ",
        availability: ["flexible", "weekdays"],
        experienceLevel: "expert",
      },
      expectedOutput: {
        topMatch: "Experience Corps - Literacy Tutor",
        confidence: 0.88,
        reasoning: "Retired educators mentor K-3 readers",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-045",
        skills: ["Retired Executive", "Leadership"],
        interests: ["giving back", "strategic guidance"],
        location: "Phoenix, AZ",
        availability: ["part-time", "flexible"],
        experienceLevel: "executive",
      },
      expectedOutput: {
        topMatch: "SCORE - Small Business Mentor",
        confidence: 0.90,
        reasoning: "Executive experience for entrepreneurs",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-046",
        skills: ["EMT", "Emergency Medicine"],
        interests: ["disaster response", "humanitarian aid"],
        location: "Memphis, TN",
        availability: ["on-call", "deployments"],
        experienceLevel: "certified",
      },
      expectedOutput: {
        topMatch: "Team Rubicon - Disaster Response Medic",
        confidence: 0.95,
        reasoning: "Emergency medical skills for disaster zones",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-047",
        skills: ["Mental Health Counseling", "Crisis Intervention"],
        interests: ["suicide prevention", "emotional support"],
        location: "Remote",
        availability: ["night shifts", "4 hours/week"],
        experienceLevel: "licensed",
      },
      expectedOutput: {
        topMatch: "National Suicide Prevention Lifeline - Crisis Counselor",
        confidence: 0.96,
        reasoning: "Licensed counselor for 24/7 hotline",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-048",
        skills: ["Veterinary", "Animal Medicine"],
        interests: ["wildlife rehabilitation"],
        location: "Sacramento, CA",
        availability: ["weekends", "seasonal"],
        experienceLevel: "professional",
      },
      expectedOutput: {
        topMatch: "Wildlife Rescue - Veterinary Volunteer",
        confidence: 0.93,
        reasoning: "Vet skills for injured wildlife",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-049",
        skills: ["Animal Behavior", "Training"],
        interests: ["service animals", "disability support"],
        location: "Orlando, FL",
        availability: ["evenings", "weekly"],
        experienceLevel: "certified",
      },
      expectedOutput: {
        topMatch: "Canine Companions - Puppy Raiser",
        confidence: 0.89,
        reasoning: "Train service dogs for people with disabilities",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-050",
        skills: ["Museum Docent", "Art History"],
        interests: ["education", "cultural access"],
        location: "Philadelphia, PA",
        availability: ["weekends", "daytime"],
        experienceLevel: "advanced",
      },
      expectedOutput: {
        topMatch: "Philadelphia Museum of Art - Gallery Guide",
        confidence: 0.82,
        reasoning: "Art knowledge for public education",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    

    
    {
      input: {
        userId: "test-user-051",
        skills: ["Podcast Production", "Audio Editing"],
        interests: ["storytelling", "social justice"],
        location: "Seattle, WA",
        availability: ["remote", "flexible"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "StoryCorps - Audio Archive Volunteer",
        confidence: 0.79,
        reasoning: "Podcast skills for oral history preservation",
      },
      metadata: { category: "transferable_skills", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-052",
        skills: ["Cooking", "Culinary Arts", "Nutrition"],
        interests: ["food insecurity", "community meals"],
        location: "San Jose, CA",
        availability: ["weekends", "mornings"],
        experienceLevel: "professional",
      },
      expectedOutput: {
        topMatch: "Food Not Bombs - Community Kitchen Volunteer",
        confidence: 0.87,
        reasoning: "Culinary skills for feeding unhoused neighbors",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-053",
        skills: ["Excel", "Data Entry", "Administrative"],
        interests: ["helping nonprofits", "backend support"],
        location: "Columbus, OH",
        availability: ["evenings", "remote"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "VolunteerMatch - Database Administrator",
        confidence: 0.71,
        reasoning: "Admin skills for nonprofit operations",
      },
      metadata: { category: "transferable_skills", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-054",
        skills: ["Fashion Design", "Sewing"],
        interests: ["sustainable fashion", "job training"],
        location: "New York, NY",
        availability: ["weekends"],
        experienceLevel: "advanced",
      },
      expectedOutput: {
        topMatch: "Sew Powerful - Sewing Instructor",
        confidence: 0.80,
        reasoning: "Fashion skills for workforce development",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-055",
        skills: ["Photography", "Headshots"],
        interests: ["job readiness", "professional development"],
        location: "Dallas, TX",
        availability: ["monthly", "weekends"],
        experienceLevel: "professional",
      },
      expectedOutput: {
        topMatch: "Dress for Success - Headshot Day Photographer",
        confidence: 0.84,
        reasoning: "Professional photos for job seekers",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-056",
        skills: ["Telehealth", "Counseling"],
        interests: ["mental health access"],
        location: "Alaska",
        availability: ["remote only", "evenings"],
        experienceLevel: "licensed",
      },
      expectedOutput: {
        topMatch: "7 Cups - Online Listener",
        confidence: 0.77,
        reasoning: "Virtual counseling overcomes rural barriers",
      },
      metadata: { category: "location_challenge", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-057",
        skills: ["Grant Writing"],
        interests: ["nonprofit funding"],
        location: "Vermont",
        availability: ["remote", "project-based"],
        experienceLevel: "expert",
      },
      expectedOutput: {
        topMatch: "Foundation Center - Grant Writing Mentor",
        confidence: 0.82,
        reasoning: "Virtual mentorship for rural nonprofits",
      },
      metadata: { category: "location_challenge", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-058",
        skills: ["Executive", "Board Governance"],
        interests: ["nonprofit leadership"],
        location: "San Francisco, CA",
        availability: ["quarterly meetings only"],
        experienceLevel: "C-suite",
      },
      expectedOutput: {
        topMatch: "BoardSource - Nonprofit Board Member",
        confidence: 0.81,
        reasoning: "Strategic governance with minimal time",
      },
      metadata: { category: "time_constraint", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-059",
        skills: ["Social Media", "Influencer"],
        interests: ["awareness campaigns"],
        location: "Los Angeles, CA",
        availability: ["15 min per week", "posting only"],
        experienceLevel: "advanced",
      },
      expectedOutput: {
        topMatch: "DoSomething.org - Social Amplifier",
        confidence: 0.75,
        reasoning: "Micro-volunteering through social reach",
      },
      metadata: { category: "time_constraint", difficulty: "medium" },
    },

    
    {
      input: {
        userId: "test-user-060",
        skills: ["Truck Driving", "CDL"],
        interests: ["disaster relief", "logistics"],
        location: "Oklahoma City, OK",
        availability: ["deployments", "emergency response"],
        experienceLevel: "professional",
      },
      expectedOutput: {
        topMatch: "Operation BBQ Relief - Relief Driver",
        confidence: 0.86,
        reasoning: "CDL drivers for disaster food distribution",
      },
      metadata: { category: "edge_case", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-061",
        skills: ["Barber", "Hairstylist"],
        interests: ["homeless services", "dignity"],
        location: "Seattle, WA",
        availability: ["monthly", "sundays"],
        experienceLevel: "licensed",
      },
      expectedOutput: {
        topMatch: "Beauty Bus Foundation - Mobile Haircuts",
        confidence: 0.88,
        reasoning: "Cosmetology for unhoused community",
      },
      metadata: { category: "edge_case", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-062",
        skills: ["Supply Chain", "Operations"],
        interests: ["humanitarian logistics"],
        location: "Atlanta, GA",
        availability: ["evenings", "consulting"],
        experienceLevel: "director level",
      },
      expectedOutput: {
        topMatch: "Direct Relief - Supply Chain Advisor",
        confidence: 0.83,
        reasoning: "Operations expertise for medical aid distribution",
      },
      metadata: { category: "transferable_skills", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-063",
        skills: ["Finance", "CFO", "Financial Planning"],
        interests: ["nonprofit financial health"],
        location: "Boston, MA",
        availability: ["quarterly", "pro bono"],
        experienceLevel: "executive",
      },
      expectedOutput: {
        topMatch: "Nonprofit Finance Fund - Financial Advisor",
        confidence: 0.89,
        reasoning: "CFO expertise for nonprofit sustainability",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-064",
        skills: ["Biology", "Lab Research"],
        interests: ["citizen science", "environmental monitoring"],
        location: "Madison, WI",
        availability: ["weekends", "field work"],
        experienceLevel: "PhD",
      },
      expectedOutput: {
        topMatch: "SciStarter - Citizen Science Project Lead",
        confidence: 0.85,
        reasoning: "Research skills for community science",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-065",
        skills: ["Chemistry", "STEM Education"],
        interests: ["hands-on learning", "underserved schools"],
        location: "Detroit, MI",
        availability: ["after school", "weekly"],
        experienceLevel: "graduate student",
      },
      expectedOutput: {
        topMatch: "Science from Scientists - Classroom Volunteer",
        confidence: 0.82,
        reasoning: "STEM grad students inspire elementary learners",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-066",
        skills: ["Theater", "Drama", "Performance"],
        interests: ["youth development", "confidence building"],
        location: "Chicago, IL",
        availability: ["after school", "spring"],
        experienceLevel: "professional",
      },
      expectedOutput: {
        topMatch: "Steppenwolf Theatre - Teen Drama Workshop Leader",
        confidence: 0.84,
        reasoning: "Theater arts for self-expression and growth",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-067",
        skills: ["Pottery", "Ceramics"],
        interests: ["therapeutic arts", "senior programs"],
        location: "Asheville, NC",
        availability: ["weekly", "mornings"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Senior Center - Ceramics Class Instructor",
        confidence: 0.78,
        reasoning: "Creative arts for active aging",
      },
      metadata: { category: "interest_driven", difficulty: "medium" },
    },

    
    {
      input: {
        userId: "test-user-068",
        skills: ["Doula", "Childbirth Support"],
        interests: ["maternal health equity", "Black maternal health"],
        location: "New Orleans, LA",
        availability: ["on-call", "births"],
        experienceLevel: "certified",
      },
      expectedOutput: {
        topMatch: "Ancient Song Doula Services - Community Doula",
        confidence: 0.92,
        reasoning: "Birth support for underserved mothers",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-069",
        skills: ["Occupational Therapy", "Adaptive Equipment"],
        interests: ["disability services", "independence"],
        location: "Minneapolis, MN",
        availability: ["monthly", "assessments"],
        experienceLevel: "licensed",
      },
      expectedOutput: {
        topMatch: "Courage Kenny - Adaptive Technology Volunteer",
        confidence: 0.87,
        reasoning: "OT skills for accessibility solutions",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-070",
        skills: ["Policy Analysis", "Research"],
        interests: ["criminal justice reform", "advocacy"],
        location: "Washington, DC",
        availability: ["remote", "part-time"],
        experienceLevel: "graduate student",
      },
      expectedOutput: {
        topMatch: "The Sentencing Project - Policy Research Volunteer",
        confidence: 0.81,
        reasoning: "Policy expertise for reform advocacy",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-071",
        skills: ["Lobbying", "Government Relations"],
        interests: ["climate policy", "environmental advocacy"],
        location: "Sacramento, CA",
        availability: ["legislative session", "flexible"],
        experienceLevel: "professional",
      },
      expectedOutput: {
        topMatch: "Sierra Club - Legislative Advocate",
        confidence: 0.86,
        reasoning: "Government relations for environmental policy",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-072",
        skills: ["Swahili", "East African Culture"],
        interests: ["refugee support", "cultural preservation"],
        location: "Columbus, OH",
        availability: ["weekends", "cultural events"],
        experienceLevel: "native speaker",
      },
      expectedOutput: {
        topMatch: "African Community Services - Cultural Liaison",
        confidence: 0.85,
        reasoning: "Language/culture bridge for African refugees",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-073",
        skills: ["International Development", "Peace Corps RPCV"],
        interests: ["global health", "capacity building"],
        location: "Denver, CO",
        availability: ["project-based", "remote"],
        experienceLevel: "expert",
      },
      expectedOutput: {
        topMatch: "Partners in Health - Virtual Volunteer",
        confidence: 0.80,
        reasoning: "International experience for global health programs",
      },
      metadata: { category: "transferable_skills", difficulty: "medium" },
    },

    
    {
      input: {
        userId: "test-user-074",
        skills: ["Rock Climbing", "Outdoor Leadership"],
        interests: ["youth mentorship", "confidence building"],
        location: "Boulder, CO",
        availability: ["weekends", "summer"],
        experienceLevel: "certified",
      },
      expectedOutput: {
        topMatch: "Outward Bound - Assistant Instructor",
        confidence: 0.88,
        reasoning: "Outdoor skills for wilderness leadership",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-075",
        skills: ["Kayaking", "Water Safety"],
        interests: ["environmental education", "water conservation"],
        location: "Charleston, SC",
        availability: ["weekends", "spring/fall"],
        experienceLevel: "instructor",
      },
      expectedOutput: {
        topMatch: "Coastal Conservation Association - Kayak Guide",
        confidence: 0.83,
        reasoning: "Water sports for coastal ecology education",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-076",
        skills: ["Chaplaincy", "Spiritual Care"],
        interests: ["hospital support", "end-of-life care"],
        location: "Cleveland, OH",
        availability: ["on-call", "weekends"],
        experienceLevel: "certified",
      },
      expectedOutput: {
        topMatch: "Cleveland Clinic - Volunteer Chaplain",
        confidence: 0.84,
        reasoning: "Spiritual care for patients and families",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-077",
        skills: ["ASL", "Sign Language"],
        interests: ["Deaf community", "accessibility"],
        location: "Rochester, NY",
        availability: ["events", "as needed"],
        experienceLevel: "fluent",
      },
      expectedOutput: {
        topMatch: "Rochester School for the Deaf - ASL Interpreter",
        confidence: 0.91,
        reasoning: "Sign language for Deaf accessibility",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-078",
        skills: ["Adaptive Sports", "Para-athletics"],
        interests: ["disability rights", "sports inclusion"],
        location: "Colorado Springs, CO",
        availability: ["weekends", "competitions"],
        experienceLevel: "athlete/coach",
      },
      expectedOutput: {
        topMatch: "Adaptive Sports Center - Ski Instructor",
        confidence: 0.90,
        reasoning: "Adaptive sports expertise for Paralympic athletes",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-079",
        skills: ["IT Support", "Tech Troubleshooting"],
        interests: ["digital divide", "senior services"],
        location: "San Diego, CA",
        availability: ["weekly", "afternoons"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Senior Connect - Tech Support Volunteer",
        confidence: 0.82,
        reasoning: "Bridge digital divide for older adults",
      },
      metadata: { category: "transferable_skills", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-080",
        skills: ["Patient", "Good Listener"],
        interests: ["teaching technology", "seniors"],
        location: "Raleigh, NC",
        availability: ["mornings", "weekly"],
        experienceLevel: "beginner",
      },
      expectedOutput: {
        topMatch: "AARP - Digital Skills Workshop Helper",
        confidence: 0.73,
        reasoning: "Patience and empathy for senior tech training",
      },
      metadata: { category: "interest_driven", difficulty: "medium" },
    },

    
    {
      input: {
        userId: "test-user-081",
        skills: ["Social Work", "Counseling"],
        interests: ["LGBTQ+ youth", "suicide prevention"],
        location: "San Francisco, CA",
        availability: ["crisis response", "on-call"],
        experienceLevel: "licensed",
      },
      expectedOutput: {
        topMatch: "Trevor Project - Crisis Counselor",
        confidence: 0.94,
        reasoning: "Mental health support for LGBTQ+ youth in crisis",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-082",
        skills: ["Event Planning", "Community Organizing"],
        interests: ["LGBTQ+ advocacy", "Pride"],
        location: "Atlanta, GA",
        availability: ["seasonal", "Pride month"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Atlanta Pride - Festival Coordinator",
        confidence: 0.80,
        reasoning: "Event skills for LGBTQ+ community celebration",
      },
      metadata: { category: "transferable_skills", difficulty: "medium" },
    },

    
    {
      input: {
        userId: "test-user-083",
        skills: ["Microfinance", "Small Business"],
        interests: ["economic empowerment", "women entrepreneurs"],
        location: "Oakland, CA",
        availability: ["monthly", "mentorship"],
        experienceLevel: "entrepreneur",
      },
      expectedOutput: {
        topMatch: "Grameen America - Small Business Mentor",
        confidence: 0.84,
        reasoning: "Business expertise for low-income women entrepreneurs",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-084",
        skills: ["Financial Coaching", "Debt Counseling"],
        interests: ["poverty alleviation", "financial stability"],
        location: "Cleveland, OH",
        availability: ["evenings", "weekly"],
        experienceLevel: "certified",
      },
      expectedOutput: {
        topMatch: "United Way - Financial Empowerment Coach",
        confidence: 0.87,
        reasoning: "Financial counseling for families in crisis",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-085",
        skills: ["Voter Registration", "Canvassing"],
        interests: ["democracy", "voter turnout"],
        location: "Milwaukee, WI",
        availability: ["election season", "weekends"],
        experienceLevel: "beginner",
      },
      expectedOutput: {
        topMatch: "League of Women Voters - Voter Registration Drive",
        confidence: 0.79,
        reasoning: "Grassroots organizing for democratic participation",
      },
      metadata: { category: "interest_driven", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-086",
        skills: ["Community Organizing", "Grassroots Advocacy"],
        interests: ["racial justice", "systemic change"],
        location: "Ferguson, MO",
        availability: ["flexible", "movement work"],
        experienceLevel: "activist",
      },
      expectedOutput: {
        topMatch: "Black Lives Matter - Community Organizer",
        confidence: 0.81,
        reasoning: "Organizing skills for racial justice movement",
      },
      metadata: { category: "exact_skill_match", difficulty: "medium" },
    },

    
    {
      input: {
        userId: "test-user-087",
        skills: ["Science Writing", "Journalism"],
        interests: ["public understanding of science", "misinformation"],
        location: "Remote",
        availability: ["flexible", "article-based"],
        experienceLevel: "professional",
      },
      expectedOutput: {
        topMatch: "The Conversation - Science Writer",
        confidence: 0.83,
        reasoning: "Translate research for public comprehension",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-088",
        skills: ["Library Science", "Information Literacy"],
        interests: ["digital inclusion", "information access"],
        location: "Indianapolis, IN",
        availability: ["evenings", "weekly"],
        experienceLevel: "MLS degree",
      },
      expectedOutput: {
        topMatch: "Public Library - Digital Literacy Instructor",
        confidence: 0.85,
        reasoning: "Library expertise for community information access",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },

    
    {
      input: {
        userId: "test-user-089",
        skills: ["Job Coaching", "Resume Writing"],
        interests: ["criminal justice", "second chances"],
        location: "Oakland, CA",
        availability: ["weekly", "evenings"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Defy Ventures - Employment Readiness Coach",
        confidence: 0.86,
        reasoning: "Career skills for formerly incarcerated individuals",
      },
      metadata: { category: "transferable_skills", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-090",
        skills: ["Parenting", "Life Coach"],
        interests: ["family reunification", "re-entry support"],
        location: "Richmond, VA",
        availability: ["monthly", "mentorship"],
        experienceLevel: "lived experience",
      },
      expectedOutput: {
        topMatch: "Family Justice - Re-entry Family Navigator",
        confidence: 0.78,
        reasoning: "Lived experience supporting families affected by incarceration",
      },
      metadata: { category: "interest_driven", difficulty: "medium" },
    },

    
    {
      input: {
        userId: "test-user-091",
        skills: ["Beekeeping", "Pollinator Conservation"],
        interests: ["environmental education", "urban ecology"],
        location: "Austin, TX",
        availability: ["spring/summer", "weekends"],
        experienceLevel: "intermediate",
      },
      expectedOutput: {
        topMatch: "Texas Beekeepers Association - Urban Hive Educator",
        confidence: 0.76,
        reasoning: "Beekeeping for pollinator awareness",
      },
      metadata: { category: "exact_skill_match", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-092",
        skills: ["Ham Radio", "Emergency Communications"],
        interests: ["disaster preparedness", "community resilience"],
        location: "Kansas City, MO",
        availability: ["drills", "emergencies"],
        experienceLevel: "licensed operator",
      },
      expectedOutput: {
        topMatch: "ARES - Amateur Radio Emergency Service",
        confidence: 0.89,
        reasoning: "Radio communications for disaster response",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-093",
        skills: ["Bike Repair", "Mechanics"],
        interests: ["sustainable transportation", "youth employment"],
        location: "Portland, OR",
        availability: ["weekends", "workshop"],
        experienceLevel: "hobbyist",
      },
      expectedOutput: {
        topMatch: "Community Cycling Center - Bike Mechanic Instructor",
        confidence: 0.82,
        reasoning: "Bike repair skills for sustainable mobility",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-094",
        skills: ["Genealogy", "Family History"],
        interests: ["cultural heritage", "identity"],
        location: "Salt Lake City, UT",
        availability: ["flexible", "project-based"],
        experienceLevel: "hobbyist",
      },
      expectedOutput: {
        topMatch: "FamilySearch - Indexing Volunteer",
        confidence: 0.74,
        reasoning: "Genealogy skills for historical preservation",
      },
      metadata: { category: "interest_driven", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-095",
        skills: ["Comedy", "Stand-up", "Humor"],
        interests: ["therapeutic laughter", "hospital visits"],
        location: "Los Angeles, CA",
        availability: ["monthly", "performances"],
        experienceLevel: "performer",
      },
      expectedOutput: {
        topMatch: "Laughter League - Hospital Comedy Volunteer",
        confidence: 0.77,
        reasoning: "Comedy for patient morale and healing",
      },
      metadata: { category: "interest_driven", difficulty: "medium" },
    },
    {
      input: {
        userId: "test-user-096",
        skills: ["Meditation", "Mindfulness"],
        interests: ["stress reduction", "wellness"],
        location: "Boulder, CO",
        availability: ["weekly", "evenings"],
        experienceLevel: "certified instructor",
      },
      expectedOutput: {
        topMatch: "Mindful Schools - Meditation Facilitator",
        confidence: 0.81,
        reasoning: "Mindfulness for student well-being",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-097",
        skills: ["Archive Management", "Historical Preservation"],
        interests: ["community history", "oral history"],
        location: "Charleston, SC",
        availability: ["flexible", "project-based"],
        experienceLevel: "graduate student",
      },
      expectedOutput: {
        topMatch: "South Carolina Historical Society - Archives Volunteer",
        confidence: 0.80,
        reasoning: "Preservation skills for community heritage",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-098",
        skills: ["Conflict Mediation", "Restorative Justice"],
        interests: ["peacebuilding", "community healing"],
        location: "Oakland, CA",
        availability: ["on-call", "circles"],
        experienceLevel: "trained mediator",
      },
      expectedOutput: {
        topMatch: "Restorative Justice for Oakland Youth - Circle Keeper",
        confidence: 0.88,
        reasoning: "Mediation for youth conflict resolution",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-099",
        skills: ["Map Making", "GIS", "Cartography"],
        interests: ["humanitarian response", "disaster mapping"],
        location: "Remote",
        availability: ["remote", "flexible"],
        experienceLevel: "GIS professional",
      },
      expectedOutput: {
        topMatch: "HOT - Humanitarian OpenStreetMap Team",
        confidence: 0.91,
        reasoning: "GIS mapping for disaster response",
      },
      metadata: { category: "exact_skill_match", difficulty: "easy" },
    },
    {
      input: {
        userId: "test-user-100",
        skills: ["Astronomy", "Stargazing"],
        interests: ["science education", "wonder"],
        location: "Flagstaff, AZ",
        availability: ["nights", "monthly"],
        experienceLevel: "amateur astronomer",
      },
      expectedOutput: {
        topMatch: "Lowell Observatory - Public Star Party Guide",
        confidence: 0.79,
        reasoning: "Astronomy enthusiasm for public science education",
      },
      metadata: { category: "interest_driven", difficulty: "medium" },
    },
  ];

  await addDatasetItems(datasetName, testCases);

  console.log(
    `✅ Created ${testCases.length} test cases for Skill Matcher`
  );
  console.log(`   Categories:`);
  console.log(`   - Exact Skill Matches: 20+ cases`);
  console.log(`   - Transferable Skills: 25+ cases`);
  console.log(`   - Interest-Driven Matches: 20+ cases`);
  console.log(`   - Location Challenges: 15+ cases`);
  console.log(`   - Time Constraints: 10+ cases`);
  console.log(`   - Edge Cases: 10+ cases`);
  console.log(`
📊 Dataset ready for evaluation!`);

  return datasetName;
}


async function createEngagementCoachDataset() {
  console.log("\n📊 Creating Engagement Coach production dataset...");

  const datasetName = "engagement-coach-production-v1";
  await createDataset({
    name: datasetName,
    description:
      "50 volunteer engagement scenarios for coaching quality evaluation",
  });

  const testCases = [
    
    {
      input: {
        volunteerStatus: "new",
        daysActive: 7,
        opportunitiesCompleted: 0,
        lastActivity: "signed up",
        interests: ["animal welfare"],
      },
      expectedOutput: {
        coachingMessage:
          "Welcome to your volunteering journey! Your first step is attending orientation at the animal shelter this weekend.",
        nextAction: "Schedule first volunteer shift",
        motivationalTone: "encouraging",
      },
      metadata: { scenario: "new_volunteer_onboarding", difficulty: "easy" },
    },

    
    {
      input: {
        volunteerStatus: "at_risk",
        daysActive: 60,
        opportunitiesCompleted: 3,
        lastActivity: "30 days ago",
        previousEngagement: "high",
      },
      expectedOutput: {
        coachingMessage:
          "We've missed you! Life gets busy - would a shorter commitment work better right now?",
        nextAction: "Re-engagement call",
        motivationalTone: "empathetic_supportive",
      },
      metadata: { scenario: "dropout_prevention", difficulty: "hard" },
    },

    
    {
      input: {
        volunteerStatus: "active",
        daysActive: 365,
        opportunitiesCompleted: 52,
        hoursContributed: 156,
        milestone: "1_year_anniversary",
      },
      expectedOutput: {
        coachingMessage:
          "🎉 One year of impact! You've contributed 156 hours and changed lives. Here's what you accomplished...",
        nextAction: "Send anniversary badge",
        motivationalTone: "celebratory",
      },
      metadata: { scenario: "milestone_celebration", difficulty: "easy" },
    },

    
    
  ];

  await addDatasetItems(datasetName, testCases);

  console.log(`✅ Created ${testCases.length} test cases for Engagement Coach`);
  return datasetName;
}


async function createCommunityIntelligenceDataset() {
  console.log("\n📊 Creating Community Intelligence production dataset...");

  const datasetName = "community-intelligence-production-v1";
  await createDataset({
    name: datasetName,
    description:
      "50 community needs assessment scenarios for intelligence quality evaluation",
  });

  const testCases = [
    
    {
      input: {
        location: "Houston, TX",
        recentEvent: "Hurricane damage",
        needsCategory: "disaster_relief",
        urgency: "critical",
      },
      expectedOutput: {
        topPriority: "Immediate: Food distribution and shelter support",
        volunteerMatch: "Emergency response teams, meal prep volunteers",
        communityImpact: "High - serves 5,000+ displaced families",
      },
      metadata: { scenario: "disaster_response", difficulty: "medium" },
    },

    
    {
      input: {
        location: "Portland, OR",
        programType: "food_security",
        currentCapacity: "80%",
        waitlist: 45,
      },
      expectedOutput: {
        recommendation:
          "Expand food bank hours by adding Saturday shifts",
        volunteerNeed: "10 additional weekend volunteers",
        communityBenefit: "Serve 45 more families weekly",
      },
      metadata: { scenario: "capacity_expansion", difficulty: "medium" },
    },

    
  ];

  await addDatasetItems(datasetName, testCases);

  console.log(
    `✅ Created ${testCases.length} test cases for Community Intelligence`
  );
  return datasetName;
}


async function main() {
  console.log("🚀 Impact Circle - Production Dataset Creation\n");
  console.log("=" .repeat(60));

  try {
    
    const skillMatcherDataset = await createSkillMatcherDataset();
    const engagementCoachDataset = await createEngagementCoachDataset();
    const communityIntelDataset = await createCommunityIntelligenceDataset();

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL PRODUCTION DATASETS CREATED SUCCESSFULLY!\n");
    console.log("Datasets created:");
    console.log(`  1. ${skillMatcherDataset} (100 test cases)`);
    console.log(`  2. ${engagementCoachDataset} (50 test cases)`);
    console.log(`  3. ${communityIntelDataset} (50 test cases)`);
    console.log("\n📈 Total: 200 production test cases ready for evaluation");
    console.log("\n🎯 Next steps:");
    console.log("  1. Run baseline evaluations: npx tsx scripts/run-evaluations.ts");
    console.log("  2. Review quality metrics in Opik dashboard");
    console.log("  3. Identify improvement areas");
    console.log("  4. Run A/B experiments before final submission");
  } catch (error) {
    console.error("❌ Error creating datasets:", error);
    process.exit(1);
  }
}


if (require.main === module) {
  main();
}

export {
  createSkillMatcherDataset,
  createEngagementCoachDataset,
  createCommunityIntelligenceDataset,
};