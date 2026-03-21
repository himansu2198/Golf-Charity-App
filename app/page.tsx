"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import Footer from "@/components/layout/Footer";

// ── Animation variants — typed correctly ──
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: "easeOut" as const,
    },
  }),
};

const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

// ── Count-up hook ──
function useCountUpOnView(target: number, duration: number = 1800) {
  const ref                   = useRef<HTMLSpanElement>(null);
  const [count, setCount]     = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          let startTime: number | null = null;

          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, started]);

  return { ref, count };
}

// ── Static data — defined outside component to avoid re-creation ──
const steps: { icon: string; step: string; title: string; desc: string }[] = [
  {
    icon: "🎯",
    step: "01",
    title: "Enter Your Scores",
    desc: "Add up to 5 golf scores (1–45). Each score is a ticket in the weekly draw. The more you play, the better your odds.",
  },
  {
    icon: "💚",
    step: "02",
    title: "Choose a Cause",
    desc: "Pick a charity that matters to you. Your participation directly supports real organisations doing real work.",
  },
  {
    icon: "🏆",
    step: "03",
    title: "Win Every Week",
    desc: "When the draw runs, matching scores win prizes. 3 matches earns Tier 3. 5 matches takes the top prize.",
  },
];

const statsData: {
  value: number;
  suffix: string;
  label: string;
}[] = [
  { value: 500,   suffix: "+",     label: "Golfers Playing"     },
  { value: 5,     suffix: "",      label: "Charities Supported" },
  { value: 12000, suffix: "+",     label: "Pounds Raised"       },
  { value: 52,    suffix: "/year", label: "Prize Draws"         },
];

const trustBadges: string[] = [
  "✓ Free to join",
  "✓ Support real charities",
  "✓ Weekly prize draws",
];

const charityNames: string[] = [
  "Golf Foundation",
  "Green Hearts",
  "Junior Golf Trust",
  "Cancer Research",
  "Age UK Golf",
];

// ── Stat card with count-up ──
function StatCard({
  value,
  suffix,
  label,
  index,
}: {
  value: number;
  suffix: string;
  label: string;
  index: number;
}) {
  const { ref, count } = useCountUpOnView(value, 1600 + index * 200);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      custom={index}
      variants={fadeUp}
      className="text-center"
    >
      <div
        className="text-3xl md:text-4xl font-bold text-green-400 mb-1"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        <span ref={ref}>{count.toLocaleString()}</span>
        <span className="text-green-400/70 text-2xl">{suffix}</span>
      </div>
      <div className="text-sm text-green-200/40">{label}</div>
    </motion.div>
  );
}

// ── Main page ──
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030f06] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-black/30 backdrop-blur-md border-b border-white/10"
      >
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">⛳</span>
          <span
            className="text-lg font-bold tracking-wide text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Golf Charity
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-green-200 hover:text-white transition-colors duration-200 px-4 py-2"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-green-500 hover:bg-green-400 text-black px-5 py-2 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">

        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-green-600/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">

          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Weekly Prize Draws — Now Live
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-5xl md:text-7xl font-bold leading-[1.08] mb-6 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Golf with
            <br />
            <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              purpose.
            </span>
            <br />
            Win with{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              heart.
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-green-200/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Enter your scores, back a charity you believe in and get entered
            into weekly prize draws. Every round you play makes a real difference.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-full text-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/40"
            >
              Join the Weekly Prize Draw
              <span className="group-hover:translate-x-1 transition-transform duration-200">
                →
              </span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white font-medium px-8 py-4 rounded-full text-sm transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]"
            >
              Sign In
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={4}
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {trustBadges.map((badge) => (
              <span key={badge} className="text-xs text-green-300/50 font-medium">
                {badge}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/20"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ── Stats bar ── */}
      <section className="py-16 px-6 border-y border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {statsData.map((stat, i) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-3 block">
              How it works
            </span>
            <h2
              className="text-3xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Three steps to playing{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                with purpose
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                variants={fadeUp}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.25, ease: "easeOut" },
                }}
                className="group relative p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.07] hover:border-green-500/30 transition-all duration-300 cursor-default"
              >
                <div className="absolute inset-0 rounded-2xl bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      {s.icon}
                    </div>
                    <span
                      className="text-4xl font-bold text-white/5 group-hover:text-white/10 transition-colors duration-300"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {s.step}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-green-200/50 text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Charity strip ── */}
      <section className="py-12 px-6 border-y border-white/10 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-8"
          >
            <p className="text-xs text-white/25 uppercase tracking-widest font-medium">
              Supporting
            </p>
          </motion.div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {charityNames.map((name, i) => (
              <motion.span
                key={name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="text-sm text-white/25 hover:text-white/50 transition-colors duration-300 font-medium"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center"
          >
            <div className="text-5xl mb-6 opacity-30">&ldquo;</div>
            <p
              className="text-xl md:text-2xl text-white/70 leading-relaxed mb-8 font-light"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Golf has always been about more than the game. This platform
              makes every round count for something bigger than a scorecard.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center text-sm font-bold text-green-400">
                JM
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">James M.</p>
                <p className="text-xs text-white/30">Member since 2024</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-green-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="relative max-w-2xl mx-auto text-center"
        >
          <span className="inline-block text-xs text-green-400/60 uppercase tracking-widest font-semibold mb-4">
            Ready to play?
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Start playing &amp;{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              winning today
            </span>
          </h2>
          <p className="text-green-200/50 mb-10 text-lg leading-relaxed">
            Join hundreds of golfers making every round count for causes
            that matter.
          </p>

          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-10 py-4 rounded-full text-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/40 mb-8"
          >
            Start Playing &amp; Winning Today
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              →
            </span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {trustBadges.map((badge) => (
              <span key={badge} className="text-xs text-green-300/40 font-medium">
                {badge}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Footer — imported as component, not inline ── */}
      <Footer />

    </div>
  );
}