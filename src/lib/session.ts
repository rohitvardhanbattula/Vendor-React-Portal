const SESSION_KEY = 'vendor_portal_session';

export interface Session {
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const sessionStorage = {
  get(): Session | null {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  set(session: Session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  clear() {
    localStorage.removeItem(SESSION_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.get()?.username;
  }
};
