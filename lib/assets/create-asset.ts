import { createAsset } from "@/lib/assets/create-asset";

export async function POST(req: Request) {
  const body = await req.json();

  const asset = await createAsset(body);

  return NextResponse.json({
    success: true,
    asset,
  });
}