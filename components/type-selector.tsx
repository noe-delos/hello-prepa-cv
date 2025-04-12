// app/components/type-selector.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Briefcase, User } from "lucide-react";
import { CVType } from "@/lib/types";
import { CV_TYPES } from "@/lib/constants";
import { Button } from "./ui/button";

interface TypeSelectorProps {
  onSelect: (type: CVType) => void;
  onReset: () => void;
  className?: string;
}

export function TypeSelector({
  onSelect,
  onReset,
  className = "",
}: TypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<CVType | null>(null);

  const handleSelect = (type: CVType) => {
    setSelectedType(type);
  };

  const handleSubmit = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className={`w-full max-w-3xl mx-auto ${className}`}
    >
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-xl font-semibold text-center mb-6">
          Quel type de CV souhaitez-vous analyser ?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div
            className={`border rounded-lg p-6 cursor-pointer transition-all hover:border-primary ${
              selectedType === "finance-conseil"
                ? "border-primary bg-primary/10"
                : ""
            }`}
            onClick={() => handleSelect("finance-conseil")}
          >
            <div className="flex items-start">
              <div
                className={`p-2 rounded-full ${
                  selectedType === "finance-conseil"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Finance / Conseil</h3>
                  {selectedType === "finance-conseil" && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Optimal pour les candidatures dans les secteurs de la finance,
                  du conseil, de l'audit et des grandes entreprises.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`border rounded-lg p-6 cursor-pointer transition-all hover:border-primary ${
              selectedType === "general" ? "border-primary bg-primary/10" : ""
            }`}
            onClick={() => handleSelect("general")}
          >
            <div className="flex items-start">
              <div
                className={`p-2 rounded-full ${
                  selectedType === "general"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <User className="w-5 h-5" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Général</h3>
                  {selectedType === "general" && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Pour tous les autres secteurs d'activité et formats de CV
                  polyvalents.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onReset}>
            Retour
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedType}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Analyser mon CV
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
