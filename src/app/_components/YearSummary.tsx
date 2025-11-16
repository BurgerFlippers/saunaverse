import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface YearSummaryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function YearSummary({ isOpen, onClose }: YearSummaryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleClose = () => {
    setCurrentPage(1);
    onClose();
  };

  const pageContent = [
    {
      heading1: "Your Sauna Year 2024",
      heading2: "A warm look back at your year in löyly.",
    },
    {
      heading1: "You had 105 sauna sessions this year.",
      heading2: "That's more than most people - well done.",
    },
    {
      heading1: "You spent a total of 97 hours and 12 minutes in sauna.",
      heading2: "Over 4 full days of warmth and recovery.",
    },
    {
      heading1: "Your peak month: July",
      heading2: "Summer heat meets sauna heat.",
    },
    {
      heading1: "Your #1 sauna this year was your home sauna",
      heading2: "Your warmest routines, right at home.",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-80 bg-[#1F1F23]"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-50 text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Page Content */}
          <div className="flex h-full items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex h-full w-full flex-col items-center justify-center px-6"
              >
                {/* Page Content */}
                <div className="text-center">
                  <h1 className="mb-4 text-6xl font-bold text-white">
                    {pageContent[currentPage - 1]?.heading1}
                  </h1>
                  <p className="text-xl text-gray-400">
                    {pageContent[currentPage - 1]?.heading2}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="absolute right-0 bottom-10 left-0 flex items-center justify-center gap-8">
            {/* Previous Button */}
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`rounded-full p-3 transition-all ${
                currentPage === 1
                  ? "cursor-not-allowed text-gray-600"
                  : "text-white hover:bg-[#2C2B36]"
              }`}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            {/* Page Indicators */}
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`h-2 rounded-full transition-all ${
                    currentPage === index + 1
                      ? "w-8 bg-[#D01400]"
                      : "w-2 bg-[#2C2B36] hover:bg-[#3a3944]"
                  }`}
                />
              ))}
            </div>

            {/* Next Button or Close Button */}
            {currentPage === totalPages ? (
              <button
                onClick={handleClose}
                className="rounded-full bg-[#D01400] px-5 py-2.5 text-white transition-all hover:bg-[#b01100]"
              >
                Close Summary
              </button>
            ) : (
              <button
                onClick={nextPage}
                className="rounded-full p-3 text-white transition-all hover:bg-[#2C2B36]"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
