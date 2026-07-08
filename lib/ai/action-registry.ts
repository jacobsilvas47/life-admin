export const ACTION_REGISTRY = {
  create_asset: {
    title: "Create Asset",
    description:
      "Create a new asset using the extracted information.",
    icon: "📦",
  },

  attach_receipt: {
    title: "Attach Receipt",
    description:
      "Link this receipt to the asset for future reference.",
    icon: "📄",
  },

  add_warranty: {
    title: "Save Warranty",
    description:
      "Store warranty information for future reminders.",
    icon: "🛡️",
  },

  attach_manual: {
    title: "Attach Manual",
    description:
      "Attach this owner's manual to the asset.",
    icon: "📘",
  },

  create_warranty_reminder: {
    title: "Warranty Reminder",
    description:
      "Create a reminder before the warranty expires.",
    icon: "⏰",
  },

  save_personal_record: {
    title: "Save Personal Record",
    description:
      "Store this important document securely.",
    icon: "🪪",
  },

  create_renewal_reminder: {
    title: "Renewal Reminder",
    description:
      "Create a reminder before this document expires.",
    icon: "📅",
  },

  mark_as_important: {
    title: "Mark as Important",
    description:
      "Pin this document for quick access.",
    icon: "⭐",
  },

  review_manually: {
    title: "Review Manually",
    description:
      "AI couldn't confidently determine the next step.",
    icon: "👀",
  },
} as const;

export type ActionId = keyof typeof ACTION_REGISTRY;