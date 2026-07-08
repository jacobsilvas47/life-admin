"use client";

import { useState } from "react";
import { ACTION_REGISTRY } from "@/lib/ai/action-registry";

interface Props {
  actions: string[];
}

export default function SuggestedActions({
  actions,
}: Props) {
  const [selected, setSelected] = useState(
    actions.map((action) => ({
      action,
      checked: true,
    }))
  );

  function toggle(index: number) {
    setSelected((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              checked: !item.checked,
            }
          : item
      )
    );
  }

  return (
    <section className="border rounded-xl p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        AI Suggestions
      </h2>

      <div className="space-y-3">
        {selected.map((item, index) => (
          <label
            key={item.action}
            className="flex items-center gap-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggle(index)}
            />

            <div>
            <div className="font-medium">
                {ACTION_REGISTRY[item.action as keyof typeof ACTION_REGISTRY]?.icon}{" "}
                {ACTION_REGISTRY[item.action as keyof typeof ACTION_REGISTRY]?.title}
            </div>

            <p className="text-sm text-gray-500">
                {
                ACTION_REGISTRY[item.action as keyof typeof ACTION_REGISTRY]
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