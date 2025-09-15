import { NextResponse } from 'next/server';
import { loadRfis } from '@/lib/loadRfis';

export async function GET() {
  try {
    const rows = loadRfis();
    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Error loading RFI data:', error);
    return NextResponse.json(
      { error: 'Failed to load RFI data' },
      { status: 500 }
    );
  }
}
