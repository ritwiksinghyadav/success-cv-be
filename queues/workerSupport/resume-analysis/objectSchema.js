import { z } from "zod";

// Simplified schema for better AI generation success
const JobFit = ["MAYBE", "FIT", "UNFIT"];

// More flexible schema with many optional fields
export const candidateSchemaSimplified = z.object({
  personal_info: z.object({
    name: z.string().describe("Name is required"),
    email: z.string().describe("Email address. If not present, use empty string."),
    phone: z.string().describe("Phone number. If not present, use empty string."),
    address: z.string().describe("Address. If not present, use empty string."),
    summary: z.string().describe("Summary. If not present, use empty string.")
  }),

  experiences: z.array(z.object({
    company: z.string().describe("Company name. If not present, use empty string."),
    position: z.string().describe("Position. If not present, use empty string."),
    website: z.string().describe("Website. If not present, use empty string."),
    start_date: z.string().describe("Start date. If not present, use empty string."),
    end_date: z.string().describe("End date. If not present, use empty string."),
    summary: z.string().describe("Summary. If not present, use empty string."),
    highlights: z.array(z.string()).describe("Highlights. If none, use empty array.")
  })).describe("Experiences. If no experience, use empty array."),

  education: z.array(z.object({
    institution: z.string().describe("Institution. If not present, use empty string."),
    area: z.string().describe("Field of study. If not present, use empty string."),
    study_type: z.string().describe("Degree type. If not present, use empty string."),
    start_date: z.string().describe("Start date. If not present, use empty string."),
    end_date: z.string().describe("End date. If not present, use empty string."),
    gpa: z.string().describe("GPA. If not present, use empty string.")
  })).describe("Education. If no education, use empty array."),

  social: z.array(z.object({
    name: z.string().describe("Platform name. If not present, use empty string."),
    url: z.string().describe("URL. If not present, use empty string.")
  })).describe("Social profiles. If none, use empty array."),

  certificates: z.array(z.object({
    name: z.string().describe("Certificate name. If not present, use empty string."),
    authority: z.string().describe("Authority. If not present, use empty string."),
    certification_id: z.string().describe("ID. If not present, use empty string."),
    start_date: z.string().describe("Start date. If not present, use empty string."),
    end_date: z.string().describe("End date. If not present, use empty string.")
  })).describe("Certificates. If none, use empty array."),

  achievements: z.array(z.object({
    title: z.string().describe("Achievement title. If not present, use empty string."),
    date: z.string().describe("Date. If not present, use empty string."),
    description: z.string().describe("Description. If not present, use empty string.")
  })).describe("Achievements. If none, use empty array."),

  languages: z.array(z.object({
    name: z.string().describe("Language name. If not present, use empty string."),
    level: z.string().describe("Level. If not present, use empty string.")
  })).describe("Languages. If none, use empty array."),

  interests: z.array(z.object({
    name: z.string().describe("Interest name. If not present, use empty string."),
    keywords: z.array(z.string()).describe("Keywords. If none, use empty array.")
  })).describe("Interests. If none, use empty array."),

  hobbies: z.array(z.object({
    name: z.string().describe("Hobby name. If not present, use empty string."),
    description: z.string().describe("Description. If not present, use empty string."),
    tags: z.array(z.string()).describe("Tags. If none, use empty array.")
  })).describe("Hobbies. If none, use empty array."),

  other_skills: z.array(z.object({
    name: z.string().describe("Skill name. If not present, use empty string."),
    description: z.string().describe("Description. If not present, use empty string."),
    tags: z.array(z.string()).describe("Tags. If none, use empty array.")
  })).describe("Skills. If none, use empty array."),

  // Simplified personality assessment
  personality_job_fit: z.object({
    candidate_traits: z.object({
      realistic: z.boolean().describe("Realistic trait. If uncertain, use false."),
      investigative: z.boolean().describe("Investigative trait. If uncertain, use false."),
      artistic: z.boolean().describe("Artistic trait. If uncertain, use false."),
      social: z.boolean().describe("Social trait. If uncertain, use false."),
      enterprising: z.boolean().describe("Enterprising trait. If uncertain, use false."),
      conventional: z.boolean().describe("Conventional trait. If uncertain, use false.")
    }).describe("Candidate traits based on resume content."),
    
    intelligence_types: z.object({
      linguistic: z.boolean().describe("Linguistic intelligence. If uncertain, use false."),
      logical_mathematical: z.boolean().describe("Logical intelligence. If uncertain, use false."),
      musical: z.boolean().describe("Musical intelligence. If uncertain, use false."),
      bodily_kinesthetic: z.boolean().describe("Kinesthetic intelligence. If uncertain, use false."),
      spatial: z.boolean().describe("Spatial intelligence. If uncertain, use false."),
      interpersonal: z.boolean().describe("Interpersonal intelligence. If uncertain, use false."),
      intrapersonal: z.boolean().describe("Intrapersonal intelligence. If uncertain, use false."),
      naturalistic: z.boolean().describe("Naturalistic intelligence. If uncertain, use false.")
    }).describe("Intelligence types based on resume content."),
    
    personality_type: z.string().describe("Personality type. If uncertain, use empty string."),
    secondary_alignment: z.string().describe("Secondary alignment. If uncertain, use empty string."),
    personality_description: z.string().describe("Personality description. If uncertain, use empty string."),
    tags: z.array(z.string()).describe("Personality tags. If none, use empty array.")
  }).describe("Personality assessment based on resume content."),

  // Simplified relevance scoring
  relevance: z.object({
    "Skills Relevance": z.number().min(0).max(100).describe("Skills score 0-100."),
    "Match": z.boolean().describe("Profile match. If uncertain, use false."),
    "Work Experience": z.number().min(0).max(100).describe("Experience score 0-100."),
    "Education": z.number().min(0).max(100).describe("Education score 0-100."),
    "Achievements": z.number().min(0).max(100).describe("Achievements score 0-100."),
    "Career Progression": z.number().min(0).max(100).describe("Career score 0-100."),
    "Work History": z.number().min(0).max(100).describe("Work history score 0-100."),
    "Depth and Breadth": z.number().min(0).max(100).describe("Depth score 0-100."),
    "Quantifiable Metrics": z.number().min(0).max(100).describe("Metrics score 0-100."),
    "Qualifications": z.number().min(0).max(100).describe("Qualifications score 0-100."),
    "Involvement": z.number().min(0).max(100).describe("Involvement score 0-100."),
    "Keywords": z.number().min(0).max(100).describe("Keywords score 0-100."),
    "Overall Score": z.number().min(0).max(100).describe("Overall score 0-100."),
    "Strengths": z.string().describe("Strengths. If none, use empty string."),
    "Weaknesses": z.string().describe("Weaknesses. If none, use empty string."),
    "Description": z.string().describe("Description. If none, use empty string.")
  }).describe("Relevance scoring and assessment."),

  JobFitScore: z.number().min(0).max(100).describe("Job fit score 0-100."),
  jobFitReason: z.string().describe("Job fit reasoning. If none, use empty string."),

  // Resume Quality & Mistakes Analysis
  resume_quality: z.object({
    grammar_language_score: z.number().min(0).max(100).describe("Grammar & language quality score 0-100."),
    formatting_design_score: z.number().min(0).max(100).describe("Formatting & design score 0-100."),
    content_quality_score: z.number().min(0).max(100).describe("Content quality score 0-100."),
    ats_compatibility_score: z.number().min(0).max(100).describe("ATS compatibility score 0-100."),
    professional_branding_score: z.number().min(0).max(100).describe("Professional branding score 0-100."),
    completeness_score: z.number().min(0).max(100).describe("Completeness score 0-100."),
    overall_quality_score: z.number().min(0).max(100).describe("Overall resume quality score 0-100."),
    current_quality: z.number().min(0).max(100).describe("Current resume quality."),
    potential_after_fixes: z.number().min(0).max(100).describe("Potential quality after fixes."),
    improvement_points: z.number().min(0).max(100).describe("Expected improvement in points.")
  }).describe("Resume quality scoring separate from job fit."),

  // Critical Mistakes (Must Fix Immediately)
  critical_mistakes: z.array(z.object({
    category: z.string().describe("Mistake category (Grammar/Formatting/Content/ATS/etc.)."),
    section: z.string().describe("Resume section where mistake was found."),
    current_text: z.string().describe("Current problematic text or formatting."),
    issue: z.string().describe("Why this is problematic."),
    fix: z.string().describe("Specific corrected version."),
    priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).describe("Priority level."),
    impact: z.string().describe("Impact on hiring chances.")
  })).describe("Critical errors that must be fixed immediately. Provide 5-10 items."),

  // Major Issues (Significantly Hurt Chances)
  major_issues: z.array(z.object({
    category: z.string().describe("Issue category."),
    section: z.string().describe("Resume section."),
    current_text: z.string().describe("Current text or formatting."),
    issue: z.string().describe("Why this is problematic."),
    fix: z.string().describe("Recommended fix."),
    priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).describe("Priority level."),
    impact: z.string().describe("Impact description.")
  })).describe("Major issues that significantly reduce interview chances. Provide 5-15 items."),

  // Minor Improvements (Polish & Optimization)
  minor_improvements: z.array(z.object({
    category: z.string().describe("Improvement category."),
    section: z.string().describe("Resume section."),
    current_text: z.string().describe("Current text."),
    suggestion: z.string().describe("Improvement suggestion."),
    expected_benefit: z.string().describe("Expected benefit.")
  })).describe("Minor improvements for polish. Provide 10-20 items."),

  // Optimization Opportunities (Competitive Edge)
  optimization_opportunities: z.array(z.object({
    category: z.string().describe("Opportunity category."),
    description: z.string().describe("Enhancement description."),
    implementation: z.string().describe("How to implement."),
    competitive_advantage: z.string().describe("Competitive advantage gained.")
  })).describe("Enhancements to stand out. Provide 5-10 items."),

  // Actionable Improvement Plan
  improvement_plan: z.object({
    immediate_fixes: z.array(z.object({
      task: z.string().describe("Task description."),
      estimated_time: z.string().describe("Estimated time to complete."),
      priority: z.number().min(1).max(10).describe("Priority 1-10.")
    })).describe("Fixes for today (1 hour). Provide 3-5 tasks."),
    
    short_term_improvements: z.array(z.object({
      task: z.string().describe("Task description."),
      estimated_time: z.string().describe("Estimated time to complete."),
      priority: z.number().min(1).max(10).describe("Priority 1-10.")
    })).describe("Improvements for this week (3-5 hours). Provide 5-7 tasks."),
    
    medium_term_enhancements: z.array(z.object({
      task: z.string().describe("Task description."),
      estimated_time: z.string().describe("Estimated time to complete."),
      priority: z.number().min(1).max(10).describe("Priority 1-10.")
    })).describe("Enhancements for this month (10+ hours). Provide 3-5 tasks."),
    
    long_term_positioning: z.array(z.object({
      goal: z.string().describe("Long-term goal."),
      strategy: z.string().describe("Strategy to achieve."),
      timeline: z.string().describe("Expected timeline.")
    })).describe("Long-term career positioning. Provide 3-5 goals.")
  }).describe("Step-by-step improvement roadmap."),

  // Impact Analysis
  impact_analysis: z.object({
    current_interview_rate: z.number().min(0).max(100).describe("Estimated current interview rate %."),
    after_critical_fixes: z.number().min(0).max(100).describe("Expected rate after critical fixes %."),
    after_all_improvements: z.number().min(0).max(100).describe("Expected rate after all improvements %."),
    recruiter_time_to_reject: z.string().describe("Estimated time before rejection."),
    current_ats_pass_rate: z.number().min(0).max(100).describe("Current ATS pass-through rate %."),
    optimized_ats_pass_rate: z.number().min(0).max(100).describe("Optimized ATS pass rate %."),
    competitive_ranking: z.string().describe("Current ranking among similar candidates."),
    expected_ranking_improvement: z.string().describe("Expected ranking after improvements.")
  }).describe("Quantified impact of identified mistakes and improvements.")
});
