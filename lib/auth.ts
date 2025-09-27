import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token?: string;
}

/**
 * Get the current user's access token from cookies
 */
export async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
}

/**
 * Get the current user's refresh token from cookies
 */
export async function getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

/**
 * Set authentication tokens in cookies
 */
export async function setAuthTokens(tokens: AuthTokens) {
    const cookieStore = await cookies();

    // Set access token (expires in 1 hour)
    cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1 hour
        path: "/",
    });

    // Set refresh token if provided (expires in 7 days)
    if (tokens.refresh_token) {
        cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });
    }
}

/**
 * Clear authentication tokens from cookies
 */
export async function clearAuthTokens() {
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_TOKEN_COOKIE);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

/**
 * Decode JWT token to get user information
 */
export function decodeToken(token: string): User | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const payload = JSON.parse(jsonPayload);

        // Check if token is expired
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            return null;
        }

        return {
            id: payload.userId || payload.sub,
            email: payload.email,
            name: payload.name,
        };
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

/**
 * Get the current authenticated user (server-side only)
 * Use this in server components to get user info
 */
export async function getCurrentUser(): Promise<User | null> {
    const token = await getAccessToken();
    if (!token) return null;

    return decodeToken(token);
}

/**
 * Logout user by clearing tokens and redirecting to signin
 */
export async function logout() {
    await clearAuthTokens();
    redirect("/signin");
}