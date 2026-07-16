"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Input } from "../../ui/Input";

export function FileUploader() {
  const [dragActive, setDragActive] = useState(false);
  const { selectedFiles, addSelectedFiles, removeSelectedFile } = useAppStore();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      addSelectedFiles(Array.from(e.dataTransfer.files));
    },
    [addSelectedFiles],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addSelectedFiles(Array.from(e.target.files));
  };

  return (
    <section className="bg-canvas-card rounded-xl p-8 border border-hairline">
      <h2 className="text-2xl mb-4 text-ink">Unggah File</h2>
      <p className="text-body mb-6 text-sm">
        Format didukung: .txt, .docx, .pdf. Maksimal 200 file, 10MB per file.
      </p>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-hairline hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto text-muted mb-4" />
        <p className="text-body mb-2">Seret file ke sini atau</p>
        <label className="inline-block px-4 py-2 bg-primary text-on-primary rounded-md cursor-pointer hover:bg-primary-active transition-colors text-sm">
          Pilih File
          <input
            type="file"
            multiple
            accept=".txt,.docx,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-sm text-muted">{selectedFiles.length} file dipilih</p>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {selectedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-canvas rounded-md text-sm"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted" />
                  <span className="truncate max-w-xs">{file.name}</span>
                  <span className="text-muted-soft text-xs">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeSelectedFile(i)}
                  aria-label={`Hapus ${file.name}`}
                  className="p-1 text-error hover:text-error/80 active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function CourseNameInput() {
  const { courseName, setCourseName } = useAppStore();
  return (
    <div className="mt-4">
      <label className="text-sm text-muted block mb-1">
        Nama Mata Kuliah (opsional, untuk mode strict)
      </label>
      <Input
        type="text"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        placeholder="Contoh: Pemrograman Web"
        className="w-full max-w-md"
      />
    </div>
  );
}
