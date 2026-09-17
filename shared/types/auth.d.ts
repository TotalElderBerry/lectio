// Lives under shared/ because both generated tsconfigs include
// `shared/**/*.d.ts`, while only the app project picks up root-level .d.ts.
declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    displayName: string | null
  }

  interface UserSession {
    loggedInAt?: string
  }

  interface SecureSessionData {
    // Nothing secret beyond the identity itself.
  }
}

export {}
