"use client";

import { AlertTriangle, CheckCircle, User, Clock, FileText, Copy } from "lucide-react";
import { Badge } from "../../ui/Badge";

export function MetadataPanel({
  file,
  label,
}: {
  file: {
    name: string;
    metadata: Record<string, string>;
    metadataStatus: string;
    metadataReason: string;
    isOcr: boolean;
  };
  label: string;
}) {
  const metaEntries = Object.entries(file.metadata).filter(([, v]) => v);
  const isSuspicious = file.metadataStatus === "Mencurigakan";

  return (
    <div className="bg-canvas-soft rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted uppercase tracking-wide font-medium">{label} — Metadata</p>
        <Badge
          className={`inline-flex items-center gap-1 ${isSuspicious ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}
        >
          {isSuspicious ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
          {file.metadataStatus}
        </Badge>
      </div>

      {file.metadataReason && <p className="text-xs text-muted mb-3 italic">{file.metadataReason}</p>}

      {file.isOcr && (
        <div className="mb-3 px-3 py-2 bg-accent-amber/10 text-accent-amber rounded-md text-xs flex items-center gap-2">
          <Copy className="w-3 h-3" />
          File ini diproses melalui OCR (PDF scan)
        </div>
      )}

      {metaEntries.length > 0 ? (
        <div className="space-y-2 text-xs">
          {metaEntries.map(([key, val]) => {
            const isAuthorField = ["author", "creator", "authors", "lastSavedBy", "lastModifiedBy"].includes(key.toLowerCase());
            const isDateField = ["created", "modified", "creationdate", "moddate"].includes(key.toLowerCase());
            return (
              <div key={key} className="flex gap-2 items-start">
                {isAuthorField ? (
                  <User className="w-3 h-3 text-muted shrink-0 mt-0.5" />
                ) : isDateField ? (
                  <Clock className="w-3 h-3 text-muted shrink-0 mt-0.5" />
                ) : (
                  <FileText className="w-3 h-3 text-muted shrink-0 mt-0.5" />
                )}
                <span className="text-muted shrink-0">{key}:</span>
                <span className="text-body break-all">{String(val)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-soft italic">Tidak ada metadata</p>
      )}
    </div>
  );
}
