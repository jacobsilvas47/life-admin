const suggestionRules: Record<string, Record<string, string[]>> = {
  asset: {
    receipt: [
      "create_asset",
      "attach_receipt",
      "add_warranty",
    ],

    invoice: [
      "create_asset",
      "attach_receipt",
      "add_warranty",
    ],

    owner_manual: ["attach_manual"],
    owners_manual: ["attach_manual"],
    manual: ["attach_manual"],

    warranty: [
      "create_asset",
      "attach_warranty",
      "create_warranty_reminder",
    ],
  },

  personal: {
    passport: [
      "create_personal_record",
      "create_renewal_reminder",
      "mark_as_important",
    ],

    drivers_license: [
      "create_personal_record",
      "create_renewal_reminder",
    ],

    driver_license: [
      "create_personal_record",
      "create_renewal_reminder",
    ],

    birth_certificate: [
      "create_personal_record",
      "mark_as_important",
    ],

    marriage_certificate: [
      "create_personal_record",
      "mark_as_important",
    ],

    insurance_card: ["create_personal_record"],

    vehicle_registration: [
      "create_personal_record",
      "create_renewal_reminder",
    ],

    professional_license: [
      "create_personal_record",
      "create_renewal_reminder",
    ],
  },
};

export function getSuggestedActions(
  documentCategory: string,
  documentType: string
): string[] {
  const category = documentCategory
    .toLowerCase()
    .trim()
    .replaceAll(" ", "_");

const type = documentType
  .toLowerCase()
  .trim()
  .replaceAll(" ", "_")
  .replaceAll("-", "_")
  .replaceAll("'", "");

  return suggestionRules[category]?.[type] ?? ["review_manually"];
}