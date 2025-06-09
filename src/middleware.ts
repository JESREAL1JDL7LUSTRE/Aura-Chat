import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname === "/") {
      return NextResponse.next();
    }

    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/api/auth/signin", req.url));
    }

    // Check if user is trying to access notification page
    const notificationMatch = req.nextUrl.pathname.match(/^\/notification\/(.+)$/);
    if (notificationMatch) {
      const requestedUserId = notificationMatch[1];
      const currentUserId = req.nextauth.token.sub; // User ID from token
      
      // If trying to access someone else's notifications, redirect to their own
      if (requestedUserId !== currentUserId) {
        return NextResponse.redirect(new URL(`/notification/${currentUserId}`, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};