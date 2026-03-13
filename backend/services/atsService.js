// Standard resume sections that ATS systems look for
const REQUIRED_SECTIONS = [
    'experience',
    'education',
    'skills',
    'contact'
];

// Keywords that indicate each section
const SECTION_KEYWORDS = {
    experience: ['experience', 'work history', 'employment', 'career', 'professional background', 'work experience'],
    education: ['education', 'academic', 'degree', 'university', 'college', 'school', 'qualification'],
    skills: ['skills', 'technical skills', 'core competencies', 'expertise', 'proficiencies'],
    contact: ['email', 'phone', 'address', 'linkedin', 'portfolio', 'contact']
};

// ATS-unfriendly elements that may cause parsing issues
const PROBLEMATIC_PATTERNS = {
    specialCharacters: /[★☆♦◊●○■□▪▫→←↑↓↔]/g,
    tables: /\|.*\|/g,
    multipleSpaces: /\s{3,}/g,
    urls: /https?:\/\/[^\s]+/g
};

// Simple tokenizer function to avoid natural package dependency issues
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0);
}

/**
 * Analyze resume text for ATS compatibility
 * @param {string} resumeText - Extracted resume text
 * @param {string|null} jobDescription - Optional job description for keyword matching
 * @returns {object} Analysis results with score, issues, suggestions, and details
 */
function analyzeResume(resumeText, jobDescription = null) {
    const analysis = {
        score: 0,
        issues: [],
        suggestions: [],
        details: {
            formatting: {},
            content: {},
            keywords: {},
            sections: {},
            contact: {}
        }
    };

    // 1. Check for required sections (20 points max)
    const sectionsScore = checkSections(resumeText, analysis);

    // 2. Check formatting (25 points max)
    const formattingScore = checkFormatting(resumeText, analysis);

    // 3. Check contact information (15 points max)
    const contactScore = checkContactInfo(resumeText, analysis);

    // 4. Check content quality (20 points max)
    const contentScore = checkContent(resumeText, analysis);

    // 5. Check keyword optimization (20 points max)
    const keywordScore = checkKeywords(resumeText, jobDescription, analysis);

    // Calculate total score (0-100)
    analysis.score = Math.round(
        sectionsScore + formattingScore + contactScore + contentScore + keywordScore
    );

    // Generate overall suggestions based on analysis
    generateSuggestions(analysis);

    return analysis;
}

/**
 * Check for required resume sections
 */
function checkSections(text, analysis) {
    const textLower = text.toLowerCase();
    const foundSections = [];
    const missingSections = [];

    REQUIRED_SECTIONS.forEach(section => {
        const keywords = SECTION_KEYWORDS[section];
        const found = keywords.some(keyword => textLower.includes(keyword));

        if (found) {
            foundSections.push(section);
        } else {
            missingSections.push(section);
        }
    });

    analysis.details.sections = {
        found: foundSections,
        missing: missingSections
    };

    const score = (foundSections.length / REQUIRED_SECTIONS.length) * 20;

    if (missingSections.length > 0) {
        analysis.issues.push({
            category: 'sections',
            severity: 'high',
            message: `Missing standard sections: ${missingSections.join(', ')}`,
            impact: 'ATS systems look for standard section headers'
        });
    }

    return score;
}

/**
 * Check resume formatting for ATS compatibility
 */
