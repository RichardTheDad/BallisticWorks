import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { User, Phone, CreditCard, Mail, Save } from 'lucide-react';

const Account: React.FC = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    roleplay_name: '',
    phone_number: '',
    bank_number: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        roleplay_name: user.roleplay_name || '',
        phone_number: user.phone_number || '',
        bank_number: user.bank_number || '',
        email: user.email || ''
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await axios.put('/api/user/profile', formData);
      updateUser(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-vault-card rounded-lg border border-vault-border p-6">
        <div className="flex items-center space-x-4 mb-6">
          <img 
            src={user?.avatar} 
            alt={user?.display_name}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold text-vault-text">Account Profile</h1>
            <p className="text-vault-text-muted">{user?.display_name}</p>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-900 text-green-100 border border-green-700' 
              : 'bg-red-900 text-red-100 border border-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-vault-text font-semibold mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Roleplay Name *
            </label>
            <input
              type="text"
              name="roleplay_name"
              value={formData.roleplay_name}
              onChange={handleChange}
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-2 text-vault-text focus:outline-none focus:border-vault-accent"
              placeholder="Enter your in-game character name"
              required
            />
            <p className="text-vault-text-muted text-sm mt-1">
              This is your character name in the game
            </p>
          </div>

          <div>
            <label className="block text-vault-text font-semibold mb-2">
              <Phone className="inline w-4 h-4 mr-2" />
              Phone Number *
            </label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-2 text-vault-text focus:outline-none focus:border-vault-accent"
              placeholder="Enter your in-game phone number"
              required
            />
            <p className="text-vault-text-muted text-sm mt-1">
              Your in-game phone number for contact
            </p>
          </div>

          <div>
            <label className="block text-vault-text font-semibold mb-2">
              <CreditCard className="inline w-4 h-4 mr-2" />
              Bank Account Number *
            </label>
            <input
              type="text"
              name="bank_number"
              value={formData.bank_number}
              onChange={handleChange}
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-2 text-vault-text focus:outline-none focus:border-vault-accent"
              placeholder="Enter your in-game bank account number"
              required
            />
            <p className="text-vault-text-muted text-sm mt-1">
              Your in-game bank account for transactions
            </p>
          </div>

          <div>
            <label className="block text-vault-text font-semibold mb-2">
              <Mail className="inline w-4 h-4 mr-2" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-2 text-vault-text focus:outline-none focus:border-vault-accent"
              placeholder="Enter your email address (optional)"
            />
            <p className="text-vault-text-muted text-sm mt-1">
              Optional: For order notifications
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-vault-red hover:bg-vault-red-hover disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{isLoading ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </form>

        <div className="mt-8 p-4 bg-vault-bg rounded-lg border border-vault-border">
          <h3 className="text-vault-text font-semibold mb-2">Steam Profile</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-vault-text-muted">Steam ID:</span>
              <span className="text-vault-text font-mono">{user?.steam_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-vault-text-muted">Display Name:</span>
              <span className="text-vault-text">{user?.display_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-vault-text-muted">Profile URL:</span>
              <a 
                href={user?.profile_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-vault-accent hover:underline"
              >
                View Steam Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
