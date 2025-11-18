import { NextResponse } from "next/server";
import { getSeededData } from "../../../lib/datasets";

export async function GET() {
  const data = await getSeededData();
  const response = NextResponse.json(data);
  
  // Add cache headers for better performance (5 minutes)
  response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  
  return response;
}