function checkFormatting(text, analysis) {
    let score = 25;
    const issues = [];

    // Check for special characters that may not parse correctly
    if (PROBLEMATIC_PATTERNS.specialCharacters.test(text)) {
        score -= 5;
        issues.push({
            category: 'formatting',
            severity: 'medium',
            message: 'Special characters detected (bullets, symbols)',
            impact: 'May not be parsed correctly by ATS'
        });
    }

    // Check for table-like structures
    if (PROBLEMATIC_PATTERNS.tables.test(text)) {
        score -= 5;
        issues.push({
            category: 'formatting',
            severity: 'high',
            message: 'Table-like structures detected',
            impact: 'Tables are difficult for ATS to parse'
        });
    }

    // Check for excessive spacing
    if (PROBLEMATIC_PATTERNS.multipleSpaces.test(text)) {
        score -= 3;
        issues.push({
            category: 'formatting',
            severity: 'low',
            message: 'Excessive spacing detected',
            impact: 'May cause parsing errors'
        });
    }

    // Check resume length
    const wordCount = tokenize(text).length;
    analysis.details.formatting.wordCount = wordCount;

    if (wordCount < 200) {
        score -= 7;
        issues.push({
            category: 'formatting',
            severity: 'high',
            message: 'Resume is too short (< 200 words)',
            impact: 'Insufficient information for ATS analysis'
        });
    } else if (wordCount > 1000) {
        score -= 5;
        issues.push({
            category: 'formatting',
            severity: 'medium',
            message: 'Resume is very long (> 1000 words)',
            impact: 'May be too detailed; consider condensing'
        });
    }

    analysis.details.formatting.issues = issues;
    analysis.issues.push(...issues);

    return Math.max(score, 0);
}

/**
 * Check for contact information
 */
function checkContactInfo(text, analysis) {
    let score = 15;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

    const hasEmail = emailRegex.test(text);
    const hasPhone = phoneRegex.test(text);

    analysis.details.contact = {
        hasEmail,
        hasPhone
    };

    if (!hasEmail) {
        score -= 8;
        analysis.issues.push({
            category: 'contact',
            severity: 'high',
            message: 'No email address detected',
            impact: 'Contact information is essential for ATS'
        });
    }

    if (!hasPhone) {
        score -= 7;
        analysis.issues.push({
            category: 'contact',
            severity: 'high',
            message: 'No phone number detected',
            impact: 'Contact information is essential for ATS'
        });
    }

    return Math.max(score, 0);
}

/**
 * Check content quality
 */
function checkContent(text, analysis) {
    let score = 20;
    const tokens = tokenize(text);

    // Check for action verbs
    const actionVerbs = [
        'achieved', 'improved', 'developed', 'managed', 'led', 'created',
        'implemented', 'designed', 'increased', 'reduced', 'generated',
        'analyzed', 'coordinated', 'established', 'executed', 'launched',
        'optimized', 'streamlined', 'transformed', 'built', 'delivered'
    ];

    const actionVerbCount = tokens.filter(token =>
        actionVerbs.includes(token.toLowerCase())
    ).length;

    analysis.details.content.actionVerbs = actionVerbCount;

    if (actionVerbCount < 5) {
        score -= 8;
        analysis.issues.push({
            category: 'content',
            severity: 'medium',
            message: 'Limited use of action verbs',
            impact: 'Action verbs improve ATS scoring and readability'
        });
    }

    // Check for quantifiable achievements
    const numberRegex = /\d+%?/g;
    const numbers = text.match(numberRegex) || [];

    analysis.details.content.quantifiableAchievements = numbers.length;

    if (numbers.length < 3) {
        score -= 7;
        analysis.issues.push({
            category: 'content',
            severity: 'medium',
            message: 'Few quantifiable achievements detected',
            impact: 'Numbers and metrics strengthen your resume'
        });
    }

    // Check for personal pronouns (should be avoided in resumes)
    const pronouns = ['i', 'my', 'me', 'we', 'our'];
    const pronounCount = tokens.filter(token =>
        pronouns.includes(token.toLowerCase())
    ).length;

    if (pronounCount > 5) {
        score -= 5;
        analysis.issues.push({
            category: 'content',
            severity: 'low',
            message: 'Excessive use of personal pronouns',
            impact: 'Resumes should use action-oriented language'
        });
    }

    return Math.max(score, 0);
}

/**
 * Check keyword optimization
 */
