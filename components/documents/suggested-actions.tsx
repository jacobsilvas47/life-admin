"use client";

import { ACTION_REGISTRY } from "@/lib/ai/action-registry";

interface Props {
  actions: string[];
  selectedActions: string[];
  onToggle: (action: string) => void;
}

export default function SuggestedActions({
  actions,
  selectedActions,
  onToggle,
}: Props) {

  return (
    <section className="border rounded-xl p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        AI Suggestions
      </h2>

     <div className="space-y-3">
        {actions.map((action) => (
          <label
            key={action}
            className="flex items-center gap-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedActions.includes(action)}
              onChange={() => onToggle(action)}
            />

            <div>
            <div className="font-medium">
                {ACTION_REGISTRY[action as keyof typeof ACTION_REGISTRY]?.icon}{" "}
                {ACTION_REGISTRY[action as keyof typeof ACTION_REGISTRY]?.title}
            </div>

            <p className="text-sm text-gray-500">
                {
                ACTION_REGISTRY[action as keyof typeof ACTION_REGISTRY]
                    ?.description
                }
            </p>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}