"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type UploadType = "pdf" | "text";

export default function UploadForm({
  onPdfUpload,
  onTextSubmit,
}: {
  onPdfUpload: (files: File[]) => void;
  onTextSubmit: (text: string) => void;
}) {
  const [uploadType, setUploadType] = useState<UploadType>("pdf");
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [text, setText] = useState("");

  const handleUploadTypeChange = (value: string) => {
    if (value === "pdf" || value === "text") {
      setUploadType(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadType === "pdf" && pdfFiles.length > 0) {
      onPdfUpload(pdfFiles);
      setPdfFiles([]);
    } else if (uploadType === "text" && text.trim()) {
      onTextSubmit(text);
      setText("");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Input</CardTitle>
        <CardDescription>
          Choose whether to upload PDF files or enter text manually.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <RadioGroup
            value={uploadType}
            onValueChange={handleUploadTypeChange}
            className="flex flex-row gap-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="pdf" id="upload-pdf" />
              <Label htmlFor="upload-pdf">PDF Upload</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="text" id="upload-text" />
              <Label htmlFor="upload-text">Text Upload</Label>
            </div>
          </RadioGroup>

          {uploadType === "pdf" ? (
            <Input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => {
                const selectedFiles = e.target.files
                  ? Array.from(e.target.files)
                  : [];
                setPdfFiles(selectedFiles);
              }}
              className="mb-4"
            />
          ) : (
            <Textarea
              placeholder="Enter or paste text for quiz"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="resize-y min-h-[120px] mb-4"
            />
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full">
            {uploadType === "pdf" ? "Generate from PDFs" : "Generate from Text"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
