"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface LoylyLikeButtonProps {
  liked: boolean;
  onLike: () => void;
  count: number;
}

export function LoylyLikeButton({
  liked,
  onLike,
  count,
}: LoylyLikeButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFullyAnimated, setIsFullyAnimated] = useState(liked);
  const [hasBeenClicked, setHasBeenClicked] = useState(liked);

  const handleClick = () => {
    if (!isAnimating) {
      // If already liked, just unlike without animation
      if (liked) {
        onLike();
        setHasBeenClicked(true);
        setIsFullyAnimated(false);
      } else {
        // First time liking - show animation
        setIsAnimating(true);
        setHasBeenClicked(true);
        setIsFullyAnimated(false); // Keep false until animation completes
        onLike();
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-5 w-5 items-center justify-center">
        <AnimatePresence mode="wait">
          {!isAnimating ? (
            <motion.button
              key="button"
              onClick={handleClick}
              className="relative flex h-5 w-5 items-center justify-center bg-transparent text-white"
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <svg
                width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={liked || isFullyAnimated ? "#D01400" : "none"}
              stroke={liked || isFullyAnimated ? "#D01400" : "#9CA3AF"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
            </svg>
          </motion.button>
        ) : (
          <motion.div
            key="animation"
            className="absolute flex h-5 w-5 items-center justify-center overflow-visible"
          >
            {/* Ladle (Löylykauha) - LARGE SIZE */}
            <motion.div
              className="absolute z-30"
              style={{ top: -42, left: "-5%" }}
              initial={{ opacity: 0, rotate: -10, x: 50, y: -10 }}
              animate={{
                opacity: [0, 1, 1, 1, 0],
                rotate: [-10, -45, -10],
                x: [50, -10, 50],
                y: [-10, 5, -10],
              }}
              transition={{
                duration: 0.8,
                times: [0, 0.15, 0.5, 0.85, 1],
              }}
            >
              <svg width="56" height="56" viewBox="0 0 60 60">
                <ellipse
                  cx="20"
                  cy="26"
                  rx="16"
                  ry="13"
                  fill="#8B4513"
                  stroke="#654321"
                  strokeWidth="1.5"
                />
                <rect
                  x="32"
                  y="23"
                  width="34"
                  height="5"
                  rx="2.5"
                  fill="#A0522D"
                  transform="rotate(20 32 24)"
                />
              </svg>
            </motion.div>

            {/* Heart - SMALL SIZE */}
            <motion.button className="relative z-10 flex h-5 w-5 items-center justify-center">
              <motion.svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={liked ? "#D01400" : "white"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"
                  animate={{
                    fill: liked || isFullyAnimated ? "#D01400" : "transparent",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.svg>
            </motion.button>

            {/* Steam particles - LARGE SIZE */}
            {[...Array(20)].map((_, i) => {
              const angle = (i / 20) * Math.PI;
              const isLast = i === 19;

              return (
                <motion.div
                  key={`steam-${i}`}
                  className="absolute z-20 h-4 w-4 rounded-full bg-white/55 blur-md"
                  style={{ top: -5 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    y: [0, -35 - Math.abs(Math.sin(angle)) * 15],
                    x: Math.cos(angle - Math.PI / 2) * 50,
                    scale: [0, 1.75, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 0.7,
                    delay: 0.8 + i * 0.025,
                    ease: "easeOut",
                  }}
                  onAnimationComplete={() => {
                    if (isLast) {
                      setIsAnimating(false);
                      setIsFullyAnimated(liked);
                    }
                  }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      <span className="text-sm text-gray-400">{count}</span>
    </div>
  );
}
