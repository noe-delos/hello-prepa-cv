"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import { AnalysisResult, Suggestion } from "@/lib/types";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { PDFViewerComponent } from "./pdf-viewer";
import ReactMarkdown from "react-markdown";

interface AnalysisResultProps {
  result: AnalysisResult;
  file: File;
  onReset: () => void;
}

export function AnalysisResults({
  result,
  file,
  onReset,
}: AnalysisResultProps) {
  // Filter suggestions to only include content type
  const contentSuggestions = result.suggestions.filter(
    (s) => s.type === "content"
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Breadcrumb */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nouvelle analyse
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Suggestions - 65% width */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-2/3"
        >
          <div className="space-y-6">
            <div className="mb-6 border-b pb-4">
              <Badge variant="secondary" className="mb-3">
                Résumé
              </Badge>
              <p className="text-lg text-muted-foreground whitespace-pre-line">
                {result.summary}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="mb-1">
                  Suggestions{" "}
                  <span className="ml-1">{contentSuggestions.length}</span>
                </Badge>
              </div>

              <div className="space-y-4">
                {contentSuggestions.map((suggestion, index) => (
                  <SuggestionCard
                    key={index}
                    suggestion={suggestion}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* PDF viewer - 35% width */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-1/3"
        >
          <PDFViewerComponent file={file} className="sticky top-6" />
        </motion.div>
      </div>
    </motion.div>
  );
}

function SuggestionCard({
  suggestion,
  index,
}: {
  suggestion: Suggestion;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Convert description to markdown format by enhancing it
  const markdownDescription = suggestion.description
    .replace(/\*\*(.*?)\*\*/g, "**$1**") // already bold stays bold
    .replace(/(Par exemple[,:]\s)/g, "$1\n\n") // add newlines after "Par exemple:"
    .replace(/(\.\s)([A-Z])/g, "$1\n\n$2"); // add newlines between sentences

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-start cursor-pointer"
      >
        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
          <FileText className="w-4 h-4" />
        </div>
        <div className="ml-3 flex-1">
          <h4 className="font-medium">{suggestion.title}</h4>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isOpen ? "auto" : 0,
              opacity: isOpen ? 1 : 0,
              marginTop: isOpen ? "0.5rem" : 0,
            }}
            transition={{ duration: 0.3 }}
            className="markdown-content overflow-hidden"
          >
            <ReactMarkdown className="text-muted-foreground prose prose-sm">
              {markdownDescription}
            </ReactMarkdown>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
