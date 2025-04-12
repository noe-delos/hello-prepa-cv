"use client";

import { motion } from "framer-motion";
import { FileText, Brain, CheckCircle2 } from "lucide-react";
import { Progress } from "./ui/progress";

interface AnalysisLoadingProps {
  currentStep: number;
}

export function AnalysisLoading({ currentStep }: AnalysisLoadingProps) {
  const steps = [
    {
      icon: FileText,
      title: "Extraction",
    },
    {
      icon: Brain,
      title: "Analyse",
    },
    {
      icon: CheckCircle2,
      title: "Finalisation",
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="rounded-lg p-6">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        >
          <Progress value={progress} className="h-2 mb-6" />
        </motion.div>

        <div className="flex justify-center space-x-12 py-6">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  opacity: isActive || isCompleted ? 1 : 0.6,
                }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`p-3 rounded-full ${
                    isCompleted
                      ? "bg-green-100 text-green-600"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                </div>
                <span className="text-sm mt-2 font-medium">{step.title}</span>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 w-2 h-2 rounded-full bg-primary"
                    style={{
                      boxShadow: "0 0 0 3px rgba(var(--primary), 0.3)",
                    }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
