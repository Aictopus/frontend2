// app/api/functionlists/[pageId]/route.ts

import { NextRequest, NextResponse } from 'next/server';

// 示例数据
const functionLists = {
  page1: [
    { id: 'func1', content: 'Function content 1 for page 1' },
    { id: 'func2', content: 'Function content 2 for page 1' },
  ],
  page2: [
    { id: 'func3', content: 'Function content 1 for page 2' },
    { id: 'func4', content: 'Function content 2 for page 2' },
  ],
  page3: [
    { id: 'func5', content: 'Function content 1 for page 3' },
    { id: 'func6', content: 'Function content 2 for page 3' },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  const { pageId } = params;

  const functionList = functionLists[pageId];

  if (functionList) {
    return NextResponse.json({ functionList });
  } else {
    return NextResponse.json(
      { message: 'Function list not found' },
      { status: 404 }
    );
  }
}
