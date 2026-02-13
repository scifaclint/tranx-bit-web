import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Skip subdomain logic in development (localhost)
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    // If localhost, just handle root redirect and skip subdomain logic
    if (isLocalhost) {
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/home', request.url));
        }
        return NextResponse.next();
    }

    // Determine if we're on the app subdomain
    const isAppSubdomain = hostname.startsWith('app.');

    // Public pages that should be on main domain (tranxbit.com)
    const publicPages = [
        '/home',
        '/privacy-policy',
        '/terms-of-service',
        '/about',
        '/auth',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/create-password',
        '/delete-account',
    ];

    // App pages that should be on app subdomain (app.tranxbit.com)
    const appPages = [
        '/dashboard',
        '/buy-giftcards',
        '/sell-giftcards',
        '/orders',
        '/transactions',
        '/settings',
        '/profile',
        '/payment',
    ];

    // Check if current path matches any public or app page pattern
    const isPublicPage = publicPages.some(page => pathname.startsWith(page));
    const isAppPage = appPages.some(page => pathname.startsWith(page));

    // Redirect root path to /home on main domain
    if (pathname === '/') {
        if (isAppSubdomain) {
            // If on app subdomain, redirect to main domain home
            const url = new URL('/home', request.url);
            url.hostname = hostname.replace('app.', '');
            return NextResponse.redirect(url);
        } else {
            // If on main domain, redirect to /home
            return NextResponse.redirect(new URL('/home', request.url));
        }
    }

    // If we're on app subdomain but accessing a public page, redirect to main domain
    if (isAppSubdomain && isPublicPage) {
        const url = new URL(pathname, request.url);
        url.hostname = hostname.replace('app.', '');
        return NextResponse.redirect(url);
    }

    // If we're on main domain but accessing an app page, redirect to app subdomain
    if (!isAppSubdomain && isAppPage) {
        const url = new URL(pathname, request.url);
        url.hostname = `app.${hostname}`;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
