interface AuthResponse {
  message: string;
  userId?: string;
  username?: string;
  token?: string;
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

  async login(email: string, password: string, retryCount = 0): Promise<AuthResponse> {
    try {
      console.log('Attempting login with:', { email, retryAttempt: retryCount });
      
      // Clear any existing auth data before attempting login
      if (retryCount === 0) {
        this.logout();
      }
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (response.status === 400) {
        const errorData = await response.json();
        console.error('Login failed with error:', errorData);
        
        // Check for specific database errors that might need retry
        const shouldRetry = errorData.message?.includes('prepared statement') || 
                          errorData.message?.includes('transaction is aborted') ||
                          errorData.message?.includes('JDBC exception');
        
        if (shouldRetry && retryCount < 3) {
          console.log(`Database error detected, retrying login attempt ${retryCount + 1}/3...`);
          // Wait longer between retries
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.login(email, password, retryCount + 1);
        }
        
        throw new Error(errorData.message || 'Invalid credentials');
      }
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      console.log('Login response:', { userId: data.userId, hasToken: !!data.token });
      
      if (data.token) {
        // Store auth data only on successful login
        localStorage.setItem('token', data.token);
        if (data.userId) {
          localStorage.setItem('userId', data.userId);
        }
        if (data.username) {
          localStorage.setItem('username', data.username);
        }
        return data;
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch' && retryCount < 3) {
        console.log(`Network error, retrying login attempt ${retryCount + 1}/3...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.login(email, password, retryCount + 1);
      }
      
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('stats');
    localStorage.removeItem('recommendation');
  },

  isTokenExpired(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found when checking expiration');
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const isExpired = Date.now() >= expirationTime;
      if (isExpired) {
        console.log('Token is expired:', { 
          exp: new Date(expirationTime).toISOString(),
          now: new Date().toISOString()
        });
      }
      return isExpired;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      console.log('Missing credentials:', { hasToken: !!token, hasUserId: !!userId });
      return false;
    }
    
    if (this.isTokenExpired()) {
      console.log('Token is expired during auth check');
      this.logout();
      return false;
    }
    
    return true;
  },

  getUserId(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    return localStorage.getItem('userId');
  },

  getUsername(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    return localStorage.getItem('username');
  },

  getToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    if (this.isTokenExpired()) {
      console.log('Token is expired when getting token, logging out');
      this.logout();
      return null;
    }
    return token;
  },

  getAuthHeaders(): Headers {
    const token = localStorage.getItem('token');
    const headers = new Headers();
    
    // Set basic headers
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    
    if (token) {
      // Always include token if it exists, let server handle expiration
      headers.append('Authorization', `Bearer ${token}`);
      console.log('Added token to headers:', token.substring(0, 20) + '...');
    } else {
      console.log('No token available for headers');
    }
    
    return headers;
  }
}; 