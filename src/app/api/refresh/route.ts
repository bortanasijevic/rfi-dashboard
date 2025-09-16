import { NextResponse } from "next/server";

export async function POST(): Promise<Response> {
  // For Vercel deployment, the refresh functionality is disabled
  // Data updates happen via scheduled local script
  return NextResponse.json(
    { 
      ok: false, 
      error: "Refresh functionality not available in demo version. Data updates automatically every hour." 
    },
    { status: 501 }
  );
}
