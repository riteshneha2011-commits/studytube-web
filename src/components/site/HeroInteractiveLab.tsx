import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCw, CheckCircle2, XCircle, Sparkles, Atom, Activity, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function HeroInteractiveLab() {
  return (
    <div className="relative mt-12 w-full max-w-6xl mx-auto px-2">
      {/* Background ambient glow behind the lab widgets */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[color:var(--neon-cyan)]/15 via-[color:var(--neon-violet)]/15 to-[color:var(--neon-emerald)]/15 blur-3xl opacity-70 -z-10 rounded-3xl" />

      {/* Grid of 3 Interactive Lab Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        <PhysicsSimWidget />
        <ChemistryVisualizerWidget />
        <LiveQuizWidget />
      </div>

      {/* Lab quick launch CTA bar below the widgets */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full border border-[color:var(--neon-cyan)]/40 bg-[color:var(--neon-cyan)]/10 text-[color:var(--neon-cyan)]">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Live Interactive Lab Sandbox
        </span>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-foreground hover:text-[color:var(--neon-cyan)] transition-colors group"
        >
          View all 10+ classroom tested apps <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   WIDGET 1: Interactive Physics Harmonic Oscillation & Wave Sim
   ------------------------------------------------------------- */
function PhysicsSimWidget() {
  const [running, setRunning] = useState(true);
  const [length, setLength] = useState(65);
  const [angle, setAngle] = useState(0);
  const requestRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    let prevTime = performance.now();
    const animate = (currentTime: number) => {
      const delta = (currentTime - prevTime) / 1000;
      prevTime = currentTime;
      if (running) {
        timeRef.current += delta * (length / 25);
        // Harmonic motion formula: theta = max_angle * cos(omega * t)
        const currentTheta = 38 * Math.cos(timeRef.current * 3);
        setAngle(currentTheta);
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [running, length]);

  // Generate real-time sine wave path based on current oscillation
  const wavePoints = Array.from({ length: 28 }).map((_, i) => {
    const x = i * 4.2;
    const y = 24 + 16 * Math.sin((i * 0.35) - (timeRef.current * 2));
    return `${x},${y}`;
  }).join(" ");

  const radians = (angle * Math.PI) / 180;
  const bobX = 60 + Math.sin(radians) * length;
  const bobY = 15 + Math.cos(radians) * length;

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-[color:var(--neon-cyan)]/40 bg-[color:var(--card)] backdrop-blur-xl p-5 shadow-card hover:border-[color:var(--neon-cyan)]/80 hover:shadow-glow-cyan transition-all duration-300">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-[color:var(--neon-cyan)]/15 border border-[color:var(--neon-cyan)]/30 flex items-center justify-center text-[color:var(--neon-cyan)]">
            <Activity className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground tracking-tight">Physics Simulation</h3>
            <p className="text-[10px] text-muted-foreground">Harmonic Wave & Pendulum</p>
          </div>
        </div>
        <span className="h-2 w-2 rounded-full bg-[color:var(--neon-cyan)] animate-pulse" />
      </div>

      {/* Visual Canvas Area */}
      <div className="mt-4 relative h-40 rounded-2xl bg-surface/70 border border-border/50 overflow-hidden flex items-center justify-between px-3">
        {/* SVG Pendulum */}
        <div className="w-1/2 h-full relative flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 120 95">
            {/* Pivot */}
            <circle cx="60" cy="15" r="3.5" className="fill-[color:var(--neon-cyan)]" />
            <line x1="40" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/40" />
            {/* String */}
            <line x1="60" y1="15" x2={bobX} y2={bobY} stroke="currentColor" strokeWidth="1.5" className="text-[color:var(--neon-cyan)]" />
            {/* Bob with 3D gradient */}
            <defs>
              <radialGradient id="bobGlow" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="60%" stopColor="var(--neon-cyan)" />
                <stop offset="100%" stopColor="#0891b2" />
              </radialGradient>
            </defs>
            <circle cx={bobX} cy={bobY} r="8" fill="url(#bobGlow)" className="shadow-glow-cyan" />
            <circle cx={bobX - 2.5} cy={bobY - 2.5} r="2.5" fill="#ffffff" opacity="0.6" />
          </svg>
        </div>

        {/* Real-time Oscillating Wave graph */}
        <div className="w-1/2 h-full flex flex-col justify-center border-l border-border/40 pl-2">
          <p className="text-[9px] font-mono text-[color:var(--neon-cyan)] mb-1">f(t) = A·cos(ωt)</p>
          <svg className="w-full h-14 overflow-visible" viewBox="0 0 115 48">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-[color:var(--neon-cyan)]"
              points={wavePoints}
            />
          </svg>
          <p className="text-[9px] text-muted-foreground font-mono mt-1">θ = {Math.round(angle)}°</p>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-medium">Length</span>
          <input
            type="range"
            min={45}
            max={75}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-1.5 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-[color:var(--neon-cyan)]"
          />
        </div>
        <button
          onClick={() => setRunning(!running)}
          className="h-7 px-3 rounded-full border border-[color:var(--neon-cyan)]/40 bg-[color:var(--neon-cyan)]/15 text-[color:var(--neon-cyan)] text-xs font-semibold inline-flex items-center gap-1 hover:bg-[color:var(--neon-cyan)] hover:text-background transition-colors"
        >
          {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {running ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   WIDGET 2: Realistic 3D Ball-and-Stick Multi-Colored Chemistry Lab
   ------------------------------------------------------------- */
type Atom3D = {
  element: "C" | "H" | "O" | "N" | "Cl";
  pos: [number, number, number]; // [x, y, z]
  radius: number;
  label: string;
};

type Bond3D = {
  a: number;
  b: number;
  type?: "single" | "double";
};

type MoleculeDef = {
  name: string;
  formula: string;
  category: string;
  description: string;
  atoms: Atom3D[];
  bonds: Bond3D[];
};

const CPK_COLORS = {
  O: { main: "#ef4444", light: "#fca5a5", dark: "#991b1b", text: "#ffffff" },   // Red
  H: { main: "#f1f5f9", light: "#ffffff", dark: "#cbd5e1", text: "#0f172a" },   // White / Silver
  C: { main: "#334155", light: "#64748b", dark: "#0f172a", text: "#ffffff" },   // Charcoal
  N: { main: "#3b82f6", light: "#93c5fd", dark: "#1e40af", text: "#ffffff" },   // Blue
  Cl: { main: "#10b981", light: "#6ee7b7", dark: "#047857", text: "#ffffff" },  // Emerald
};

const MOLECULES_3D: MoleculeDef[] = [
  {
    name: "Ethanol",
    formula: "C₂H₅OH",
    category: "Alcohol / Polar",
    description: "2 Carbons, 1 Hydroxyl Oxygen, 6 Hydrogens",
    atoms: [
      { element: "C", pos: [-28, -6, 0], radius: 14, label: "C" },     // 0 Methyl Carbon
      { element: "C", pos: [4, 8, 0], radius: 14, label: "C" },        // 1 Methylene Carbon
      { element: "O", pos: [34, -8, 0], radius: 15, label: "O" },      // 2 Hydroxyl Oxygen (Red)
      { element: "H", pos: [50, 6, 0], radius: 9, label: "H" },        // 3 O-H Hydrogen (White)
      { element: "H", pos: [-44, 8, 12], radius: 9, label: "H" },      // 4 Methyl H
      { element: "H", pos: [-28, -26, 0], radius: 9, label: "H" },     // 5 Methyl H
      { element: "H", pos: [-44, 8, -12], radius: 9, label: "H" },     // 6 Methyl H
      { element: "H", pos: [4, 26, 12], radius: 9, label: "H" },       // 7 Methylene H
      { element: "H", pos: [4, 26, -12], radius: 9, label: "H" },      // 8 Methylene H
    ],
    bonds: [
      { a: 0, b: 1 }, // C-C
      { a: 1, b: 2 }, // C-O
      { a: 2, b: 3 }, // O-H
      { a: 0, b: 4 }, { a: 0, b: 5 }, { a: 0, b: 6 },
      { a: 1, b: 7 }, { a: 1, b: 8 },
    ],
  },
  {
    name: "Water",
    formula: "H₂O",
    category: "Bent V-Shape (104.5°)",
    description: "Universal solvent with strong hydrogen bonding",
    atoms: [
      { element: "O", pos: [0, 8, 0], radius: 17, label: "O" },        // 0 Central Oxygen (Red)
      { element: "H", pos: [-30, -14, 0], radius: 11, label: "H" },    // 1 Hydrogen (White)
      { element: "H", pos: [30, -14, 0], radius: 11, label: "H" },     // 2 Hydrogen (White)
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
    ],
  },
  {
    name: "Benzene Ring",
    formula: "C₆H₆",
    category: "Aromatic / Resonance",
    description: "Planar hexagonal ring with delocalized pi-bonds",
    atoms: [
      // 6 Carbon ring
      { element: "C", pos: [0, -32, 0], radius: 13, label: "C" },
      { element: "C", pos: [28, -16, 0], radius: 13, label: "C" },
      { element: "C", pos: [28, 16, 0], radius: 13, label: "C" },
      { element: "C", pos: [0, 32, 0], radius: 13, label: "C" },
      { element: "C", pos: [-28, 16, 0], radius: 13, label: "C" },
      { element: "C", pos: [-28, -16, 0], radius: 13, label: "C" },
      // 6 Hydrogen periphery
      { element: "H", pos: [0, -50, 0], radius: 8, label: "H" },
      { element: "H", pos: [44, -25, 0], radius: 8, label: "H" },
      { element: "H", pos: [44, 25, 0], radius: 8, label: "H" },
      { element: "H", pos: [0, 50, 0], radius: 8, label: "H" },
      { element: "H", pos: [-44, 25, 0], radius: 8, label: "H" },
      { element: "H", pos: [-44, -25, 0], radius: 8, label: "H" },
    ],
    bonds: [
      { a: 0, b: 1, type: "double" },
      { a: 1, b: 2 },
      { a: 2, b: 3, type: "double" },
      { a: 3, b: 4 },
      { a: 4, b: 5, type: "double" },
      { a: 5, b: 0 },
      // C-H bonds
      { a: 0, b: 6 }, { a: 1, b: 7 }, { a: 2, b: 8 },
      { a: 3, b: 9 }, { a: 4, b: 10 }, { a: 5, b: 11 },
    ],
  },
  {
    name: "Methane",
    formula: "CH₄",
    category: "Tetrahedral (109.5°)",
    description: "Simplest alkane with 4 symmetric C-H single bonds",
    atoms: [
      { element: "C", pos: [0, 0, 0], radius: 16, label: "C" },
      { element: "H", pos: [0, 36, 0], radius: 10, label: "H" },
      { element: "H", pos: [34, -12, 0], radius: 10, label: "H" },
      { element: "H", pos: [-17, -12, 30], radius: 10, label: "H" },
      { element: "H", pos: [-17, -12, -30], radius: 10, label: "H" },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 0, b: 3 },
      { a: 0, b: 4 },
    ],
  },
];

function ChemistryVisualizerWidget() {
  const [molIndex, setMolIndex] = useState(0);
  const [rotY, setRotY] = useState(30);
  const [rotX, setRotX] = useState(20);
  const [autoRotate, setAutoRotate] = useState(true);

  const current = MOLECULES_3D[molIndex];

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotY((y) => (y + 1.8) % 360);
      setRotX((x) => (x + 0.6) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // 3D Projection Math: Convert (x, y, z) -> (screenX, screenY, depthZ)
  const radY = (rotY * Math.PI) / 180;
  const radX = (rotX * Math.PI) / 180;

  const cosY = Math.cos(radY);
  const sinY = Math.sin(radY);
  const cosX = Math.cos(radX);
  const sinX = Math.sin(radX);

  const projectedAtoms = current.atoms.map((atom, idx) => {
    const [x0, y0, z0] = atom.pos;
    // Rotate Y
    const x1 = x0 * cosY + z0 * sinY;
    const y1 = y0;
    const z1 = -x0 * sinY + z0 * cosY;
    // Rotate X
    const x2 = x1;
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX;

    // Perspective factor
    const scale = 1 + z2 * 0.004;
    const screenX = 90 + x2 * scale;
    const screenY = 65 - y2 * scale; // invert Y for SVG

    return {
      idx,
      element: atom.element,
      radius: atom.radius * scale,
      screenX,
      screenY,
      depthZ: z2,
      label: atom.label,
    };
  });

  // Sort atoms and bonds by depth (Z-buffer painter's algorithm)
  const sortedAtoms = [...projectedAtoms].sort((a, b) => a.depthZ - b.depthZ);

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-[color:var(--neon-emerald)]/40 bg-[color:var(--card)] backdrop-blur-xl p-5 shadow-card hover:border-[color:var(--neon-emerald)]/80 hover:shadow-glow-emerald transition-all duration-300">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-[color:var(--neon-emerald)]/15 border border-[color:var(--neon-emerald)]/30 flex items-center justify-center text-[color:var(--neon-emerald)]">
            <Atom className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground tracking-tight">Chemistry 3D Visualizer</h3>
            <p className="text-[10px] text-muted-foreground">{current.name} · CPK Models</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-[color:var(--neon-emerald)]/40 bg-[color:var(--neon-emerald)]/10 text-[color:var(--neon-emerald)]">
          {current.formula}
        </span>
      </div>

      {/* Visual Canvas Area — Real 3D Ball and Stick SVG */}
      <div className="mt-4 relative h-40 rounded-2xl bg-surface/70 border border-border/50 overflow-hidden flex items-center justify-center">
        {/* CPK Color Legend Pills */}
        <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] bg-background/80 backdrop-blur px-2 py-0.5 rounded-md border border-border/40 z-10">
          <span className="h-2 w-2 rounded-full bg-[#ef4444]" title="Oxygen" /> O
          <span className="h-2 w-2 rounded-full bg-[#334155] ml-1" title="Carbon" /> C
          <span className="h-2 w-2 rounded-full bg-[#f1f5f9] border border-border ml-1" title="Hydrogen" /> H
        </div>

        <svg className="w-full h-full" viewBox="0 0 180 130">
          <defs>
            {/* Dynamic Radial 3D Sphere Gradients for each element */}
            {Object.entries(CPK_COLORS).map(([el, c]) => (
              <radialGradient key={el} id={`grad-cpk-${el}`} cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor={c.light} />
                <stop offset="55%" stopColor={c.main} />
                <stop offset="100%" stopColor={c.dark} />
              </radialGradient>
            ))}
          </defs>

          {/* 3D Chemical Bonds (Lines / Double Lines) */}
          {current.bonds.map((b, i) => {
            const atomA = projectedAtoms[b.a];
            const atomB = projectedAtoms[b.b];
            if (!atomA || !atomB) return null;

            if (b.type === "double") {
              const dx = atomB.screenX - atomA.screenX;
              const dy = atomB.screenY - atomA.screenY;
              const len = Math.hypot(dx, dy) || 1;
              const offset = 2.2;
              const nx = (-dy / len) * offset;
              const ny = (dx / len) * offset;

              return (
                <g key={i}>
                  <line
                    x1={atomA.screenX + nx}
                    y1={atomA.screenY + ny}
                    x2={atomB.screenX + nx}
                    y2={atomB.screenY + ny}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-muted-foreground/60"
                  />
                  <line
                    x1={atomA.screenX - nx}
                    y1={atomA.screenY - ny}
                    x2={atomB.screenX - nx}
                    y2={atomB.screenY - ny}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-[color:var(--neon-emerald)]"
                  />
                </g>
              );
            }

            return (
              <line
                key={i}
                x1={atomA.screenX}
                y1={atomA.screenY}
                x2={atomB.screenX}
                y2={atomB.screenY}
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted-foreground/50"
              />
            );
          })}

          {/* 3D Atoms (Spheres rendered with Painter's depth algorithm) */}
          {sortedAtoms.map((atom) => {
            const colors = CPK_COLORS[atom.element] || CPK_COLORS.C;
            return (
              <g key={atom.idx} className="cursor-pointer">
                {/* Ambient drop shadow */}
                <circle
                  cx={atom.screenX + 1.5}
                  cy={atom.screenY + 2}
                  r={atom.radius}
                  fill="rgba(0,0,0,0.25)"
                />
                {/* 3D Shaded Sphere */}
                <circle
                  cx={atom.screenX}
                  cy={atom.screenY}
                  r={atom.radius}
                  fill={`url(#grad-cpk-${atom.element})`}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="0.8"
                />
                {/* Specular Highlight dot */}
                <circle
                  cx={atom.screenX - atom.radius * 0.35}
                  cy={atom.screenY - atom.radius * 0.35}
                  r={atom.radius * 0.28}
                  fill="#ffffff"
                  opacity="0.6"
                />
                {/* Element Symbol */}
                {atom.radius > 10 && (
                  <text
                    x={atom.screenX}
                    y={atom.screenY + 3.5}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize={atom.radius * 0.7}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {atom.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Info overlay tag */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-muted-foreground bg-background/80 backdrop-blur px-2.5 py-1 rounded-lg border border-border/40">
          <span className="font-semibold text-foreground">{current.name}</span>
          <span className="text-[color:var(--neon-emerald)] font-medium">{current.category}</span>
        </div>
      </div>

      {/* Interactive Molecule Switcher */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
        <button
          onClick={() => setMolIndex((prev) => (prev + 1) % MOLECULES_3D.length)}
          className="flex-1 py-1.5 px-3 rounded-full border border-border bg-surface-elevated text-xs font-bold hover:border-[color:var(--neon-emerald)] transition-colors truncate text-left flex items-center justify-between"
        >
          <span>Next: {MOLECULES_3D[(molIndex + 1) % MOLECULES_3D.length].name}</span>
          <span className="text-[10px] font-mono text-[color:var(--neon-emerald)]">{MOLECULES_3D[(molIndex + 1) % MOLECULES_3D.length].formula}</span>
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-[color:var(--neon-emerald)] hover:border-[color:var(--neon-emerald)] transition-colors"
          title="Toggle 3D Orbit Rotation"
        >
          <RotateCw className={cn("h-3.5 w-3.5", autoRotate && "animate-spin text-[color:var(--neon-emerald)]")} />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   WIDGET 3: Fast-Paced Interactive Quiz / MCQ Flashcard
   ------------------------------------------------------------- */
const QUESTIONS = [
  {
    q: "Work done by centripetal force on an object in uniform circular motion is:",
    options: ["Always Zero", "Positive", "Negative", "Depends on speed"],
    correct: 0,
    explanation: "Since force is perpendicular to instantaneous displacement, W = F·d·cos(90°) = 0.",
  },
  {
    q: "Which state of matter has definite volume but no definite shape?",
    options: ["Solid", "Liquid", "Gas", "Plasma"],
    correct: 1,
    explanation: "Liquids take the shape of the container while maintaining a fixed volume.",
  },
  {
    q: "Derivative of e^(2x) with respect to x is:",
    options: ["e^(2x)", "2e^(2x)", "0.5e^(2x)", "2x·e^(2x)"],
    correct: 1,
    explanation: "By chain rule, d/dx(e^(2x)) = 2·e^(2x).",
  },
];

function LiveQuizWidget() {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);

  const currentQ = QUESTIONS[qIndex];

  useEffect(() => {
    if (selected !== null) return;
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 15));
    }, 1000);
    return () => clearInterval(interval);
  }, [selected]);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === currentQ.correct) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    setSelected(null);
    setTimer(15);
    setQIndex((prev) => (prev + 1) % QUESTIONS.length);
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-[color:var(--neon-violet)]/40 bg-[color:var(--card)] backdrop-blur-xl p-5 shadow-card hover:border-[color:var(--neon-violet)]/80 hover:shadow-glow-violet transition-all duration-300">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-[color:var(--neon-violet)]/15 border border-[color:var(--neon-violet)]/30 flex items-center justify-center text-[color:var(--neon-violet)]">
            <HelpCircle className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground tracking-tight">Live Quiz & Practice</h3>
            <p className="text-[10px] text-muted-foreground">Class 9–12 · JEE & NEET Speed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[color:var(--neon-violet)]/10 text-[color:var(--neon-violet)] border border-[color:var(--neon-violet)]/30">
            00:{timer < 10 ? `0${timer}` : timer}
          </span>
        </div>
      </div>

      {/* Quiz Question Card */}
      <div className="mt-4 min-h-[9rem] rounded-2xl bg-surface/70 border border-border/50 p-3 flex flex-col justify-between">
        <p className="text-xs font-medium text-foreground leading-relaxed">
          {currentQ.q}
        </p>

        {/* 4 Clickable Choices */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          {currentQ.options.map((opt, idx) => {
            const isChosen = selected === idx;
            const isCorrect = idx === currentQ.correct;
            let btnStyle = "border-border bg-surface-elevated text-foreground hover:border-[color:var(--neon-violet)]";

            if (selected !== null) {
              if (isCorrect) {
                btnStyle = "border-[color:var(--neon-emerald)] bg-[color:var(--neon-emerald)]/20 text-[color:var(--neon-emerald)] font-semibold";
              } else if (isChosen) {
                btnStyle = "border-[color:var(--destructive)] bg-[color:var(--destructive)]/20 text-[color:var(--destructive)]";
              } else {
                btnStyle = "border-border/40 opacity-50";
              }
            }

            return (
              <button
                key={opt}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className={cn(
                  "p-2 rounded-xl border text-[11px] font-medium text-left transition-all flex items-center justify-between",
                  btnStyle
                )}
              >
                <span className="truncate">{opt}</span>
                {selected !== null && isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--neon-emerald)] shrink-0" />}
                {selected !== null && isChosen && !isCorrect && <XCircle className="h-3.5 w-3.5 text-[color:var(--destructive)] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer controls & score */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Score: <strong className="text-[color:var(--neon-violet)]">{score}</strong>/{QUESTIONS.length}
        </span>
        {selected !== null ? (
          <button
            onClick={handleNext}
            className="px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1 shadow-glow"
          >
            Next Question <ArrowRight className="h-3 w-3" />
          </button>
        ) : (
          <span className="text-[10px] text-muted-foreground">Tap any option to test yourself</span>
        )}
      </div>
    </div>
  );
}
