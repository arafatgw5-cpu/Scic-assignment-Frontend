import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cookies: Record<string, string> = {};
  req.cookies.getAll().forEach(c => cookies[c.name] = c.value);

  // Read the session token from the HttpOnly cookie
  const token = req.cookies.get('__Secure-better-auth.session_token')?.value || 
                req.cookies.get('better-auth.session_token')?.value;

  return NextResponse.json({ token: token || null, allCookies: cookies });
}
