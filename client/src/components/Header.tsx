import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogOut, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const cartCount = getCartCount();

  return (
    <header className="bg-vault-card border-b border-vault-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-vault-text hover:text-vault-accent transition-colors">
            <span className="text-vault-red">Ballistic</span>Works
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-vault-text hover:text-vault-accent transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-vault-text hover:text-vault-accent transition-colors">
              Market
            </Link>
            {isAuthenticated && (
              <Link to="/account" className="text-vault-text hover:text-vault-accent transition-colors">
                Account
              </Link>
            )}
            {user?.is_admin && (
              <Link to="/admin" className="text-vault-text hover:text-vault-accent transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link to="/shop" className="relative p-2 text-vault-text hover:text-vault-accent transition-colors">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-vault-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <img 
                    src={user?.avatar} 
                    alt={user?.display_name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-vault-text hidden md:block">
                    {user?.roleplay_name || user?.display_name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-vault-text hover:text-vault-red transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-vault-red hover:bg-vault-red-hover text-white px-4 py-2 rounded transition-colors"
              >
                <User size={18} />
                <span>Login with Steam</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex items-center space-x-4">
          <Link to="/" className="text-vault-text hover:text-vault-accent transition-colors">
            Home
          </Link>
          <Link to="/shop" className="text-vault-text hover:text-vault-accent transition-colors">
            Market
          </Link>
          {isAuthenticated && (
            <Link to="/account" className="text-vault-text hover:text-vault-accent transition-colors">
              Account
            </Link>
          )}
          {user?.is_admin && (
            <Link to="/admin" className="text-vault-text hover:text-vault-accent transition-colors">
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
