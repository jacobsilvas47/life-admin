import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processDocument(
  signedUrl: string,
  fileType: string
) {
  const isImage = fileType.startsWith("image/");

  const content = [
    {
      type: "input_text" as const,
      text: `
Analyze this household document.

Return ONLY valid JSON.

{
  "documentType": "",
  "assetName": "",
  "manufacturer": "",
  "model": "",
  "serialNumber": "",
  "purchaseDate": "",
  "store": "",
  "price": null,
  "warrantyMonths": null,
  "category": "",
  "confidence": 0
}
`,
    },

    isImage
      ? {
          type: "input_image" as const,
          image_url: signedUrl,
          detail: "auto" as const,
        }
      : {
          type: "input_file" as const,
          file_url: signedUrl,
        },
  ];

  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: [
      {
        role: "user",
        content,
      },
    ],
  });

  return JSON.parse(response.output_text);
}