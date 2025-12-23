export interface Skill {
  id: string;
  label: string;
  category: 'frontend' | 'backend' | 'core' | 'data';
}

export interface GapAnalysis {
  status: 'Strong' | 'Moderate' | 'Critical';
  summary: string;
  missingConcepts: string[];
  recommendedFocus: string;
}

export interface SkillNodeProps {
  skill: Skill;
  isWeak: boolean;
  onClick: (id: string) => void;
  x: number;
  y: number;
}
