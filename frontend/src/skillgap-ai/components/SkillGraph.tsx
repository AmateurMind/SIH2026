import React from 'react';
import { Skill } from '../types';
import { AlertTriangle } from 'lucide-react';

interface SkillGraphProps {
  skills: Skill[];
  weakSkills: Set<string>;
  toggleSkill: (id: string) => void;
}

// Layout Configuration
const GRID_SIZE = 3;
const SPACING = 130; // Increased spacing for cleaner look
const OFFSET = 80;

export const SkillGraph: React.FC<SkillGraphProps> = ({ skills, weakSkills, toggleSkill }) => {
  
  // Map skills to coordinate positions
  const nodes = skills.map((skill, index) => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    return {
      ...skill,
      x: col * SPACING + OFFSET,
      y: row * SPACING + OFFSET
    };
  });

  // Define connections
  const connections: { from: number; to: number }[] = [];
  for (let i = 0; i < skills.length; i++) {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;
    if (col < GRID_SIZE - 1) connections.push({ from: i, to: i + 1 });
    if (row < GRID_SIZE - 1) connections.push({ from: i, to: i + GRID_SIZE });
  }

  return (
    <div className="relative w-full max-w-[420px] h-[420px] mx-auto select-none">
      {/* SVG Layer for connecting lines */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {connections.map((conn, i) => {
          const start = nodes[conn.from];
          const end = nodes[conn.to];
          const isAffected = weakSkills.has(start.id) || weakSkills.has(end.id);
          
          return (
            <line
              key={i}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={isAffected ? "#fca5a5" : "#e2e8f0"}
              strokeWidth={isAffected ? "2" : "1.5"}
              strokeDasharray={isAffected ? "0" : "4 4"} // Dashed lines for "unaffected" structural connections
              className="transition-colors duration-500"
            />
          );
        })}
      </svg>

      {/* Nodes Layer */}
      {nodes.map((node) => {
        const isWeak = weakSkills.has(node.id);
        
        return (
          <div
            key={node.id}
            onClick={() => toggleSkill(node.id)}
            className={`
              absolute z-10 w-20 h-20 rounded-2xl flex flex-col items-center justify-center 
              cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95
              border-2 shadow-sm
              ${isWeak 
                ? 'bg-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
              }
            `}
            style={{ 
              left: node.x - 40, // Center the 80px (w-20) node
              top: node.y - 40 
            }}
          >
            <span className={`text-sm font-bold ${isWeak ? 'text-red-500' : 'text-slate-700'}`}>
              {node.label}
            </span>
            <span className={`text-[10px] uppercase tracking-wider mt-1 ${isWeak ? 'text-red-300' : 'text-slate-400'}`}>
              {node.category.substring(0, 4)}
            </span>
            
            {/* Warning Icon Overlay */}
            {isWeak && (
               <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm animate-in zoom-in duration-200">
                 <AlertTriangle size={12} fill="currentColor" />
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};