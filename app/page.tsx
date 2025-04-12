"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configuration nécessaire pour react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Types
type CVType = "finance-conseil" | "general";

type SuggestionType = "content";

type SuggestionPriority = "urgent" | "warning" | "low";

interface Suggestion {
  type: SuggestionType;
  title: string;
  priority: SuggestionPriority;
  source_quote: string;
  description: string;
}

interface AnalysisResult {
  summary: string;
  suggestions: Suggestion[];
  rating?: number;
}

// Header Component
function Header() {
  return (
    <header className="py-4 bg-white">
      <div className="px-4 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="https://cdn.prod.website-files.com/641186bf8fed6064e9a2fe88/6419a1308d6355431a6ef6af_Calque_1.webp"
            alt="Hello Prépa"
            className="h-8"
          />
        </div>
        <Button
          className="bg-zinc-900 text-white font-bold hover:bg-zinc-800"
          onClick={() =>
            window.open("https://calendly.com/hello-prepa", "_blank")
          }
        >
          Prendre rendez-vous
        </Button>
      </div>
    </header>
  );
}

// Upload Zone Component
function UploadZone({
  onFileSelected,
  onError,
}: {
  onFileSelected: (file: File) => void;
  onError: (message: string) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (file.type === "application/pdf") {
      setSelectedFile(file);
      onFileSelected(file);
    } else {
      onError("Veuillez sélectionner un fichier PDF");
      toast.error("Veuillez sélectionner un fichier PDF");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto mt-12"
    >
      <form
        onDragEnter={handleDrag}
        onSubmit={(e) => e.preventDefault()}
        className="w-full"
      >
        <div
          className={`
            rounded-3xl p-10 text-center bg-white shadow-soft aspect-square max-w-md mx-auto flex flex-col items-center justify-center
            ${dragActive ? "bg-ai ring-2 ring-primary/20" : ""}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6">
            <Icon
              icon="noto:open-file-folder"
              className="size-10 text-primary"
            />
          </div>
          <h3 className="text-xl font-medium mb-6">Déposez votre CV</h3>
          <Button
            variant="outline"
            className="rounded-xl px-6 py-5 h-auto text-base"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            Parcourir
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={handleChange}
          />
        </div>
      </form>
    </motion.div>
  );
}

// Type Selector Component
function TypeSelector({
  onSelect,
  onReset,
}: {
  onSelect: (type: CVType) => void;
  onReset: () => void;
}) {
  const cvTypes = [
    {
      id: "finance-conseil",
      title: "Finance / Conseil",
      icon: "noto:money-with-wings",
      description:
        "Pour les postes dans la banque, l'audit, le conseil ou la finance d'entreprise",
    },
    {
      id: "general",
      title: "CV Général",
      icon: "noto:necktie",
      description: "Pour les postes généralistes, stages, ou premiers emplois",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, width: "100%", maxWidth: "30rem" }}
      animate={{ opacity: 1, y: 0, width: "100%", maxWidth: "48rem" }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="mx-auto mt-20"
    >
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-medium">
          Choisissez le type de CV à analyser
        </h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Retour
        </Button>
      </div>

      <div className="flex gap-4">
        {cvTypes.map((type) => {
          return (
            <motion.div
              key={type.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-soft rounded-3xl p-8 cursor-pointer hover:border-primary/50 hover:bg-muted/10 transition-all flex-1"
              onClick={() => onSelect(type.id as CVType)}
            >
              <div className="flex flex-col items-center text-center">
                <Icon
                  icon={type.icon}
                  className="w-10 h-10 text-primary mb-4"
                />
                <h3 className="font-medium text-lg mb-2">{type.title}</h3>
                <p className="text-xs text-muted-foreground/60 px-14 mt-2">
                  {type.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Loading Skeleton Component
function AnalysisLoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-7xl mx-auto mt-12"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Suggestions skeleton - 65% width */}
        <div className="w-full md:w-2/3">
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-6">
                <div className="flex items-start">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-4 flex-1">
                    <Skeleton className="h-6 w-2/3 mb-4" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-4/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PDF viewer skeleton - 35% width */}
        <div className="w-full md:w-1/3">
          <Skeleton className="h-[80vh] w-full rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
}

// PDF Viewer Component avec react-pdf
function PDFViewerComponent({
  file,
  className = "",
}: {
  file: File;
  className?: string;
}) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    // Create object URL from the file
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    // Cleanup function to revoke the object URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div
      className={`${className} h-screen max-h-[90vh] rounded-xl overflow-hidden bg-white shadow-md p-4 flex flex-col`}
    >
      <div className="flex-grow overflow-auto w-full h-full">
        {url && (
          <object
            data={
              url +
              "#view=Fit&toolbar=0&statusbar=0&messages=0&navpanes=0&scrollbar=0"
            }
            type="application/pdf"
            className="w-full h-full"
          >
            <div className="flex items-center justify-center h-full">
              <p>
                Your browser does not support PDF viewing.{" "}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Download the PDF
                </a>{" "}
                instead.
              </p>
            </div>
          </object>
        )}
      </div>
    </div>
  );
}

// Rating Component with improved visuals
function RatingDisplay({ rating }: { rating?: number }) {
  if (!rating) return null;

  const ratingOutOf5 = Math.min(5, Math.max(1, Math.round(rating)));

  return (
    <div className="flex items-center py-3 mt-4 bg-zinc-50 rounded-xl px-4">
      <span className="text-base font-medium mr-3">Note:</span>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          icon="solar:star-bold"
          className={`w-6 h-6 ${
            i < ratingOutOf5 ? "text-yellow-500" : "text-zinc-200"
          }`}
        />
      ))}
      <span className="ml-3 text-lg font-medium">{ratingOutOf5}/5</span>
    </div>
  );
}

// Suggestion Card Component - Modifié pour ne pas répéter la citation
function SuggestionCard({
  suggestion,
  index,
}: {
  suggestion: Suggestion;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(true);

  // Priority badge styles
  const priorityStyles = {
    urgent: "bg-red-100 text-red-800 hover:bg-red-200",
    warning: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    low: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  };

  // Priority icons
  const priorityIcons = {
    urgent: "mdi:alert-circle",
    warning: "mdi:alert",
    low: "mdi:information",
  };

  // Priority labels in French
  const priorityLabels = {
    urgent: "Urgent",
    warning: "Attention",
    low: "Faible",
  };

  // Enhanced markdown formatting
  const markdownDescription = suggestion.description
    .replace(/\*\*(.*?)\*\*/g, "**$1**") // already bold stays bold
    .replace(/(Par exemple[,:]\s)/g, "$1\n\n") // add newlines after "Par exemple:"
    .replace(/(\.\s)([A-Z])/g, "$1\n\n$2") // add newlines between sentences
    .replace(/(\n\n)/g, "\n\n\n"); // add extra spacing between paragraphs

  // Remove any markdown quotes from source_quote if needed
  const cleanedSourceQuote = suggestion.source_quote.replace(/^\*|\*$/g, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white shadow-soft rounded-2xl p-6 hover:border-primary/50 transition-colors relative"
    >
      {/* Priority Badge - Top Right */}
      <div className="absolute top-4 right-4">
        <Badge className={priorityStyles[suggestion.priority]}>
          <Icon
            icon={priorityIcons[suggestion.priority]}
            className="w-3 h-3 mr-1"
          />
          {priorityLabels[suggestion.priority]}
        </Badge>
      </div>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-start cursor-pointer"
      >
        <div className="p-2 rounded-full bg-zinc-100">
          <Icon icon="noto:light-bulb" className="size-6" />
        </div>
        <div className="ml-3 flex-1 pr-24 pt-2">
          {/* Add right padding to avoid overlap with badge */}
          <h4 className="font-medium">{suggestion.title}</h4>
          <motion.div
            initial={{ height: "auto", opacity: 1 }}
            animate={{
              height: isOpen ? "auto" : 0,
              opacity: isOpen ? 1 : 0,
              marginTop: isOpen ? "0.5rem" : 0,
            }}
            transition={{ duration: 0.3 }}
            className="markdown-content overflow-hidden"
          >
            <ReactMarkdown className="text-muted-foreground prose prose-sm prose-p:my-4 prose-li:my-1">
              {markdownDescription}
            </ReactMarkdown>

            {/* Afficher la citation séparément et uniquement en dessous si elle existe */}
            {cleanedSourceQuote && (
              <div className="mt-4 pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500 italic">
                  "{cleanedSourceQuote}"
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Analysis Results Component
function AnalysisResults({
  result,
  file,
  onReset,
}: {
  result: AnalysisResult;
  file: File;
  onReset: () => void;
}) {
  // Filter suggestions to only include content type
  const contentSuggestions = result.suggestions.filter(
    (s) => s.type === "content"
  );

  // Count suggestions by priority
  const urgentCount = contentSuggestions.filter(
    (s) => s.priority === "urgent"
  ).length;
  const warningCount = contentSuggestions.filter(
    (s) => s.priority === "warning"
  ).length;
  const lowCount = contentSuggestions.filter(
    (s) => s.priority === "low"
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-7xl mx-auto mt-6"
    >
      {/* Breadcrumb */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="flex items-center"
        >
          <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
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
            <div className="mb-6 pb-4 bg-white shadow-soft rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="secondary" className="mb-3">
                  Résumé
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground whitespace-pre-line">
                {result.summary}
              </p>

              {result.rating && <RatingDisplay rating={result.rating} />}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge className="mb-1">
                  Suggestions{" "}
                  <span className="ml-1">{contentSuggestions.length}</span>
                </Badge>

                <div className="flex gap-2">
                  {urgentCount > 0 && (
                    <div className="flex items-center gap-1 bg-red-50 text-red-800 px-2 py-1 rounded-lg">
                      <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                      <span className="text-xs font-medium">{urgentCount}</span>
                    </div>
                  )}
                  {warningCount > 0 && (
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-1 rounded-lg">
                      <Icon icon="mdi:alert" className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {warningCount}
                      </span>
                    </div>
                  )}
                  {lowCount > 0 && (
                    <div className="flex items-center gap-1 bg-blue-50 text-blue-800 px-2 py-1 rounded-lg">
                      <Icon icon="mdi:information" className="w-4 h-4" />
                      <span className="text-xs font-medium">{lowCount}</span>
                    </div>
                  )}
                </div>
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

// Main Page Component
export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [cvType, setCvType] = useState<CVType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loadingToast, setLoadingToast] = useState<string | null>(null);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setCvType(null); // Reset CV type selection
  };

  const handleCVTypeSelected = async (selectedType: CVType) => {
    setCvType(selectedType);
    setIsLoading(true);

    // Show loading toast with indefinite duration
    const toastId = toast.info("Analyse du CV en cours...", {
      duration: Infinity,
    });
    setLoadingToast(toastId as string);

    try {
      const formData = new FormData();
      formData.append("file", file as File);
      formData.append("type", selectedType);

      const response = await fetch("/api/analyze-cv", {
        method: "POST",
        body: formData,
      });

      // Dismiss loading toast
      if (loadingToast) {
        toast.dismiss(loadingToast);
        setLoadingToast(null);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Une erreur est survenue lors de l'analyse"
        );
      }

      const data = await response.json();
      setResult(data.result);
      setIsLoading(false);
      toast.success("Analyse terminée avec succès!");
      toast.dismiss(toastId);
    } catch (error: any) {
      setIsLoading(false);
      console.error("Error analyzing CV:", error);

      // Dismiss loading toast if it exists
      if (loadingToast) {
        toast.dismiss(loadingToast);
        setLoadingToast(null);
      }

      if (error.message === "Le CV doit contenir une seule page") {
        toast.error("Votre CV doit contenir une seule page maximum");
        resetState();
      } else {
        toast.error("Une erreur est survenue lors de l'analyse du CV");
      }
    }
  };

  const handleError = (message: string) => {
    toast.error(message);
    resetState();
  };

  const resetState = () => {
    setFile(null);
    setCvType(null);
    setIsLoading(false);
    setResult(null);

    // Dismiss loading toast if it exists
    if (loadingToast) {
      toast.dismiss(loadingToast);
      setLoadingToast(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-app font-inter">
      <Header />

      <main className="flex-1 px-4 py-8">
        <AnimatePresence mode="wait">
          {!file && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
                  Analyseur de CV
                  <img
                    src="https://cdn.prod.website-files.com/641186bf8fed6064e9a2fe88/6419a1308d6355431a6ef6af_Calque_1.webp"
                    alt="Hello Prépa"
                    className="h-14 ml-3"
                  />
                </h1>
              </div>
              <UploadZone
                onFileSelected={handleFileSelected}
                onError={handleError}
              />
            </>
          )}

          {file && !cvType && !isLoading && !result && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
                  Analyseur de CV
                  <img
                    src="https://cdn.prod.website-files.com/641186bf8fed6064e9a2fe88/6419a1308d6355431a6ef6af_Calque_1.webp"
                    alt="Hello Prépa"
                    className="h-8 ml-2"
                  />
                </h1>
              </div>
              <TypeSelector
                onSelect={handleCVTypeSelected}
                onReset={resetState}
              />
            </>
          )}

          {isLoading && <AnalysisLoadingSkeleton />}

          {result && file && (
            <AnalysisResults result={result} file={file} onReset={resetState} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
