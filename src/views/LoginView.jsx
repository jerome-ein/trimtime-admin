import React from 'react';
import Icon from '../components/Icon';
import { useLoginViewModel } from '../viewmodels/AuthViewModel';

const LoginView = () => {
  const { email, password, error, loading, setEmail, setPassword, submit } = useLoginViewModel();

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo"><Icon name="scissors" size={28}/></div>
          <h1>TrimTime</h1>
          <p>Admin Dashboard</p>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@trimtime.com" required/>
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required/>
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="login-note">Restricted to authorized administrators only</p>
      </div>
    </div>
  );
};

export default LoginView;