"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { Plane } from "lucide-react";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import TravelHero from "@/components/home/TravelHero";
import { AnimatedListDemo } from "@/components/animated-list";
import { cn } from "@/lib/utils";

export default function Home() {
  const [step, setStep] = useState(0); // 0: arc+plane, 1: logo reveal, 2: hero content
  const progress = useMotionValue(0);
  const [showSecond, setShowSecond] = useState(false);

  const arcCenterX = 500;
  const arcCenterY = 390;
  const arcRadius = 380;

  const cx = useTransform(progress, (t) => arcCenterX + arcRadius * Math.cos(Math.PI * (1 - t)));
  const cy = useTransform(progress, (t) => arcCenterY - arcRadius * Math.sin(Math.PI * (1 - t)));

  const angle = useTransform(progress, (t) => {
    const theta = Math.PI + Math.PI * t;
    const dx = -arcRadius * Math.PI * Math.sin(theta);
    const dy = arcRadius * Math.PI * Math.cos(theta);
    return (Math.atan2(dy, dx) * 180) / Math.PI + 40;
  });

  useEffect(() => {
    if (step === 0) {
      const controls = animate(progress, 1, {
        duration: 2,
        ease: "easeInOut",
        onComplete: () => setStep(1),
      });
      return () => controls.stop();
    }
    if (step === 1) {
      const t = setTimeout(() => setStep(2), 500);
      return () => clearTimeout(t);
    }
    if (step === 2) {
      const t = setTimeout(() => setShowSecond(true), 900);
      return () => clearTimeout(t);
    }
  }, [step, progress]);

  const arcPath = "M 120 400 A 380 380 0 0 1 880 400";

  return (
    <motion.section
      className={`flex h-full w-full flex-col gap-5 md:flex-row md:gap-1 transition-all duration-700 ${
        showSecond ? "md:justify-between" : "md:justify-center"
      }`}
      layout
    >
      <motion.article
        layout
        className={cn(
          "relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br dark:from-[#181A20] dark:via-[#101114] dark:to-[#181A20]",
          {
            "md:w-[100vw]": !showSecond,
            "md:w-[75vw]": showSecond,
          }
        )}
        style={{
          transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <svg
          viewBox="0 0 1000 500"
          className="pointer-events-none absolute left-0 top-0 h-full w-full"
        >
          <motion.path
            d={arcPath}
            stroke="#444"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8 10"
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 0 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.image
            href="/gemini-svg.png"
            x="775"
            y="350"
            width="200"
            height="200"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.8 }}
            transition={{ duration: 0.6 }}
          />
          <motion.circle
            cx="120"
            cy="400"
            r="14"
            className="fill-blue-500/20 stroke-blue-500"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 0 ? 1 : 0.85 }}
            transition={{ duration: 0.5 }}
          />
          {step >= 0 && (
            <motion.g
              style={{
                translateX: cx,
                translateY: cy,
                rotate: angle,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Plane className="fill-blue-500 text-transparent" height={24} width={24} />
            </motion.g>
          )}
        </svg>

        <motion.div
          className="relative z-10 h-2/3 w-full md:w-2/3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 30 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mx-auto flex h-full w-full max-h-[70vh] max-w-[70vw] items-center justify-center">
            <TravelHero />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-0 z-10 hidden h-full w-full flex-col items-center justify-end px-6 py-16 md:flex"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 30 }}
          transition={{ duration: 0.7 }}
        >
          <Link href="/dashboard">
            <InteractiveHoverButton className="border-2 border-blue-500 shadow-xl">
              Plan Smarter on GemiTrek
            </InteractiveHoverButton>
          </Link>
        </motion.div>
      </motion.article>

      <motion.article className="flex items-center justify-center">
        <motion.div
          className="flex md:hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 30 }}
          transition={{ duration: 0.7 }}
        >
          <Link href="/dashboard">
            <InteractiveHoverButton className="border-2 border-blue-500 shadow-xl">
              Plan Smarter on GemiTrek
            </InteractiveHoverButton>
          </Link>
        </motion.div>
      </motion.article>

      <AnimatePresence>
        {showSecond && (
          <motion.article
            layout
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.7 }}
            className="flex h-full w-full flex-col items-center justify-center md:w-[25vw]"
          >
            <h2 className="text-2xl font-bold">What&apos;s new in GemiTrek?</h2>
            <AnimatedListDemo />
          </motion.article>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
