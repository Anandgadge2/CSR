"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string | number;
  duration?: number; // seconds
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.6,
  className = "",
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const [displayValue, setDisplayValue] = useState<string>("0");

  useEffect(() => {
    if (!isInView) return;

    const strVal = String(value ?? "0");
    // Extract numerical portion vs textual portion (e.g., "1.50 Cr" -> num: 1.5, textSuffix: " Cr")
    const match = strVal.match(/^([^\d.]*)([\d,.]+)(.*)$/);

    if (!match) {
      setDisplayValue(strVal);
      return;
    }

    const preText = match[1];
    const rawNumStr = match[2].replace(/,/g, "");
    const targetNum = parseFloat(rawNumStr);
    const postText = match[3];

    if (isNaN(targetNum)) {
      setDisplayValue(strVal);
      return;
    }

    // Determine decimal precision if any
    const decimals = rawNumStr.includes(".") ? rawNumStr.split(".")[1].length : 0;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      // Cubic ease-out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentNum = targetNum * easeProgress;

      let formattedNum = "";
      if (decimals > 0) {
        formattedNum = currentNum.toFixed(decimals);
      } else {
        formattedNum = Math.floor(currentNum).toLocaleString("en-IN");
      }

      setDisplayValue(`${preText}${formattedNum}${postText}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Ensure final exact string format
        setDisplayValue(strVal);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

export default AnimatedCounter;
