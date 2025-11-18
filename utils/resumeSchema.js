/**
 * Resume Data Schema
 * Defines the structure for parsed resume data
 */

/**
 * Validate and structure resume data
 * @param {Object} data - Raw resume data
 * @returns {Object} Validated resume data
 */
export function validateResumeData(data) {
    const resume = {
        personal_info: {
            name: data.personal_info?.name || null,
            email: data.personal_info?.email || null,
            phone: data.personal_info?.phone || null,
            location: data.personal_info?.location || null,
            linkedin: data.personal_info?.linkedin || null,
            portfolio: data.personal_info?.portfolio || null
        },
        
        summary: data.summary || data.career_summary?.summary || null,
        
        experience: (data.experiences || data.experience || []).map(exp => ({
            position: exp.position || exp.title || null,
            company: exp.company || null,
            duration: exp.duration || null,
            startDate: exp.startDate || exp.start_date || null,
            endDate: exp.endDate || exp.end_date || null,
            description: exp.description || exp.responsibilities || null,
            achievements: exp.achievements || []
        })),
        
        education: (data.education || []).map(edu => ({
            degree: edu.degree || null,
            field: edu.field || edu.field_of_study || null,
            institution: edu.institution || edu.school || null,
            year: edu.year || edu.graduation_year || null,
            gpa: edu.gpa || null
        })),
        
        skills: Array.isArray(data.skills) ? data.skills : [],
        
        certifications: (data.certifications || []).map(cert => ({
            name: cert.name || cert.title || null,
            issuer: cert.issuer || cert.organization || null,
            date: cert.date || cert.issue_date || null,
            expiryDate: cert.expiryDate || cert.expiry_date || null
        })),
        
        languages: (data.languages || []).map(lang => ({
            language: lang.language || lang.name || null,
            proficiency: lang.proficiency || lang.level || null
        })),
        
        projects: (data.projects || []).map(proj => ({
            name: proj.name || proj.title || null,
            description: proj.description || null,
            technologies: proj.technologies || [],
            url: proj.url || proj.link || null
        })),
        
        // Scoring and analysis
        ats_score: data.ats_score || data.atsScore || 0,
        job_fit_score: data.job_fit_score || data.jobFitScore || 0,
        completeness_score: data.completeness_score || data.completenessScore || 0,
        
        // Metadata
        total_experience_years: data.total_experience_years || 
                               data.career_summary?.total_work_experience_years || 
                               calculateExperienceYears(data.experiences || []),
        
        current_position: data.experiences?.[0]?.position || null,
        current_company: data.experiences?.[0]?.company || null,
        
        // Analysis insights
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        suggestions: data.suggestions || [],
        
        // Risk assessment
        risk_status: data.risk_status || data.riskStatus || 'UNKNOWN',
        risk_reason: data.risk_reason || data.riskReason || null
    };
    
    return resume;
}

/**
 * Calculate total years of experience from experience array
 * @param {Array} experiences - Array of experience objects
 * @returns {number} Total years of experience
 */
function calculateExperienceYears(experiences) {
    if (!Array.isArray(experiences) || experiences.length === 0) {
        return 0;
    }
    
    // Simple calculation: count entries (each assumed to be ~2 years on average)
    // For more accurate calculation, you'd parse dates
    return experiences.length * 2;
}

/**
 * Validate if data looks like a resume
 * @param {Object} data - Parsed data
 * @returns {boolean} True if it appears to be a resume
 */
export function isValidResume(data) {
    const hasPersonalInfo = data.personal_info?.name || data.personal_info?.email;
    const hasExperience = Array.isArray(data.experiences) && data.experiences.length > 0;
    const hasEducation = Array.isArray(data.education) && data.education.length > 0;
    const hasSkills = Array.isArray(data.skills) && data.skills.length > 0;
    
    // Resume should have at least personal info and one of: experience, education, or skills
    return hasPersonalInfo && (hasExperience || hasEducation || hasSkills);
}

/**
 * Validate email from resume
 * @param {Object} resumeData - Resume data
 * @returns {string|null} Validated email or null
 */
export function extractEmail(resumeData) {
    const email = resumeData.personal_info?.email;
    
    if (!email || typeof email !== 'string') {
        return null;
    }
    
    const trimmedEmail = email.trim();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmedEmail)) {
        return null;
    }
    
    return trimmedEmail;
}

export default {
    validateResumeData,
    isValidResume,
    extractEmail
};
