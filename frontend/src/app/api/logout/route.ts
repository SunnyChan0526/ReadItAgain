import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  /*const responseApi = await fetch('http://localhost:8000/sign-out');
  const resApiJson = responseApi.json();

  const response = NextResponse.json(resApiJson);
  response.cookies.delete('accessToken');
  return response;*/
  if (req.method === 'GET') {
    // 創建一個Response
    const response = NextResponse.json({ message: 'Logged out successfully' });

    // 删除accessToken cookie
    response.cookies.delete('accessToken');
    return response;
  } else {
    // 如果不是GET請求，返回405 Method Not Allowed
    return new Response(`Method ${req.method} Not Allowed`, { status: 405 });
  }
};