function checkKeywords(resumeText, jobDescription, analysis) {
    let score = 20;

    const tokens = tokenize(resumeText);
    const uniqueWords = new Set(tokens);

    if (!jobDescription) {
        // Basic keyword density check without job description
        analysis.details.keywords = {
            totalWords: tokens.length,
            uniqueWords: uniqueWords.size,
            density: tokens.length > 0 ? (uniqueWords.size / tokens.length * 100).toFixed(1) : '0'
        };

        if (uniqueWords.size < 50) {
            score -= 10;
            analysis.issues.push({
                category: 'keywords',
                severity: 'medium',
                message: 'Limited vocabulary variety',
                impact: 'More diverse keywords improve ATS matching'
            });
        }

        return score;
    }

    // Keyword matching with job description
    const jobKeywords = extractTopKeywords(jobDescription, 20);
    const resumeKeywords = extractTopKeywords(resumeText, 30);

    const matchedKeywords = jobKeywords.filter(jk =>
        resumeKeywords.some(rk => rk.toLowerCase() === jk.toLowerCase())
    );

    const matchRate = jobKeywords.length > 0
        ? (matchedKeywords.length / jobKeywords.length) * 100
        : 0;

    analysis.details.keywords = {
        jobKeywords,
        resumeKeywords: resumeKeywords.slice(0, 20),
        matchedKeywords,
        matchRate: Math.round(matchRate)
    };

    // Score based on match rate
    if (matchRate < 30) {
        score -= 15;
        analysis.issues.push({
            category: 'keywords',
            severity: 'high',
            message: `Low keyword match rate (${Math.round(matchRate)}%)`,
            impact: 'Resume may not pass ATS screening'
        });
    } else if (matchRate < 50) {
        score -= 10;
        analysis.issues.push({
            category: 'keywords',
            severity: 'medium',
            message: `Moderate keyword match rate (${Math.round(matchRate)}%)`,
            impact: 'Consider adding more relevant keywords'
        });
    } else if (matchRate < 70) {
        score -= 5;
    }

    return Math.max(score, 0);
}

/**
 * Extract top keywords from text
 */
function extractTopKeywords(text, count) {
    const tokens = tokenize(text);

    // Common stop words to filter out
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has',
        'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may',
        'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you',
        'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where',
        'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
        'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
        'so', 'than', 'too', 'very', 'as', 'from', 'by', 'about', 'into',
        'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
        'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
    ]);

    const filtered = tokens.filter(token =>
        token.length > 2 && !stopWords.has(token) && !/^\d+$/.test(token)
    );

    // Count frequency
    const frequency = {};
    filtered.forEach(token => {
        frequency[token] = (frequency[token] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.keys(frequency)
        .sort((a, b) => frequency[b] - frequency[a])
        .slice(0, count);
}

/**
 * Generate suggestions based on analysis
 */
function generateSuggestions(analysis) {
    const { score, issues } = analysis;

    if (score >= 90) {
        analysis.suggestions.push('Excellent! Your resume is well-optimized for ATS.');
    } else if (score >= 75) {
        analysis.suggestions.push('Good job! Minor improvements will make your resume even better.');
    } else if (score >= 60) {
        analysis.suggestions.push('Your resume needs some improvements for better ATS compatibility.');
    } else {
        analysis.suggestions.push('Your resume requires significant improvements for ATS optimization.');
    }

    // Priority suggestions based on high-severity issues
    const highSeverityIssues = issues.filter(i => i.severity === 'high');

    if (highSeverityIssues.length > 0) {
        analysis.suggestions.push(
            `High priority: Fix ${highSeverityIssues.length} critical issue(s) first.`
        );
    }

    // Specific suggestions based on issue categories
    if (issues.some(i => i.category === 'sections')) {
        analysis.suggestions.push('Add all standard resume sections with clear headers.');
    }

    if (issues.some(i => i.category === 'contact')) {
        analysis.suggestions.push('Include complete contact information (email and phone).');
    }

    if (issues.some(i => i.category === 'formatting')) {
        analysis.suggestions.push('Simplify formatting: avoid tables, special characters, and graphics.');
    }

    if (issues.some(i => i.category === 'content')) {
        analysis.suggestions.push('Use more action verbs and quantifiable achievements.');
    }

    if (issues.some(i => i.category === 'keywords')) {
        analysis.suggestions.push('Incorporate relevant keywords from the job description.');
    }
}

module.exports = {
    analyzeResume,
    tokenize,
    checkSections,
    checkFormatting,
    checkContactInfo,
    checkContent,
    checkKeywords,
    extractTopKeywords
};
