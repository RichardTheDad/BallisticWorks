import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Package, ShoppingBag, Users, Upload, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  customer_notes: string;
  admin_notes: string;
  created_at: string;
  display_name: string;
  roleplay_name: string;
  phone_number: string;
  bank_number: string;
  email: string;
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

const Admin: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    image: null as File | null
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get('/api/admin/check');
      setIsAdmin(response.data.isAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/admin/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('stock_quantity', productForm.stock_quantity);
      if (productForm.image) {
        formData.append('image', productForm.image);
      }

      await axios.post('/api/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Product added successfully!' });
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        stock_quantity: '',
        image: null
      });
      setShowAddProduct(false);
      fetchProducts();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add product' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string, adminNotes: string = '') => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, {
        status,
        admin_notes: adminNotes
      });
      setMessage({ type: 'success', text: 'Order status updated!' });
      fetchOrders();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update order status' 
      });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/admin/products/${productId}`);
        setMessage({ type: 'success', text: 'Product deleted successfully!' });
        fetchProducts();
      } catch (error: any) {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.error || 'Failed to delete product' 
        });
      }
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-vault-text">Checking permissions...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-vault-text mb-4">Access Denied</h1>
        <p className="text-vault-text-muted">You don't have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-vault-text">Admin Panel</h1>
        <div className="flex items-center space-x-2">
          <div className="bg-vault-red text-white px-3 py-1 rounded-full text-sm">
            Admin
          </div>
        </div>
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

      {/* Tabs */}
      <div className="flex space-x-1 bg-vault-card rounded-lg p-1">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
            activeTab === 'products' 
              ? 'bg-vault-red text-white' 
              : 'text-vault-text hover:bg-vault-border'
          }`}
        >
          <Package size={18} />
          <span>Products</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
            activeTab === 'orders' 
              ? 'bg-vault-red text-white' 
              : 'text-vault-text hover:bg-vault-border'
          }`}
        >
          <ShoppingBag size={18} />
          <span>Orders</span>
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-vault-text">Manage Products</h2>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-vault-red hover:bg-vault-red-hover text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          </div>

          {/* Add Product Form */}
          {showAddProduct && (
            <div className="bg-vault-card rounded-lg border border-vault-border p-6">
              <h3 className="text-lg font-semibold text-vault-text mb-4">Add New Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-2 text-vault-text focus:outline-none focus:border-vault-accent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-2 text-vault-text focus:outline-none focus:border-vault-accent"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-2 text-vault-text focus:outline-none focus:border-vault-accent"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-2 text-vault-text focus:outline-none focus:border-vault-accent"
                    required
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-2 text-vault-text focus:outline-none focus:border-vault-accent"
                  rows={3}
                />
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductForm({...productForm, image: e.target.files?.[0] || null})}
                    className="text-vault-text"
                  />
                  <Upload size={18} className="text-vault-text-muted" />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-vault-red hover:bg-vault-red-hover disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Adding...' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="bg-vault-card hover:bg-vault-border text-vault-text px-6 py-2 rounded-lg transition-colors border border-vault-border"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products List */}
          <div className="bg-vault-card rounded-lg border border-vault-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vault-border">
                    <th className="text-left p-4 text-vault-text">Product</th>
                    <th className="text-left p-4 text-vault-text">Category</th>
                    <th className="text-left p-4 text-vault-text">Price</th>
                    <th className="text-left p-4 text-vault-text">Stock</th>
                    <th className="text-left p-4 text-vault-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-vault-border">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-vault-bg rounded-lg overflow-hidden">
                            {product.image_url ? (
                              <img 
                                src={`${window.location.origin}${product.image_url}`} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-vault-border"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-vault-text font-medium">{product.name}</h4>
                            <p className="text-vault-text-muted text-sm">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-vault-text">{product.category}</td>
                      <td className="p-4 text-vault-accent font-semibold">${product.price.toFixed(2)}</td>
                      <td className="p-4 text-vault-text">{product.stock_quantity}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-vault-text hover:text-vault-red transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-vault-text">Manage Orders</h2>
          
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-vault-card rounded-lg border border-vault-border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-vault-text">Order #{order.id}</h3>
                    <p className="text-vault-text-muted">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="bg-vault-bg border border-vault-border rounded px-3 py-1 text-vault-text"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <span className={`px-2 py-1 rounded text-sm ${
                      order.status === 'completed' ? 'bg-green-900 text-green-100' :
                      order.status === 'processing' ? 'bg-yellow-900 text-yellow-100' :
                      order.status === 'cancelled' ? 'bg-red-900 text-red-100' :
                      'bg-vault-border text-vault-text'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-vault-text mb-2">Customer Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-vault-text-muted">Name:</span> <span className="text-vault-text">{order.roleplay_name || order.display_name}</span></p>
                      <p><span className="text-vault-text-muted">Phone:</span> <span className="text-vault-text">{order.phone_number}</span></p>
                      <p><span className="text-vault-text-muted">Bank:</span> <span className="text-vault-text">{order.bank_number}</span></p>
                      {order.email && <p><span className="text-vault-text-muted">Email:</span> <span className="text-vault-text">{order.email}</span></p>}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-vault-text mb-2">Order Items</h4>
                    <div className="space-y-1 text-sm">
                      {order.items.map(item => (
                        <p key={item.id} className="text-vault-text">
                          {item.product_name} x{item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      ))}
                      <p className="font-semibold text-vault-accent pt-2 border-t border-vault-border">
                        Total: ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {order.customer_notes && (
                  <div className="mt-4 p-3 bg-vault-bg rounded border border-vault-border">
                    <h5 className="font-semibold text-vault-text text-sm mb-1">Customer Notes:</h5>
                    <p className="text-vault-text-muted text-sm">{order.customer_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
