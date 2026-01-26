import React from "react";
import { ValidationResult } from "@/src/types/pcBuilder";
import { ShieldCheck, AlertTriangle, AlertCircle, Check } from "lucide-react";

type Props = { validationResult: ValidationResult; isComplete: boolean };

export default function ValidationChecklist({ validationResult, isComplete }: Props) {
  return (
    <div className="border-t pt-4 mb-4">
      <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
        <ShieldCheck size={14} /> Checklist de Compatibilidade
      </h3>
      <div className="space-y-2 text-xs">
        {validationResult.errors.length > 0 ? (
          validationResult.errors.map((err, i) => (
            <div key={i} className="flex gap-2 text-red-600 bg-red-50 p-1 rounded">
              <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          ))
        ) : isComplete ? (
          <div className="flex gap-2 text-green-600 bg-green-50 p-1 rounded">
            <Check size={12} className="flex-shrink-0 mt-0.5" />
            <span>Setup 100% Compatível!</span>
          </div>
        ) : (
          <div className="text-gray-400 italic">Complete a build para validar...</div>
        )}
        {validationResult.warnings.map((warn, i) => (
          <div key={`warn-${i}`} className="flex gap-2 text-amber-600 bg-amber-50 p-1 rounded">
            <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
            <span>{warn}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
