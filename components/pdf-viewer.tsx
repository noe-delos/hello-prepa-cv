"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { cn } from "@/lib/utils";

// Set up the worker for PDF.js - using the same version as in your working example
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerComponentProps {
  file: File | string;
  className?: string;
  title?: string;
}

export function PDFViewerComponent({
  file,
  className = "",
  title,
}: PDFViewerComponentProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (file instanceof File) {
      // Create a URL for the file
      const url = URL.createObjectURL(file);
      setPdfUrl(url);

      // Clean up the URL when the component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (typeof file === "string") {
      setPdfUrl(file);
    }
  }, [file]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));
  const rotate = () => setRotation((prev) => (prev + 90) % 360);

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const goToPreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchText("");
    }
  };

  // Derive document title from file if not provided
  const displayTitle =
    title ||
    (typeof file === "string"
      ? file.substring(file.lastIndexOf("/") + 1)
      : file instanceof File
      ? file.name
      : "Document");

  return (
    <div className={`border rounded-lg p-4 bg-white ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium truncate max-w-md">{displayTitle}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            className="h-8 w-8"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            className="h-8 w-8"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={rotate}
            className="h-8 w-8"
            title="Rotate"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <div className={cn("relative", showSearch ? "w-56" : "w-8")}>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSearch}
              className="h-8 w-8"
              title={showSearch ? "Close search" : "Search document"}
            >
              <Search className="h-4 w-4" />
            </Button>
            {showSearch && (
              <div className="absolute right-0 top-0 flex items-center gap-1 h-8 w-56 border rounded-md bg-white shadow-md z-10 pl-2 pr-1">
                <Input
                  ref={searchInputRef}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="h-6 text-sm border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Search in document..."
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchText("")}
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center border rounded-md p-2 bg-muted/20 overflow-auto max-h-[600px] min-h-[400px]">
        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => console.error("Error loading PDF:", error)}
            loading={
              <div className="flex items-center justify-center h-[400px]">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }
            className="overflow-auto"
            error={
              <div className="flex flex-col items-center justify-center h-[400px] text-red-500">
                <p className="font-medium">Failed to load PDF</p>
                <p className="text-sm mt-2">
                  Please check if the file is valid or try again.
                </p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-md"
              // Optional search highlight props
              customTextRenderer={
                searchText
                  ? ({ str }) => {
                      if (!searchText) return str;
                      const searchRegex = new RegExp(`(${searchText})`, "gi");
                      return str.replace(
                        searchRegex,
                        '<mark style="background-color: yellow; border-radius: 2px;">$1</mark>'
                      );
                    }
                  : undefined
              }
            />
          </Document>
        )}
      </div>

      {numPages && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <p className="text-sm">
            Page {pageNumber} of {numPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
