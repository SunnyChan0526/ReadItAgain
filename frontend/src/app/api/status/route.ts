import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server"; 
export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('accessToken');
  const LoggedIn = !!token;
  const response = NextResponse.json({ isLoggedIn:LoggedIn },{status: 200});
  return response;
}