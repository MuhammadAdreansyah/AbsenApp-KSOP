// src/components/signature-pad.tsx
// Digital Signature Pad Component

"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  onSignatureChange?: (signatureDataUrl: string) => void;
  error?: string;
}

export function SignaturePad({ onSignatureChange, error }: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const canvasProps = useMemo(
    () => ({
      width: 500,
      height: 200,
      className: "h-[180px] w-full cursor-crosshair rounded-xl border border-slate-300 bg-white",
    }),
    []
  );

  const handleClear = useCallback(() => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty((prev) => (prev ? prev : true));
      onSignatureChange?.("");
    }
  }, [onSignatureChange]);

  const handleEndStroke = useCallback(() => {
    if (signatureRef.current) {
      const currentIsEmpty = signatureRef.current.isEmpty();
      setIsEmpty((prev) => (prev === currentIsEmpty ? prev : currentIsEmpty));
      if (!currentIsEmpty) {
        const signatureDataUrl = signatureRef.current.toDataURL("image/png");
        onSignatureChange?.(signatureDataUrl);
      }
    }
  }, [onSignatureChange]);

  return (
    <div className="w-full">
      <div
        className={cn(
          "rounded-2xl border-2 border-dashed bg-slate-50 p-4",
          error ? "border-red-400" : "border-slate-300",
          isEmpty && "border-slate-300"
        )}
      >
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={canvasProps}
          onEnd={handleEndStroke}
          dotSize={2}
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={isEmpty}
          >
            Hapus Signature
          </Button>
          {!isEmpty && (
            <span className="flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
              Signature berhasil disimpan
            </span>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-gray-500">Silakan tandatangani di area di atas</p>
    </div>
  );
}
