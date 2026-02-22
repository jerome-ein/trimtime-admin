import React from 'react';
import './App.css';
import { useAuthViewModel } from './viewmodels/AuthViewModel';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import Icon from './components/Icon';

export default function App() {
  const { user, loading, logout } = useAuthViewModel();

  if (loading) return (
    <div className="splash">
      <Icon name="scissors" size={36}/>
      <div className="splash-spin"/>
    </div>
  );

  if (!user) return <LoginView/>;

  return <DashboardView onLogout={logout}/>;
}