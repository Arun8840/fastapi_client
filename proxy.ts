import { NextResponse, type NextRequest } from "next/server";


export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname, search } = request.nextUrl;

  if (token) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("redirect", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/",
};
