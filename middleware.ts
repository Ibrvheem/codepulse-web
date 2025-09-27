import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'access_token';

// Define protected routes (these require authentication)
const protectedRoutes = ['/dashboard'];
// Define auth routes (authenticated users should be redirected away from these)
const authRoutes = ['/signin', '/signup'];
// Define public routes (always accessible)
const publicRoutes = ['/', '/waitlist', '/about', '/privacy', '/terms'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    // Check if user is authenticated
    const isAuthenticated = !!accessToken && !isTokenExpired(accessToken);

    // Always allow public routes
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users trying to access protected routes
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/signin', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirect authenticated users away from auth routes
    if (authRoutes.some(route => pathname.startsWith(route))) {
        if (isAuthenticated) {
            const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
            const redirectUrl = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/dashboard';
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
    }

    return NextResponse.next();
}

function isTokenExpired(token: string): boolean {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return true;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const payload = JSON.parse(jsonPayload);

        // Check if token is expired (with 5 minute buffer for clock skew)
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp && currentTime >= (payload.exp - 300); // 5 minute buffer
    } catch {
        // If we can't decode the token, consider it expired
        return true;
    }
}// Configure which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
};