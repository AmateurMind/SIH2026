'use strict';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_FALLBACK_MODELS = ['llama-3.1-8b-instant', 'llama3-8b-8192'];
const GROQ_RATE_LIMIT_RETRIES = 1;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function tokenize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 0);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function tryParseJson(content) {
    if (!content) return null;
    try { return JSON.parse(content); } catch { /* fall through */ }
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
        try { return JSON.parse(content.slice(start, end + 1)); } catch { /* fall through */ }
    }
    return null;
}

function buildGroqModelList() {
    const primary = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
    return [...new Set([primary, ...GROQ_FALLBACK_MODELS])];
}

// ─── EXPERIENCE DETECTOR ─────────────────────────────────────────────────────
// Returns 0–30 bonus based on internship/work experience duration
const MONTH_MAP = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, july:6, aug:7, sep:8, sept:8, oct:9, nov:10, dec:11 };

function parseDateRanges(text) {
    const re = /(jan|feb|mar|apr|may|jun|jul|july|aug|sep|sept|oct|nov|dec)\.?\s*(\d{4})\s*[-–—]+\s*(jan|feb|mar|apr|may|jun|jul|july|aug|sep|sept|oct|nov|dec|present)\.?\s*(\d{4})?/gi;
    let totalMonths = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
        const sm = MONTH_MAP[m[1].toLowerCase()];
        const sy = parseInt(m[2]);
        let em, ey;
        if (m[3].toLowerCase() === 'present') {
            const now = new Date(); em = now.getMonth(); ey = now.getFullYear();
        } else {
            em = MONTH_MAP[m[3].toLowerCase()]; ey = m[4] ? parseInt(m[4]) : sy;
        }
        if (sm !== undefined && em !== undefined) {
            const months = (ey - sy) * 12 + (em - sm);
            if (months > 0 && months <= 18) totalMonths += months;
        }
    }
    return totalMonths;
}

function detectExperienceScore(text) {
    // Try explicit "X month internship" patterns first
    const durationPatterns = [
        { re: /(?:1[2-9]|[2-9]\d)\s*months?\s*(?:of\s*)?(?:internship|intern|experience|work)/i, score: 30 },
        { re: /(?:internship|intern|experience|work)\s*(?:for\s*)?(?:1[2-9]|[2-9]\d)\s*months?/i, score: 30 },
        { re: /[1-9]\+?\s*years?\s*(?:of\s*)?(?:internship|intern|experience|work)/i, score: 30 },
        { re: /([6-9]|1[0-1])\s*months?\s*(?:of\s*)?(?:internship|intern|experience|work)/i, score: 20 },
        { re: /(?:internship|intern|experience|work)\s*(?:for\s*)?[6-9]\s*months?/i, score: 20 },
        { re: /[3-5]\s*months?\s*(?:of\s*)?(?:internship|intern|experience|work)/i, score: 14 },
        { re: /(?:internship|intern|experience|work)\s*(?:for\s*)?[3-5]\s*months?/i, score: 14 },
        { re: /[1-2]\s*months?\s*(?:of\s*)?(?:internship|intern|experience|work)/i, score: 8 },
        { re: /(?:internship|intern|experience|work)\s*(?:for\s*)?[1-2]\s*months?/i, score: 8 },
    ];

    for (const { re, score } of durationPatterns) {
        if (re.test(text)) return { score, parsedMonths: 0, source: 'explicit' };
    }

    // Parse date ranges like "Aug 2024 – Oct 2024"
    const parsedMonths = parseDateRanges(text);
    if (parsedMonths >= 12) return { score: 30, parsedMonths, source: 'date-range' };
    if (parsedMonths >= 6)  return { score: 20, parsedMonths, source: 'date-range' };
    if (parsedMonths >= 3)  return { score: 14, parsedMonths, source: 'date-range' };
    if (parsedMonths >= 1)  return { score: 8,  parsedMonths, source: 'date-range' };

    // Fallback: just mentions internship
    if (/\b(?:internship|intern)\b/i.test(text)) return { score: 5, parsedMonths: 0, source: 'mention' };

    return { score: 0, parsedMonths: 0, source: 'none' };
}

