// app/components/upload-zone.tsx
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File, AlertCircle } from "lucide-react";
import { isPDF } from "@/lib/utils";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];

      if (!isPDF(selectedFile)) {
        toast.error("Format non supporté");
        return;
      }

      // Check for multi-page PDF (this is just a stub - actual check happens server-side)
      setFile(selectedFile);
      onFileSelected(selectedFile);
    },
    [onFileSelected, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <AnimatePresence>
      {!file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-3xl mx-auto"
        >
          <div
            {...getRootProps()}
            className={`upload-zone rounded-lg p-12 text-center cursor-pointer transition-all ${
              isDragActive ? "active" : ""
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="bg-primary/20 p-4 rounded-full">
                <UploadCloud className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isDragActive
                    ? "Déposez votre CV ici"
                    : "Téléchargez votre CV"}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Glissez-déposez votre fichier PDF ici, ou cliquez pour
                  sélectionner un fichier
                </p>
                <p className="text-xs text-muted-foreground">
                  Format accepté: PDF (une seule page)
                </p>
              </div>
              <Button variant="outline" className="mt-2">
                Sélectionner un fichier
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center mt-6">
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>
                Votre CV reste confidentiel et ne sera pas stocké après
                l'analyse
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
