import { API_URL } from '../config';

import '../auth.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthArt from '../components/AuthArt.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError('');

    try {
         const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        setError(await response.text());
        return;
      }

      navigate('/login');
    } catch {
      setError('Cannot connect to the backend. Is Spring Boot running?');
    }
  }

  return (
    <div className="auth-container">
      <AuthArt />

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleRegister}>
          <div className="auth-mobile-brand">
            expensia<span>.</span>
          </div>

          <div>
            <h1>Create your account</h1>
            <p className="auth-subtitle">
              Start managing your expenses with Expensia
            </p>
          </div>

          <div className="auth-field">
            <label htmlFor="register-name">Name</label>
            <input
              id="register-name"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-button" type="submit">
            Create Account
          </button>

          <p className="auth-switch">
            Already registered? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
