import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = new TextEncoder().encode(
  'bd1466ba28694ad64e1d41b271df142398c3a6103966753c6e8c8b078a687753',
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 對登入/註冊頁面進行特殊處理
  if (pathname.startsWith('/Login-Signup')) {
    const accessToken = request.cookies.get('accessToken');
    if (accessToken) {
      try {
        // 如果有token且有效，重定向到根路由
        await jwtVerify(accessToken.value, jwtSecret);
        return NextResponse.redirect(new URL('/', request.url));
      } catch (error) {
        // Token驗證失敗，繼續進入登入/註冊頁面
        return NextResponse.next();
      }
    }
    // 沒有token，繼續進入登入/註冊頁面
    return NextResponse.next();
  }

  // 對根路由以外的其他頁面進行檢查
  if (pathname !== '/') {
    const accessToken = request.cookies.get('accessToken');
    if (!accessToken) {
      // 如果沒有accessToken，重定向到登入/註冊頁面
      return NextResponse.redirect(new URL('/Login-Signup', request.url));
    }

    try {
      // 驗證token
      await jwtVerify(accessToken.value, jwtSecret);
      // Token有效，進入下一步
      return NextResponse.next();
    } catch (error) {
      // Token驗證失敗，重定向到登入/註冊頁面
      return NextResponse.redirect(new URL('/Login-Signup', request.url));
    }
  }

  // 對根路由直接進入下一步
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/Login-Signup/:path*'],
};
