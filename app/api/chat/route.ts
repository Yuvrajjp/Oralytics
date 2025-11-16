import { NextResponse } from "next/server";

interface ChatRequestBody {
  prompt?: string;
  context?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatRequestBody | null;
  if (!body?.prompt || typeof body.prompt !== "string" || !body.prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const prompt = body.prompt.trim();
  const context = typeof body.context === "string" ? body.context.trim() : "";

  const replyLines = [
    context ? `Context digest: ${context}` : "Context digest: general dossier",
    `Actionable note: ${prompt} → prioritize orthogonal validation with qPCR and proteomics before scaling assays.`,
  ];

  const citations = [
    context ? `context:${context.slice(0, 60)}` : "context:general",
    `analysis:${new Date().toISOString()}`,
  ];

  return NextResponse.json({ reply: replyLines.join("\n"), citations });
}