// ─── ACHIEVEMENT DETECTOR ─────────────────────────────────────────────────────
// Returns 0–20 based on national-level hackathons, competitions
function detectAchievementScore(text) {
    let bonus = 0;
    const sihMention   = /\bsmart\s*india\s*hackathon\b|\bsih\b/i.test(text);
    const winnerWords  = /\b(winner|won|1st|first|champion|finalist|top\s*\d+)\b/i.test(text);
    const eyrcMention  = /\b(e[\s-]?yantra|eyrc)\b/i.test(text);
    const nationalMention  = /\bnational|all\s*india\b/i.test(text);
    const hackathonMention = /\bhackathon\b/i.test(text);

    const sihWinner  = sihMention  && winnerWords;
    const eyrcWinner = eyrcMention && winnerWords;

    if (sihWinner)  bonus += 20; else if (sihMention)  bonus += 14;
    if (eyrcWinner) bonus += 18; else if (eyrcMention) bonus += 12;
    if (!sihWinner && !eyrcWinner && hackathonMention && nationalMention && winnerWords) bonus += 14;
    else if (hackathonMention && nationalMention) bonus += 8;
    else if (hackathonMention) bonus += 4;

    // Competitive coding bonus
    if (/\bleetcode\b|\bhackerrank\b|\bcodechef\b|\bcodeforces\b|\bhackerearth\b/i.test(text)) bonus += 4;

    return Math.min(20, bonus);
}

// ─── RESUME QUALITY CHECKS (rule-based, 0-10 scale) ──────────────────────────
function getResumeQualityScore(text) {
    let score = 10;
    const tokens = tokenize(text);
    const wordCount = tokens.length;

    // Section check
    const sectionKeywords = {
        experience: ['experience', 'work history', 'employment'],
        education:  ['education', 'academic', 'degree', 'university'],
        skills:     ['skills', 'technical skills', 'core competencies'],
        contact:    ['email', 'phone', 'linkedin', 'contact']
    };
    const textLower = text.toLowerCase();
    const missingSections = Object.entries(sectionKeywords)
        .filter(([, kws]) => !kws.some(kw => textLower.includes(kw)))
        .map(([s]) => s);

    if (missingSections.length > 0) score -= missingSections.length * 1.5;
    if (!/@[\w-]+\.\w+/.test(text)) score -= 2;   // no email
    if (wordCount < 200) score -= 3;
    if (/\|.*\|/.test(text)) score -= 2;          // tables

    const details = {
        formatting: { wordCount, issues: [] },
        content: {
            actionVerbs: tokens.filter(t => ['achieved','improved','developed','managed','led','created','implemented','designed','increased','reduced','built','delivered','launched','optimized'].includes(t)).length,
            quantifiableAchievements: (text.match(/\d+%?/g) || []).length
        },
        sections: {
            found: Object.keys(sectionKeywords).filter(s => !missingSections.includes(s)),
            missing: missingSections
        },
        contact: {
            hasEmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text),
            hasPhone: /(\+?\d{1,3}[.\s]?)?\(?\d{3}\)?[.\s]?\d{3}[.\s]?\d{4}/.test(text)
        }
    };

    return { score: Math.max(0, Math.min(10, Math.round(score))), details };
}

// ─── ISSUE GENERATOR ──────────────────────────────────────────────────────────
function generateIssues(quality, experienceResult) {
    const issues = [];
    if (quality.details.sections.missing.length > 0) {
        issues.push({ category: 'sections', severity: 'high', message: `Missing standard sections: ${quality.details.sections.missing.join(', ')}`, impact: 'ATS systems look for standard section headers' });
    }
    if (!quality.details.contact.hasEmail) {
        issues.push({ category: 'contact', severity: 'high', message: 'No email address detected', impact: 'Contact info is essential' });
    }
    if (!quality.details.contact.hasPhone) {
        issues.push({ category: 'contact', severity: 'high', message: 'No phone number detected', impact: 'Contact info is essential' });
    }
    if (quality.details.formatting.wordCount < 200) {
        issues.push({ category: 'formatting', severity: 'high', message: 'Resume is too short (< 200 words)', impact: 'Insufficient content for ATS analysis' });
    }
    if (quality.details.content.actionVerbs < 5) {
        issues.push({ category: 'content', severity: 'medium', message: 'Limited use of action verbs', impact: 'Action verbs improve ATS scoring' });
    }
    if (quality.details.content.quantifiableAchievements < 3) {
        issues.push({ category: 'content', severity: 'medium', message: 'Few quantifiable achievements (numbers/metrics)', impact: 'Numbers strengthen your resume' });
    }
    if (experienceResult.score === 0) {
        issues.push({ category: 'experience', severity: 'medium', message: 'No internship/work experience detected', impact: 'Experience significantly boosts your ATS score' });
    }
    return issues;
}

