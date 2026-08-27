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
    <div className="group relative flex flex-col justify-between rounded-3xl border border-[color:var(--neon-cyan)]/40 bg-[color:var(--surface)]/90 backdrop-blur-xl p-5 shadow-card hover:border-[color:var(--neon-cyan)]/80 hover:shadow-glow-cyan transition-all duration-300">
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
      <div className="mt-4 relative h-36 rounded-2xl bg-background/80 border border-border/50 overflow-hidden flex items-center justify-between px-3">
        {/* SVG Pendulum */}
        <div className="w-1/2 h-full relative flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 120 95">
            {/* Pivot */}
            <circle cx="60" cy="15" r="3.5" className="fill-[color:var(--neon-cyan)]" />
            <line x1="40" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/40" />
            {/* String */}
            <line x1="60" y1="15" x2={bobX} y2={bobY} stroke="currentColor" strokeWidth="1.5" className="text-[color:var(--neon-cyan)]" />
            {/* Bob */}
            <circle cx={bobX} cy={bobY} r="7" className="fill-[color:var(--neon-cyan)] shadow-glow-cyan" />
            <circle cx={bobX} cy={bobY} r="3" className="fill-background" />
          </svg>
        </div>

        {/* Real-time Oscillating Wave graph */}
        <div className="w-1/2 h-full flex flex-col justify-center border-l border-border/40 pl-2">
          <p className="text-[9px] font-mono text-[color:var(--neon-cyan)] mb-1">f(t) = A·cos(ωt)</p>
          <svg className="w-full h-12 overflow-visible" viewBox="0 0 115 48">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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
   WIDGET 2: Interactive Chemistry 3D / Molecule Rotator
   ------------------------------------------------------------- */
const MOLECULES = [
  { name: "Ethanol (C₂H₅OH)", formula: "C₂H₅OH", color: "var(--neon-emerald)", atoms: 9, bonds: "Single / Polar" },
  { name: "Water (H₂O)", formula: "H₂O", color: "var(--neon-cyan)", atoms: 3, bonds: "Polar Covalent" },
  { name: "Benzene Ring", formula: "C₆H₆", color: "var(--neon-violet)", atoms: 12, bonds: "Resonance Delocalized" },
];

function ChemistryVisualizerWidget() {
  const [molIndex, setMolIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotation((r) => (r + 2) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const current = MOLECULES[molIndex];

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-[color:var(--neon-emerald)]/40 bg-[color:var(--surface)]/90 backdrop-blur-xl p-5 shadow-card hover:border-[color:var(--neon-emerald)]/80 hover:shadow-glow-emerald transition-all duration-300">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-[color:var(--neon-emerald)]/15 border border-[color:var(--neon-emerald)]/30 flex items-center justify-center text-[color:var(--neon-emerald)]">
            <Atom className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground tracking-tight">Chemistry 3D Visualizer</h3>
            <p className="text-[10px] text-muted-foreground">Molecular Bonds & Orbitals</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[color:var(--neon-emerald)]/40 bg-[color:var(--neon-emerald)]/10 text-[color:var(--neon-emerald)]">
          {current.formula}
        </span>
      </div>

      {/* Visual Canvas Area */}
      <div className="mt-4 relative h-36 rounded-2xl bg-background/80 border border-border/50 overflow-hidden flex items-center justify-center">
        {/* Animated Molecular Structure Model */}
        <div
          className="relative w-28 h-28 flex items-center justify-center transition-transform duration-75"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Central Atom Carbon / Oxygen */}
          <div className="absolute w-8 h-8 rounded-full bg-[color:var(--neon-emerald)] shadow-glow-emerald flex items-center justify-center text-background font-bold text-xs">
            C
          </div>

          {/* Orbiting Atoms & Bonds */}
          {[0, 90, 180, 270].map((deg, i) => (
            <div
              key={deg}
              className="absolute w-full h-full flex items-center justify-start pointer-events-none"
              style={{ transform: `rotate(${deg}deg)` }}
            >
              {/* Chemical Bond Line */}
              <div className="w-10 h-1 bg-gradient-to-r from-[color:var(--neon-emerald)] to-[color:var(--neon-cyan)] rounded-full ml-4" />
              {/* Satellite Atom */}
              <div className="w-5 h-5 rounded-full bg-[color:var(--neon-cyan)] border border-white/40 flex items-center justify-center text-[9px] font-bold text-background -ml-1">
                {i === 0 ? "O" : "H"}
              </div>
            </div>
          ))}
        </div>

        {/* Info overlay tag */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-muted-foreground bg-surface/80 backdrop-blur px-2.5 py-1 rounded-lg border border-border/40">
          <span>{current.name}</span>
          <span className="text-[color:var(--neon-emerald)] font-medium">{current.bonds}</span>
        </div>
      </div>

      {/* Interactive Molecule Switcher */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
        <button
          onClick={() => setMolIndex((prev) => (prev + 1) % MOLECULES.length)}
          className="flex-1 py-1.5 px-3 rounded-full border border-border bg-surface-elevated text-xs font-semibold hover:border-[color:var(--neon-emerald)] transition-colors truncate text-left"
        >
          Next: {MOLECULES[(molIndex + 1) % MOLECULES.length].formula}
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-[color:var(--neon-emerald)] hover:border-[color:var(--neon-emerald)] transition-colors"
          title="Toggle Auto-Rotation"
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
    <div className="group relative flex flex-col justify-between rounded-3xl border border-[color:var(--neon-violet)]/40 bg-[color:var(--surface)]/90 backdrop-blur-xl p-5 shadow-card hover:border-[color:var(--neon-violet)]/80 hover:shadow-glow-violet transition-all duration-300">
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
      <div className="mt-4 min-h-[9rem] rounded-2xl bg-background/80 border border-border/50 p-3 flex flex-col justify-between">
        <p className="text-xs font-medium text-foreground leading-relaxed">
          {currentQ.q}
        </p>

        {/* 4 Clickable Choices */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          {currentQ.options.map((opt, idx) => {
            const isChosen = selected === idx;
            const isCorrect = idx === currentQ.correct;
            let btnStyle = "border-border bg-surface-elevated/70 text-foreground hover:border-[color:var(--neon-violet)]";

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
