import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/onboarding",
  "/sign-in(.*)", 
  "/sign-up(.*)",
  "/api(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // 1. If signed in but not onboarded, redirect to /onboarding
  if (userId) {
    const onboardingComplete = (sessionClaims?.metadata as { onboardingComplete?: boolean })?.onboardingComplete;
    
    if (!onboardingComplete && !req.nextUrl.pathname.startsWith("/onboarding") && !req.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  // 2. Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
