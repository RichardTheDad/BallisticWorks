import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-vault-bg">
      <div className="bg-vault-card p-8 rounded-lg border border-vault-border max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-vault-text mb-2">
            <span className="text-vault-red">Ballistic</span>Works
          </h1>
          <p className="text-vault-text-muted mb-8">
            Access the premium DarkRP marketplace
          </p>
          
          <button
            onClick={login}
            className="w-full bg-vault-red hover:bg-vault-red-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <span>Login with Steam</span>
          </button>
          
          <p className="text-vault-text-muted text-sm mt-4">
            Secure authentication through Steam
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
