interface AuthResponse {
  message: string;
  userId?: string;
  username?: string;
}

export const authService = {
  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    return response.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    if (data.userId) {
      localStorage.setItem('userId', data.userId);
      if (data.username) {
        localStorage.setItem('username', data.username);
      }
    }
    return data;
  },

  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  },

  isAuthenticated(): boolean {
    return localStorage.getItem('userId') !== null;
  },

  getUserId(): string | null {
    return localStorage.getItem('userId');
  },

  getUsername(): string | null {
    return localStorage.getItem('username');
  }
}; 