import { NextResponse } from "next/server";

interface ChatRequestBody {
  prompt?: string;
  context?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ChatRequestBody;
  if (!body.prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const contextSnippet = body.context ? `Context: ${body.context}` : "Lab console";
  const reply = `${contextSnippet}\nInsight: ${body.prompt} → prioritize validation with targeted qPCR before scaling.`;

  return NextResponse.json({ reply });
}
