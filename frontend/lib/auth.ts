export type AuthUser = {
  id?: string | number;
  username: string;
  email?: string;
  country?: string;
  kycCompleted?: boolean;
  kyc_completed?: boolean;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

const TOKEN_KEY = "finsight_jwt_token";
const USER_KEY = "finsight_user";
const CURRENT_USER_KEY = "finsight_current_user";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(CURRENT_USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  const formattedUser = {
    ...user,
    kycCompleted: user.kycCompleted ?? user.kyc_completed ?? false,
  };
  window.localStorage.setItem(USER_KEY, JSON.stringify(formattedUser));
  if (user.username) {
    window.localStorage.setItem(CURRENT_USER_KEY, user.username);
  }
}

// Generate mock JWT for offline fallback when local backend API is unreachable
function createMockJwt(username: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    })
  );
  const signature = btoa("finsight_mock_signature");
  return `${header}.${payload}.${signature}`;
}

function formatErrorMessage(detail: unknown, defaultMsg: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e: { msg?: string; message?: string }) => e.msg || e.message || JSON.stringify(e))
      .join(", ");
  }
  if (detail && typeof detail === "object" && "message" in detail && typeof (detail as { message: unknown }).message === "string") {
    return (detail as { message: string }).message;
  }
  return defaultMsg;
}

export async function registerUser(data: {
  email: string;
  username: string;
  password: string;
  country?: string;
}): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Registration failed" }));
      const msg = formatErrorMessage(errorData.detail, "Registration failed");
      throw new Error(msg);
    }

    const authResult: AuthResponse = await res.json();
    setToken(authResult.access_token);
    setStoredUser(authResult.user);
    return authResult;
  } catch (err: unknown) {
    // Re-throw explicit HTTP API responses (e.g. 400 User already exists or 422 Validation error)
    if (err instanceof Error && err.name !== "TypeError" && !err.message.includes("fetch")) {
      throw err;
    }
    // Offline / local storage fallback check ONLY on network fetch failure
    if (err instanceof TypeError || (err instanceof Error && (err.name === "TypeError" || err.message.includes("fetch")))) {
      const mockToken = createMockJwt(data.username);
      const mockUser: AuthUser = {
        id: 1,
        username: data.username,
        email: data.email,
        country: data.country,
        kycCompleted: false,
        kyc_completed: false,
      };
      setToken(mockToken);
      setStoredUser(mockUser);
      return { access_token: mockToken, token_type: "bearer", user: mockUser };
    }
    throw err;
  }
}

export async function loginUser(data: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Invalid username or password" }));
      const msg = formatErrorMessage(errorData.detail, "Invalid username or password");
      throw new Error(msg);
    }

    const authResult: AuthResponse = await res.json();
    setToken(authResult.access_token);
    setStoredUser(authResult.user);
    return authResult;
  } catch (err: unknown) {
    // Re-throw explicit HTTP API responses (e.g. 401 Invalid username or password)
    if (err instanceof Error && err.name !== "TypeError" && !err.message.includes("fetch")) {
      throw err;
    }
    // Offline / local storage fallback check ONLY on network fetch failure
    const storedUser = getStoredUser();
    if (storedUser && storedUser.username === data.username) {
      const mockToken = createMockJwt(data.username);
      setToken(mockToken);
      return { access_token: mockToken, token_type: "bearer", user: storedUser };
    }
    throw new Error("Invalid username or password");
  }
}

export async function updateKycStatus(kycCompleted = true): Promise<AuthUser> {
  const token = getToken();
  const currentUser = getStoredUser();

  if (token && !token.includes("finsight_mock")) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me/kyc`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kyc_completed: kycCompleted }),
      });

      if (res.ok) {
        const updatedUser: AuthUser = await res.json();
        setStoredUser(updatedUser);
        return updatedUser;
      }
    } catch {
      // Fall through to local state update if network fails
    }
  }

  const updatedUser: AuthUser = {
    ...(currentUser || { username: "finsight_user" }),
    kycCompleted,
    kyc_completed: kycCompleted,
  };
  setStoredUser(updatedUser);
  return updatedUser;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;

  if (!token.includes("finsight_mock")) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user: AuthUser = await res.json();
        setStoredUser(user);
        return user;
      }
    } catch {
      // Fall through to stored user
    }
  }

  return getStoredUser();
}
