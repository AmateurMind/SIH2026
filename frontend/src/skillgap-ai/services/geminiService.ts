import { GoogleGenerativeAI } from "@google/generative-ai";
import { GapAnalysis, Skill } from "../types";

// Lazy initialization moved inside function
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const analyzeSkillGap = async (
  allSkills: Skill[],
  weakSkillIds: string[]
): Promise<GapAnalysis> => {
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
    
    Return a VALID JSON object with this exact structure:
    {
      "status": "Strong" | "Moderate" | "Critical",
      "summary": "One pithy sentence...",
      "missingConcepts": ["concept1", "concept2", "concept3"],
      "recommendedFocus": "Topic to study"
    }
  `;

  try {
    if (!API_KEY) {
      console.error("Gemini API Key is missing! Check VITE_GEMINI_API_KEY in .env");
      throw new Error("API Key missing");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error("No response from AI");
    // Clean markdown code blocks if present
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanJson) as GapAnalysis;

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