import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Users, Shield, Zap } from 'lucide-react';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-vault-text mb-4">
          <span className="text-vault-red">Ballistic</span>Works Market
        </h1>
        <p className="text-xl text-vault-text-muted mb-8 max-w-2xl mx-auto">
          The premier DarkRP marketplace for high-quality items and services. 
          Secure, fast, and trusted by the community.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/shop"
            className="bg-vault-red hover:bg-vault-red-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <ShoppingCart size={20} />
            <span>Browse Market</span>
          </Link>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="bg-vault-card hover:bg-vault-border text-vault-text px-8 py-3 rounded-lg font-semibold transition-colors border border-vault-border"
            >
              Login with Steam
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-vault-card p-6 rounded-lg border border-vault-border">
          <Shield className="w-12 h-12 text-vault-red mb-4" />
          <h3 className="text-xl font-semibold text-vault-text mb-2">Secure Transactions</h3>
          <p className="text-vault-text-muted">
            All transactions are secure and verified through Steam authentication.
          </p>
        </div>
        <div className="bg-vault-card p-6 rounded-lg border border-vault-border">
          <Zap className="w-12 h-12 text-vault-accent mb-4" />
          <h3 className="text-xl font-semibold text-vault-text mb-2">Fast Delivery</h3>
          <p className="text-vault-text-muted">
            Quick in-game delivery with real-time notifications and tracking.
          </p>
        </div>
        <div className="bg-vault-card p-6 rounded-lg border border-vault-border">
          <Users className="w-12 h-12 text-vault-accent mb-4" />
          <h3 className="text-xl font-semibold text-vault-text mb-2">Community Trusted</h3>
          <p className="text-vault-text-muted">
            Built by the community, for the community. Trusted by thousands of players.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-vault-card p-8 rounded-lg border border-vault-border">
        <h2 className="text-2xl font-bold text-vault-text mb-6 text-center">Market Statistics</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-vault-red mb-2">1,247</div>
            <div className="text-vault-text-muted">Items Sold</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-vault-accent mb-2">892</div>
            <div className="text-vault-text-muted">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-vault-red mb-2">$45,231</div>
            <div className="text-vault-text-muted">Total Volume</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold text-vault-text mb-4">
          Ready to Start Trading?
        </h2>
        <p className="text-vault-text-muted mb-8 max-w-xl mx-auto">
          Join the most trusted DarkRP marketplace and start buying and selling premium items today.
        </p>
        <Link
          to={isAuthenticated ? "/shop" : "/login"}
          className="bg-vault-red hover:bg-vault-red-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
        >
          <span>{isAuthenticated ? "Browse Market" : "Get Started"}</span>
        </Link>
      </section>
    </div>
  );
};

export default Home;
