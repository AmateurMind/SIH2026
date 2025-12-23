import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Access the API key from Vite environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Only initialize if key exists to avoid immediate crash, verify in function
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const analyzeSkillGap = async (
    allSkills,
    weakSkillIds
) => {
    if (!genAI) {
        console.error("Gemini API Key missing");
        return {
            status: 'Moderate',
            summary: 'API Key missing. Please add VITE_GEMINI_API_KEY to your .env file.',
            missingConcepts: ['Configuration', 'Environment Variables', 'API Keys'],
            recommendedFocus: 'Setup the project environment variables.'
        };
    }

    if (weakSkillIds.length === 0) {
        return {
            status: 'Strong',
            summary: 'No gaps selected. Select nodes to simulate a knowledge gap.',
            missingConcepts: [],
            recommendedFocus: ''
        };
    }

    const weakSkillNames = allSkills
        .filter(s => weakSkillIds.includes(s.id))
        .map(s => s.label)
        .join(", ");

    const prompt = `
    Context: You are a senior engineering mentor.
    Task: Analyze a computer science student's self-assessment.
    Weaknesses Identified: ${weakSkillNames}.
    
    Output JSON with these fields:
    1. status (Strong/Moderate/Critical)
    2. summary (One short sentence explaining why this combination is bad)
    3. missingConcepts (Array of 3 technical terms)
    4. recommendedFocus (One specific topic to study)
  `;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        status: { type: SchemaType.STRING, enum: ['Strong', 'Moderate', 'Critical'] },
                        summary: { type: SchemaType.STRING },
                        missingConcepts: {
                            type: SchemaType.ARRAY,
                            items: { type: SchemaType.STRING }
                        },
                        recommendedFocus: { type: SchemaType.STRING }
                    },
                    required: ['status', 'summary', 'missingConcepts', 'recommendedFocus']
                }
            }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) throw new Error("No response from AI");

        return JSON.parse(text);

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return {
            status: 'Moderate',
            summary: 'Analysis unavailable. Focus on the highlighted nodes.',
            missingConcepts: ['Basics'],
            recommendedFocus: 'Review Fundamentals'
        };
    }
};
