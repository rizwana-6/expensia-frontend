import '../auth.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthArt from '../components/AuthArt.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:9090/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError(await response.text());
        return;
      }

      const user = await response.json();

      if (!user || !user.id) {
        setError('Login succeeded, but the server did not return a valid user.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/';
    } catch {
      setError('Cannot connect to the backend. Is Spring Boot running?');
    }
  }

  return (
    <div className="auth-container">
      <AuthArt />

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleLogin}>
          <div className="auth-mobile-brand">
            expensia<span>.</span>
          </div>

          <div>
            <h1>Welcome back</h1>
            <p className="auth-subtitle">Log in to your Expensia account</p>
          </div>

          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-button" type="submit">
            Log In
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
