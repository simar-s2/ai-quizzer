export const MOCK_USER_ID = "mock-user-00000000-0000-0000-0000-000000000001";
export const MOCK_USER_EMAIL = "testuser@mock.local";

export function isMockMode(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
}

export function getMockUser() {
  return {
    id: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
    aud: "authenticated",
    role: "authenticated",
    email_confirmed_at: new Date().toISOString(),
    phone: undefined,
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: "mock", providers: ["mock"] },
    user_metadata: { full_name: "Test User", avatar_url: null },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
  };
}

export function getMockSession() {
  const user = getMockUser();
  return {
    access_token: "mock-access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "mock-refresh-token",
    user,
  };
}
