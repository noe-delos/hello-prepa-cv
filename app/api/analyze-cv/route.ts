/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import pdf from "pdf-parse";
import { getOpenAIInstance, SYSTEM_PROMPT } from "@/lib/openai";
import { CVType, AnalysisResult } from "@/lib/types";

export const maxDuration = 60;

const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  console.log("Starting PDF text extraction...");
  try {
    const data = await pdf(buffer);
    const textLength = data.text.length;
    console.log(
      `Successfully extracted ${textLength} characters of text from PDF`
    );
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

const checkPDFPageCount = async (buffer: Buffer): Promise<void> => {
  console.log("Checking PDF page count...");
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const pageCount = pdfDoc.getPageCount();

    console.log(`PDF has ${pageCount} page(s)`);

    if (pageCount > 1) {
      console.warn("PDF contains multiple pages, rejecting...");
      throw new Error("Le CV doit contenir une seule page");
    }

    console.log("PDF page count check passed");
  } catch (error) {
    console.error("Error checking PDF page count:", error);
    throw error;
  }
};

const analyzeCVWithAI = async (
  text: string,
  cvType: CVType
): Promise<AnalysisResult> => {
  console.log(`Starting CV analysis with AI for type: ${cvType}...`);
  console.log(`Text length to analyze: ${text.length} characters`);

  const openai = getOpenAIInstance();

  const systemMessage = `${SYSTEM_PROMPT}\nType de CV: ${
    cvType === "finance-conseil" ? "Finance/Conseil" : "Général"
  }`;

  console.log("Sending request to OpenAI API...");
  console.time("openai-request");

  const response = await openai.chat.completions.create({
    model: "o3-mini",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: `Voici le texte extrait du CV à analyser:\n\n${text}\n\nMerci de fournir une analyse détaillée avec des suggestions concrètes d'amélioration pour ce CV. Réponds en format JSON avec les champs "summary" (un texte simple, pas un objet), "suggestions", et "rating" (une note de 1 à 5, où 5 est excellent).

        Vérifie d'abord si c'est bien un CV. Si ce n'est pas un CV, retourne simplement un JSON avec le champ "summary" indiquant que ce n'est pas un CV, un tableau "suggestions" vide, et pas de "rating".
        
        Chaque suggestion doit contenir "type" (uniquement "content"), "title", "priority" ("urgent", "warning", ou "low"), "source_quote" (citation de la transcription), et "description". 
        
        Important: Toutes les suggestions doivent être directement basées sur la transcription vidéo fournie dans le prompt système. N'inclus PAS la citation dans le champ description, elle doit être uniquement dans le champ source_quote.
        
        Pour les descriptions des suggestions, utilise le format markdown là où c'est pertinent avec:
        - Des **éléments en gras** pour mettre en avant les points importants
        - Des listes à puces pour les exemples ou les étapes
        - Des paragraphes bien structurés et bien espacés pour une meilleure lisibilité
        - Espaces des paragraphes avec des lignes vides entre eux`,
      },
    ],
    response_format: { type: "json_object" },
  });

  console.timeEnd("openai-request");
  console.log("OpenAI API response received");

  const responseContent = response.choices[0].message.content;
  if (!responseContent) {
    console.error("Empty response content from OpenAI");
    throw new Error("Empty response from OpenAI");
  }

  // Parse the response
  const parsedResponse = JSON.parse(responseContent);
  console.log("Successfully parsed OpenAI response as JSON");
  console.log("Analysis results:", parsedResponse);

  // Get summary
  const summary = parsedResponse.summary || "Analyse complétée";

  // Get rating
  const rating = parsedResponse.rating || undefined;

  // Get suggestions with priority and source quote
  const suggestions = Array.isArray(parsedResponse.suggestions)
    ? parsedResponse.suggestions
        .filter((suggestion: any) => suggestion.type === "content")
        .map((suggestion: any) => ({
          type: "content",
          title: suggestion.title,
          priority: suggestion.priority || "low", // Default to low if missing
          source_quote: suggestion.source_quote || "",
          description: suggestion.description,
        }))
    : [];

  const result: AnalysisResult = {
    summary: summary,
    suggestions: suggestions,
    rating: rating,
  };

  console.log(
    `Analysis complete with ${result.suggestions.length} suggestions and rating: ${rating}`
  );
  return result;
};

export async function POST(request: NextRequest) {
  console.log("==== CV Analysis API Request Received ====");

  try {
    console.log("Parsing form data...");
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const cvType = formData.get("type") as CVType;

    console.log(`File received: ${file?.name}, size: ${file?.size} bytes`);
    console.log(`CV type: ${cvType}`);

    if (!file) {
      console.error("No file provided in the request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!cvType || !["finance-conseil", "general"].includes(cvType)) {
      console.error(`Invalid CV type: ${cvType}`);
      return NextResponse.json({ error: "Invalid CV type" }, { status: 400 });
    }

    // Convert file to buffer
    console.log("Converting file to buffer...");
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(`Buffer created, size: ${buffer.length} bytes`);

    // Check if PDF has more than one page
    try {
      await checkPDFPageCount(buffer);
    } catch (error: any) {
      if (error.message === "Le CV doit contenir une seule page") {
        return NextResponse.json(
          { error: "Le CV doit contenir une seule page" },
          { status: 400 }
        );
      }
      throw error;
    }

    // Extract text from PDF
    const text = await extractTextFromPDF(buffer);
    const previewText =
      text.length > 300 ? text.substring(0, 300) + "..." : text;
    console.log("Extracted text preview:", previewText);

    // Analyze the CV with AI
    console.log("Starting AI analysis...");
    console.time("ai-analysis");
    const analysisResult = await analyzeCVWithAI(text, cvType);
    console.timeEnd("ai-analysis");

    console.log("Analysis complete, returning results");
    return NextResponse.json({
      success: true,
      result: analysisResult,
    });
  } catch (error: any) {
    console.error("Error in CV analysis API:", error);

    if (error.message === "Le CV doit contenir une seule page") {
      return NextResponse.json(
        { error: "Le CV doit contenir une seule page" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze CV", message: error.message },
      { status: 500 }
    );
  } finally {
    console.log("==== CV Analysis API Request Completed ====");
  }
}
