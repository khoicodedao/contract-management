"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Document, Page, pdfjs } from "react-pdf";
import mammoth from "mammoth";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { FileHopDong } from "@shared/schema";

// import pdf worker từ node_modules (react-pdf v6+)
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

// cấu hình worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  document: FileHopDong;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  document,
}: Props) {
  const [docxHtml, setDocxHtml] = useState("");
  const [numPages, setNumPages] = useState<number>(0);

  useEffect(() => {
    const loadDocxFromBase64 = async () => {
      if (!document.noiDungFile) return;

      const base64 = document.noiDungFile.split(",").pop() || "";
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const result = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
      setDocxHtml(result.value);
    };

    if (document.tenFile?.endsWith(".docx")) {
      loadDocxFromBase64();
    }
  }, [document]);

  const getBase64Url = () => {
    if (!document.noiDungFile) return "";
    if (document.noiDungFile.startsWith("data:")) return document.noiDungFile;

    // fallback nếu chỉ là base64 raw
    const ext = document.tenFile?.split(".").pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
    };
    const mime = mimeMap[ext || ""] || "application/octet-stream";
    return `data:${mime};base64,${document.noiDungFile}`;
  };

  const handleDownload = () => {
    const link = window.document.createElement("a");
    link.href = getBase64Url();
    link.download = document.tenFile || "document";
    window.document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {document.tenFile || "Xem tài liệu"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center gap-3 mb-4">
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Tải xuống
          </Button>
        </div>
        <div className="bg-white border rounded p-4">
          {document.tenFile?.toLowerCase().endsWith(".pdf") ? (
            <div className="flex flex-col items-center">
              <Document
                file={getBase64Url()}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<p>Đang tải PDF...</p>}
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={600}
                  />
                ))}
              </Document>
            </div>
          ) : document.tenFile?.toLowerCase().endsWith(".docx") ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: docxHtml }}
            />
          ) : (
            <p className="text-muted-foreground text-center">
              Không thể xem trước loại file này.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
