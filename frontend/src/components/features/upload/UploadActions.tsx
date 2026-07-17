"use client";

import { Loader2 } from "lucide-react";
import { Button } from "../../ui/Button";

export function UploadActions({
  onUpload,
  onAnalyze,
  uploadPending,
  analyzePending,
  canUpload,
}: {
  onUpload: () => void;
  onAnalyze: () => void;
  uploadPending: boolean;
  analyzePending: boolean;
  canUpload: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onUpload} disabled={uploadPending || !canUpload}>
        {uploadPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Mengunggah...
          </>
        ) : (
          "Unggah File"
        )}
      </Button>
      <Button variant="secondary" onClick={onAnalyze} disabled={analyzePending}>
        {analyzePending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Menganalisis...
          </>
        ) : (
          "Analisis"
        )}
      </Button>
    </div>
  );
}
