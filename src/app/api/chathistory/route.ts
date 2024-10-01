// app/api/chathistory/route.ts

import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
}

// In-memory chat history store
let chatHistory: ChatMessage[] = [];

export async function GET(request: NextRequest) {
  return NextResponse.json({ chatHistory });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, isUser } = body;

    if (!id || !content || typeof isUser !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const newMessage: ChatMessage = { id, content, isUser };
    chatHistory.push(newMessage);

    return NextResponse.json({ message: 'Message added', chatHistory });
  } catch (error) {
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}
