import { NextResponse } from "next/server";
import { getSeededData } from "../../../lib/datasets";

export async function GET() {
  const data = await getSeededData();
  return NextResponse.json(data);
}
