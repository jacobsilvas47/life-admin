export interface WorkflowContext {
  documentId: string;

  assetName?: string;
  assetId?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string | null;
  purchaseDate?: string;
  category?: string;

  recordType?: string;
  recordTitle?: string;
  issuingCountry?: string;
  issueDate?: string;
  expirationDate?: string;
  identifier?: string;
  personalRecordId?: string;
  warrantyMonths?: number | null;
  warrantyId?: string;

  suggestedActions: string[];
}