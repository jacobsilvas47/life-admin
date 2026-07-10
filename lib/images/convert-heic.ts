import convert from "heic-convert";

export async function convertHeicToJpeg(
  input: Buffer
): Promise<Buffer> {
  const output = await convert({
    buffer: input,
    format: "JPEG",
    quality: 0.9,
  });

  return Buffer.from(output);
}