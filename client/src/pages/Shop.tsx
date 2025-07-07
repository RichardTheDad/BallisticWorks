import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Clock, TrendingUp } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
}

interface RecentPurchase {
  id: number;
  product_name: string;
  buyer_name: string;
  purchase_time: string;
}

const Shop: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { cartItems, addToCart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchRecentPurchases();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/shop/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentPurchases = async () => {
    try {
      const response = await axios.get('/api/shop/recent-purchases');
      setRecentPurchases(response.data);
    } catch (error) {
      console.error('Error fetching recent purchases:', error);
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'Please login to add items to cart' });
      return;
    }

    try {
      await addToCart(productId, 1);
      setMessage({ type: 'success', text: 'Item added to cart!' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add item to cart' 
      });
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'Please login to checkout' });
      return;
    }

    setIsCheckingOut(true);
    try {
      await axios.post('/api/shop/order', {
        customer_notes: customerNotes
      });
      setMessage({ type: 'success', text: 'Order placed successfully! Check your email for confirmation.' });
      setCustomerNotes('');
      // Refresh recent purchases
      fetchRecentPurchases();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to place order' 
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-vault-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-vault-text">
          <span className="text-vault-red">Ballistic</span>Works Market
        </h1>
        {isAuthenticated && (
          <div className="flex items-center space-x-2 text-vault-text">
            <ShoppingCart size={20} />
            <span>Cart ({getCartCount()})</span>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900 text-green-100 border border-green-700' 
            : 'bg-red-900 text-red-100 border border-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Shop Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products Grid */}
          <div className="bg-vault-card rounded-lg border border-vault-border p-6">
            <h2 className="text-xl font-semibold text-vault-text mb-4">Browse Items</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-vault-bg rounded-lg border border-vault-border p-4">
                  <div className="aspect-square bg-vault-card rounded-lg mb-3 overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={`${window.location.origin}${product.image_url}`} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-vault-text-muted">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="text-vault-text font-semibold mb-1">{product.name}</h3>
                  <p className="text-vault-text-muted text-sm mb-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-vault-accent font-bold text-lg">${product.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={!isAuthenticated}
                      className="bg-vault-red hover:bg-vault-red-hover disabled:opacity-50 text-white px-4 py-2 rounded transition-colors flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="bg-vault-card rounded-lg border border-vault-border p-6">
            <h2 className="text-xl font-semibold text-vault-text mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Purchases
            </h2>
            <div className="space-y-2">
              {recentPurchases.map(purchase => (
                <div key={purchase.id} className="flex items-center justify-between py-2 border-b border-vault-border last:border-b-0">
                  <div>
                    <span className="text-vault-text font-medium">{purchase.product_name}</span>
                    <div className="text-vault-text-muted text-sm">
                      by {purchase.buyer_name}
                    </div>
                  </div>
                  <span className="text-vault-text-muted text-sm">
                    {formatTime(purchase.purchase_time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cart */}
          {isAuthenticated && (
            <div className="bg-vault-card rounded-lg border border-vault-border p-6">
              <h2 className="text-xl font-semibold text-vault-text mb-4">Your Basket</h2>
              {cartItems.length === 0 ? (
                <p className="text-vault-text-muted">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-vault-text font-medium">{item.name}</h4>
                        <p className="text-vault-text-muted text-sm">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1 text-vault-text hover:text-vault-red transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-vault-text px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 text-vault-text hover:text-vault-accent transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="p-1 text-vault-text hover:text-vault-red transition-colors ml-2"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-vault-border pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-vault-text font-semibold">Total:</span>
                      <span className="text-vault-accent font-bold text-lg">${getCartTotal().toFixed(2)}</span>
                    </div>
                    
                    <textarea
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Special instructions (optional)"
                      className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-vault-text text-sm mb-4 focus:outline-none focus:border-vault-accent"
                      rows={3}
                    />
                    
                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full bg-vault-red hover:bg-vault-red-hover disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      <CreditCard size={18} />
                      <span>{isCheckingOut ? 'Processing...' : 'Checkout'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top Sellers */}
          <div className="bg-vault-card rounded-lg border border-vault-border p-6">
            <h2 className="text-xl font-semibold text-vault-text mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Top Sellers
            </h2>
            <div className="space-y-3">
              {products.slice(0, 3).map(product => (
                <div key={product.id} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-vault-bg rounded-lg flex items-center justify-center">
                    {product.image_url ? (
                      <img 
                        src={`${window.location.origin}${product.image_url}`} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-vault-text-muted text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-vault-text font-medium text-sm">{product.name}</h4>
                    <p className="text-vault-accent text-sm">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
