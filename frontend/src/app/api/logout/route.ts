import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const responseApi = await fetch('http://localhost:8000/sign-out');
  const resApiJson = responseApi.json();

  const response = NextResponse.json(resApiJson);
  response.cookies.delete('accessToken');
  return response;
};