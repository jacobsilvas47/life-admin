export interface ExtractedDocument {
  documentType: string;
  assetName: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  store: string;
  price: number | null;
  warrantyMonths: number | null;
  category: string;
  confidence: number;
  documentCategory: string;
  recordType?: string;
  recordTitle?: string;
  issuingCountry?: string;
  issueDate?: string;
  expirationDate?: string;
  identifier?: string;
  suggestedActions: string[];
}