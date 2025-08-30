// Corrected and Refactored: ~/lib/pdf2img.ts

export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

// Global state for lazy loading pdf.js library
let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    // If library is already loaded, return it
    if (pdfjsLib) return pdfjsLib;
    // If library is currently being loaded, return the existing promise
    if (loadPromise) return loadPromise;

    // Dynamically import the library
    // @ts-expect-error - pdfjs-dist/build/pdf.mjs may not be recognized as a standard module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        // CRITICAL FIX: Set the worker source from a reliable CDN.
        // This avoids issues with missing local files.
        lib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.mjs`;
        pdfjsLib = lib;
        return lib;
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        // Use the 'data' property for the array buffer
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        // Render the first page
        const page = await pdf.getPage(1);

        // Using a higher scale for better quality, 2.0 is a good balance. 4.0 can be very memory intensive.
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Failed to get canvas context");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        // REFACTOR: Use `await new Promise` for cleaner async flow
        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/png", 1.0);
        });

        if (!blob) {
            throw new Error("Failed to create image blob from canvas");
        }

        const originalName = file.name.replace(/\.pdf$/i, "");
        const imageFile = new File([blob], `${originalName}.png`, {
            type: "image/png",
        });

        return {
            imageUrl: URL.createObjectURL(blob),
            file: imageFile,
        };

    } catch (err: any) {
        // Log the actual error for better debugging
        console.error("PDF Conversion Error:", err);
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err.message || err}`,
        };
    }
}