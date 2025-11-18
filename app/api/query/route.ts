import { NextResponse } from "next/server";

import { queryVectorStore } from "@/lib/queryVectorStore";

interface QueryRequestBody {
  query?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as QueryRequestBody | null;
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const results = await queryVectorStore(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Failed to query vector store", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
