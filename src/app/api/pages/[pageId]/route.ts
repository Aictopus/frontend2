// app/api/pages/[pageId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { componentStrings, componentStrings2, componentStrings3 } from '@/lib/test-string';

interface PageData {
  id: string;
  componentStrings: string[];
}

// Simulated page data
const pagesData: Record<string, PageData> = {
  page1: { id: 'page1', componentStrings: componentStrings },
  page2: { id: 'page2', componentStrings: componentStrings2 },
  page3: { id: 'page3', componentStrings: componentStrings3 },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  const { pageId } = params;

  const pageData = pagesData[pageId];

  if (pageData) {
    return NextResponse.json({ pageData });
  } else {
    return NextResponse.json({ message: 'Page data not found' }, { status: 404 });
  }
}
