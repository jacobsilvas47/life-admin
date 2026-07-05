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
}