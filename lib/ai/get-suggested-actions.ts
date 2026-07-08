export function getSuggestedActions(
  documentCategory: string,
  documentType: string
): string[] {
  const category = documentCategory.toLowerCase();
  const type = documentType.toLowerCase().replaceAll(" ", "_");

  if (category === "asset") {
    switch (type) {
      case "receipt":
      case "invoice":
        return ["create_asset", "attach_receipt", "add_warranty"];

      case "owner_manual":
      case "owners_manual":
      case "manual":
        return ["attach_manual"];

      case "warranty":
        return ["attach_warranty", "create_warranty_reminder"];

      default:
        return ["review_manually"];
    }
  }

  if (category === "personal") {
    switch (type) {
      case "passport":
        return [
          "save_personal_record",
          "create_renewal_reminder",
          "mark_as_important",
        ];

      case "driver_license":
      case "drivers_license":
      case "driver's_license":
        return ["save_personal_record", "create_renewal_reminder"];

      default:
        return ["review_manually"];
    }
  }

  return ["review_manually"];
}