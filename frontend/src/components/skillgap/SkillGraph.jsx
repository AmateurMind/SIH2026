import React, { useRef, useEffect } from 'react';

export const SkillGraph = ({ skills, weakSkills, toggleSkill }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Set canvas dimensions
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Initial draw
        draw(ctx, rect.width, rect.height);

        // Handle resize - though in this specific layout we might not resize dynamically much,
        // it's good practice. For now we just draw once on mount/update.
    }, [skills, weakSkills]);

    const draw = (ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);

        // Define positions - simplistic circular layout or forced directed
        // For this demo, let's hardcode a nice layout for the 9 skills
        // Center: core (CSA, Arch)
        // Outer: specialized

        const positions = {
            'py': { x: width * 0.3, y: height * 0.3 },
            'dsa': { x: width * 0.5, y: height * 0.5 }, // Center
            'js': { x: width * 0.7, y: height * 0.3 },
            'api': { x: width * 0.2, y: height * 0.5 },
            'arch': { x: width * 0.8, y: height * 0.5 },
            'fe': { x: width * 0.3, y: height * 0.7 },
            'sql': { x: width * 0.5, y: height * 0.8 },
            'db': { x: width * 0.6, y: height * 0.65 },
            'react': { x: width * 0.7, y: height * 0.7 },
        };

        const connections = [
            ['py', 'dsa'], ['dsa', 'arch'], ['js', 'fe'], ['fe', 'react'],
            ['api', 'db'], ['db', 'sql'], ['dsa', 'js'], ['py', 'api']
        ];

        // Draw lines
        ctx.strokeStyle = '#e2e8f0'; // slate-200
        ctx.lineWidth = 2;
        connections.forEach(([s1, s2]) => {
            const p1 = positions[s1];
            const p2 = positions[s2];
            if (p1 && p2) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        });

        // Draw nodes
        skills.forEach(skill => {
            const pos = positions[skill.id];
            if (!pos) return;

            const isWeak = weakSkills.has(skill.id);

            // Category colors
            const categoryColors = {
                core: '#818cf8',    // Indigo-400
                frontend: '#3b82f6', // Blue-500
                backend: '#10b981',  // Emerald-500
                data: '#f59e0b'      // Amber-500
            };

            const baseColor = categoryColors[skill.category] || '#94a3b8'; // Slate-400 fallback

            // Node circle
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 24, 0, Math.PI * 2);

            if (isWeak) {
                // Red for weak/selected
                ctx.fillStyle = '#f87171'; // red-400
            } else {
                // Colorful but slightly muted for background
                ctx.fillStyle = baseColor;
                ctx.globalAlpha = 0.2; // Translucent background
                ctx.fill();
                ctx.globalAlpha = 1.0;

                // Border in full color
                ctx.lineWidth = 2;
                ctx.strokeStyle = baseColor;
                ctx.stroke();
            }

            if (isWeak) {
                ctx.fill(); // Fill the red
                ctx.lineWidth = 0; // No border needed for red fill or keep it consistent
            }

            // Border if selected (Weak) overrides above
            if (isWeak) {
                ctx.strokeStyle = '#ef4444'; // red-500
                ctx.lineWidth = 3;
                ctx.stroke();

                // Glow effect
                ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
                ctx.shadowBlur = 15;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Text
            ctx.fillStyle = isWeak ? '#fff' : '#475569'; // white : slate-600
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(skill.label, pos.x, pos.y);
        });
    };

    const handleClick = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check hit test
        // We need to re-calculate positions based on current width/height
        // Ideally we assume the same width/height as draw
        const width = rect.width;
        const height = rect.height;

        const positions = {
            'py': { x: width * 0.3, y: height * 0.3 },
            'dsa': { x: width * 0.5, y: height * 0.5 },
            'js': { x: width * 0.7, y: height * 0.3 },
            'api': { x: width * 0.2, y: height * 0.5 },
            'arch': { x: width * 0.8, y: height * 0.5 },
            'fe': { x: width * 0.3, y: height * 0.7 },
            'sql': { x: width * 0.5, y: height * 0.8 },
            'db': { x: width * 0.6, y: height * 0.65 },
            'react': { x: width * 0.7, y: height * 0.7 },
        };

        for (const skill of skills) {
            const pos = positions[skill.id];
            if (pos) {
                const dx = x - pos.x;
                const dy = y - pos.y;
                if (dx * dx + dy * dy < 24 * 24) { // radius squared
                    toggleSkill(skill.id);
                    break;
                }
            }
        }
    };

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer hover:bg-slate-50 transition-colors"
            style={{ minHeight: '300px' }}
            onClick={handleClick}
        />
    );
};