// ─── AI INSIGHTS (Groq) ───────────────────────────────────────────────────────
async function getAIInsights(resumeText, jobDescription) {
    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
        console.warn('[ATS] GROQ_API_KEY not set — skipping AI analysis');
        return null;
    }

    const roleContext = jobDescription
        ? `TARGET JOB DESCRIPTION:\n${jobDescription.slice(0, 800)}`
        : 'No specific job description — perform a general campus placement/internship readiness analysis.';

    const prompt = `You are an expert Technical Recruiter and ATS Analyzer for campus placements. Most candidates are college students (B.Tech, BCA, BBA, MBA) applying for internships or placements.

RULES:
- Do NOT expect years of professional experience. Value academic projects, hackathons, certifications, coursework.
- SIH (Smart India Hackathon) / eYRC / national hackathon winners are exceptional — flag clearly.
- NPTEL, Coursera, Udemy certificates are valid initiative signals.
- Look for POTENTIAL and INTERNSHIP READINESS.
- A student who built a deployed full-stack app > one who only knows theory.
- More experience (internships, projects with dates) = higher candidateScore.
- No experience at all = score 0-8. 1-2 months = 8-14. 3-6 months = 14-20. 6+ months = 20-30.

${roleContext}

Return ONLY valid JSON (no markdown, no extra text):
{
  "candidateScore": <number 0-30, weighted heavily by real experience duration>,
  "candidateScoreReason": "<1 sentence>",
  "projectQuality": "<Low | Medium | High>",
  "executiveSummary": "<2 sentences. Mention SIH/eYRC/national hackathon if present. State internship readiness.>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "priorityFixes": ["<actionable fix 1>", "<actionable fix 2>", "<actionable fix 3>"],
  "rewrittenBullets": ["<improved resume bullet 1>", "<improved bullet 2>", "<improved bullet 3>"],
  "credibilityRisk": <number 0-10>,
  "redFlags": ["<flag 1>", "<flag 2>"]
}

candidateScore guide:
- 26-30: Exceptional — SIH/eYRC winner + strong evidence or 6+ months real experience + great projects
- 20-25: Strong — good projects + 3-6 months experience + relevant skills
- 13-19: Average — decent potential, 1-3 months or good projects but limited depth
- 7-12: Weak — minimal experience, shallow projects
- 0-6: Very weak — no experience, irrelevant content, or very low credibility`;

    const models = buildGroqModelList();

    for (const model of models) {
        for (let attempt = 0; attempt <= GROQ_RATE_LIMIT_RETRIES; attempt++) {
            try {
                const response = await fetch(GROQ_URL, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model,
                        messages: [{ role: 'user', content: `${prompt}\n\nRESUME TEXT:\n${resumeText.slice(0, 6000)}` }],
                        max_tokens: 1000,
                        temperature: 0.3
                    })
                });

                const data = await response.json().catch(() => null);

                if (!response.ok) {
                    const msg = data?.error?.message || `Groq ${response.status}`;
                    const isRateLimited = response.status === 429 || /rate.?limit/i.test(msg);
                    if (isRateLimited && attempt < GROQ_RATE_LIMIT_RETRIES) { await sleep(400 * (attempt + 1)); continue; }
                    console.warn(`[ATS] Groq ${model} failed: ${msg}`);
                    break;
                }

                const content = data?.choices?.[0]?.message?.content;
                const parsed = tryParseJson(content);
                if (parsed) {
                    parsed.candidateScore = Math.max(0, Math.min(30, Math.round(parsed.candidateScore ?? 0)));
                    parsed._modelUsed = model;
                    return parsed;
                }
                break;
            } catch (err) {
                console.warn(`[ATS] Groq error for ${model}:`, err?.message || err);
                break;
            }
        }
    }

    console.error('[ATS] AI insights unavailable after all Groq fallbacks');
    return null;
}

