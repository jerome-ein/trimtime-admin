import { useState, useEffect } from 'react';
import { adminLogin, adminLogout, listenAuthState } from '../models/UserModel';

export function useAuthViewModel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenAuthState(u => { setUser(u); setLoading(false); });
    return () => unsub();
  }, []);

  const logout = () => adminLogout();

  return { user, loading, logout };
}

export function useLoginViewModel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminLogin(email, password);
    } catch {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return { email, password, error, loading, setEmail, setPassword, submit };
}