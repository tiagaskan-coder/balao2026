import React from "react";
import { STEPS, accessoryIds, PCConfig, TechProduct } from "@/src/types/pcBuilder";
import { Trash2 } from "lucide-react";

type Props = {
  currentStepIndex: number;
  setCurrentStepIndex: (i: number) => void;
  config: PCConfig;
  extras: Record<string, { product: TechProduct; quantity: number }[]>;
  handleRemove: (stepId: keyof PCConfig) => void;
  clearExtrasForStep: (stepId: string) => void;
};

export default function StepSidebar({ currentStepIndex, setCurrentStepIndex, config, extras, handleRemove, clearExtrasForStep }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        Sua Configuração
      </h2>
      <div className="space-y-3 mb-5">
        {STEPS.map((step, index) => {
          const selected = config[step.id as keyof PCConfig];
          const isActive = index === currentStepIndex;
          const extrasList = extras[step.id] || [];
          const extrasDone = accessoryIds.has(step.id) && extrasList.length > 0;
          return (
            <div
              key={step.id}
              className={`
                relative p-2 rounded-lg border transition-all cursor-pointer
                ${isActive ? "border-[#E60012] bg-red-50 ring-1 ring-[#E60012]" : "border-gray-200 hover:border-gray-300"}
                ${(selected || extrasDone) ? "bg-gray-50" : ""}
              `}
              onClick={() => setCurrentStepIndex(index)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded-full ${isActive || selected ? "bg-[#E60012] text-white" : "bg-gray-100 text-gray-400"}`}>
                  <step.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-medium ${isActive ? "text-[#E60012]" : "text-gray-700"}`}>
                      {step.label}
                    </span>
                    {(selected || extrasDone) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (accessoryIds.has(step.id)) clearExtrasForStep(step.id);
                          else handleRemove(step.id as keyof PCConfig);
                        }}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Remover ${step.label}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  {accessoryIds.has(step.id) ? (
                    extrasDone ? (
                      <div className="text-xs text-gray-600 truncate">
                        {extrasList.map((x) => `${x.product.name} x${x.quantity}`).join(", ")}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">Pendente...</div>
                    )
                  ) : (
                    selected ? (
                      <>
                        <div className="text-xs text-gray-600 truncate">{selected.name}</div>
                        <div className="text-xs font-bold text-[#E60012] mt-1">{selected.price}</div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 italic">Pendente...</div>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