// ─── MAIN ANALYSIS FUNCTION ───────────────────────────────────────────────────
/**
 * Hybrid scoring (interngrad-style) — majority AI + experience driven:
 *   Achievement Bonus : 0–20  pts  (hackathons, SIH, eYRC)
 *   Experience Score  : 0–30  pts  (internship duration)
 *   AI Candidate Score: 0–30  pts  (Groq LLM, weighted by experience)
 *   Resume Quality    : 0–10  pts  (sections, formatting, contact)
 *   Keyword Match     : 0–10  pts  (if job description provided)
 *   Total             : 0–100 pts
 */
async function analyzeResume(resumeText, jobDescription = null) {
    // Parallel: detect rule-based signals + call AI
    const [aiInsights, quality, experienceResult] = await Promise.all([
        getAIInsights(resumeText, jobDescription),
        Promise.resolve(getResumeQualityScore(resumeText)),
        Promise.resolve(detectExperienceScore(resumeText))
    ]);

    const achievementScore = detectAchievementScore(resumeText);          // 0-20
    const experiencePoints = Math.min(30, experienceResult.score);        // 0-30
    const aiPoints         = Math.min(30, aiInsights?.candidateScore ?? 0); // 0-30
    const qualityPoints    = Math.min(10, quality.score);                 // 0-10

    // Keyword score (0-10) — only when job description provided
    let keywordPoints = 5; // default baseline
    if (jobDescription) {
        const stopWords = new Set(['the','a','an','and','or','in','on','at','to','for','of','with','is','was','be','have','do','will','can','this','that','i','you','we']);
        const extractKw = (t, n) => {
            const toks = tokenize(t).filter(w => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));
            const freq = {};
            toks.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
            return Object.keys(freq).sort((a,b) => freq[b]-freq[a]).slice(0, n);
        };
        const jobKws    = extractKw(jobDescription, 20);
        const resumeKws = new Set(extractKw(resumeText, 50));
        const matched   = jobKws.filter(k => resumeKws.has(k));
        const matchRate = jobKws.length > 0 ? matched.length / jobKws.length : 0;
        keywordPoints   = Math.round(matchRate * 10);

        quality.details.keywords = {
            matchedKeywords: matched,
            matchRate: Math.round(matchRate * 100)
        };
    }

    const finalScore = Math.max(0, Math.min(100,
        achievementScore + experiencePoints + aiPoints + qualityPoints + keywordPoints
    ));

    const issues = generateIssues(quality, experienceResult);

    const suggestions = [];
    if (finalScore >= 80)      suggestions.push('Excellent profile! Strong experience and achievements detected.');
    else if (finalScore >= 60) suggestions.push('Good profile. Adding more internship experience will significantly boost your score.');
    else if (finalScore >= 40) suggestions.push('Average profile. Focus on gaining internship/project experience and adding quantifiable achievements.');
    else                       suggestions.push('Your profile needs significant improvement. Add internship experience, projects, and a job description to get a better match score.');

    if (aiInsights?.priorityFixes?.length) suggestions.push(...aiInsights.priorityFixes);

    return {
        score: finalScore,
        issues,
        suggestions,
        details: quality.details,
        // Score breakdown for transparency
        scoreBreakdown: {
            achievement: achievementScore,
            experience: experiencePoints,
            ai: aiPoints,
            quality: qualityPoints,
            keywords: keywordPoints
        },
        aiInsights: aiInsights || null
    };
}

module.exports = {
    analyzeResume,
    tokenize,
    detectExperienceScore,
    detectAchievementScore,
    getResumeQualityScore,
    getAIInsights
};
