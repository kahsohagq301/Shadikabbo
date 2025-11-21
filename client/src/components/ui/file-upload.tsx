import { useState, useRef } from "react";
import { Upload, X, File, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  id: string;
  accept: string;
  fileType: "image" | "document";
  value?: string;
  onChange: (file: File | null, url: string) => void;
  onError?: (error: string) => void;
  maxSize?: number;
  className?: string;
  testId?: string;
}

export function FileUpload({
  label,
  id,
  accept,
  fileType,
  value,
  onChange,
  onError,
  maxSize = 10 * 1024 * 1024,
  className,
  testId,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${maxSize / 1024 / 1024}MB`;
    }

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (fileType === "image" && !validImageTypes.includes(file.type)) {
      return "Only JPG, PNG, GIF, and WEBP images are allowed";
    }

    if (fileType === "document" && !validDocTypes.includes(file.type)) {
      return "Only PDF and Word documents are allowed";
    }

    return null;
  };

  const handleFileChange = (file: File | null) => {
    setError(null);

    if (!file) {
      setPreview(null);
      setFileName(null);
      onChange(null, "");
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    setFileName(file.name);

    if (fileType === "image") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onChange(file, "");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </Label>

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-md p-6 cursor-pointer transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary/50",
          preview || fileName ? "bg-card" : "bg-background"
        )}
        data-testid={`${testId}-dropzone`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          accept={accept}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
          data-testid={`${testId}-input`}
        />

        {preview && fileType === "image" ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-md object-contain"
              data-testid={`${testId}-preview`}
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              data-testid={`${testId}-remove`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {fileType === "document" ? (
                <FileText className="h-8 w-8 text-primary" />
              ) : (
                <ImageIcon className="h-8 w-8 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">{fileName}</p>
                <p className="text-xs text-muted-foreground">File selected</p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleRemove}
              data-testid={`${testId}-remove`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">
              {isDragging ? "Drop file here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-muted-foreground">
              {fileType === "image"
                ? "PNG, JPG, GIF, WEBP up to 10MB"
                : "PDF, DOC, DOCX up to 10MB"}
            </p>
          </div>
        )}
      </div>

      {value && !preview && !fileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <File className="h-4 w-4" />
          <span>Current file: {value.split('/').pop()}</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
