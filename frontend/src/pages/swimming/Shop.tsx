import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Star,
  Heart,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  CheckCircle,
  Plus,
  Minus
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stock: number;
  featured: boolean;
  discount?: number;
}

const Shop: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [showCart, setShowCart] = useState(false);

  const products: Product[] = [
    {
      id: '1',
      name: 'Professional Swimming Goggles',
      description: 'Anti-fog, UV protection, comfortable fit for competitive swimming',
      price: 45.99,
      originalPrice: 59.99,
      image: '/swiming.jpg',
      category: 'Equipment',
      rating: 4.8,
      reviews: 124,
      inStock: true,
      stock: 25,
      featured: true,
      discount: 23
    },
    {
      id: '2',
      name: 'Swimming Cap - Silicone',
      description: 'Durable silicone cap for long hair protection and reduced drag',
      price: 12.99,
      image: '/swiming.jpg',
      category: 'Accessories',
      rating: 4.6,
      reviews: 89,
      inStock: true,
      stock: 50,
      featured: false
    },
    {
      id: '3',
      name: 'Swimming Fins - Training',
      description: 'Professional training fins for improved leg strength and technique',
      price: 89.99,
      image: '/swiming.jpg',
      category: 'Equipment',
      rating: 4.9,
      reviews: 67,
      inStock: true,
      stock: 15,
      featured: true
    },
    {
      id: '4',
      name: 'Swimming Towel - Quick Dry',
      description: 'Lightweight, quick-drying microfiber towel perfect for swimming',
      price: 24.99,
      image: '/swiming.jpg',
      category: 'Accessories',
      rating: 4.5,
      reviews: 156,
      inStock: true,
      stock: 30,
      featured: false
    },
    {
      id: '5',
      name: 'Swimming Suit - Competition',
      description: 'High-performance competition swimsuit with advanced fabric technology',
      price: 129.99,
      image: '/swiming.jpg',
      category: 'Clothing',
      rating: 4.7,
      reviews: 43,
      inStock: true,
      stock: 12,
      featured: true
    },
    {
      id: '6',
      name: 'Swimming Board - Kickboard',
      description: 'Foam kickboard for leg training and swimming technique improvement',
      price: 18.99,
      image: '/swiming.jpg',
      category: 'Equipment',
      rating: 4.4,
      reviews: 78,
      inStock: true,
      stock: 40,
      featured: false
    },
    {
      id: '7',
      name: 'Swimming Ear Plugs',
      description: 'Waterproof ear plugs to prevent water from entering ears',
      price: 8.99,
      image: '/swiming.jpg',
      category: 'Accessories',
      rating: 4.3,
      reviews: 92,
      inStock: true,
      stock: 60,
      featured: false
    },
    {
      id: '8',
      name: 'Swimming Bag - Waterproof',
      description: 'Large waterproof bag for wet swim gear and equipment',
      price: 34.99,
      image: '/swiming.jpg',
      category: 'Accessories',
      rating: 4.6,
      reviews: 34,
      inStock: true,
      stock: 20,
      featured: false
    }
  ];

  const categories = ['all', 'Equipment', 'Accessories', 'Clothing', 'Training'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'name': return a.name.localeCompare(b.name);
      default: return b.featured ? 1 : -1;
    }
  });

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingBag className="w-8 h-8 mr-3 text-blue-600" />
                Swimming Shop
              </h1>
              <p className="text-gray-600 mt-2">
                Premium swimming equipment and accessories
              </p>
            </div>
            <Button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({getCartItemCount()})
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        {sortedProducts.filter(product => product.featured).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              Featured Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts
                .filter(product => product.featured)
                .map(product => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      {product.discount && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-red-500 text-white">
                            -{product.discount}%
                          </Badge>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Button size="sm" variant="outline" className="bg-white/80 hover:bg-white">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          ({product.reviews})
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {product.stock} in stock
                        </span>
                      </div>

                      <Button
                        onClick={() => addToCart(product.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map(product => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover"
                  />
                  {product.discount && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 text-white text-xs">
                        -{product.discount}%
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-xs text-gray-600 ml-1">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      onClick={() => addToCart(product.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={!product.inStock}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                    {cart[product.id] && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromCart(product.id)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* No Products Message */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowCart(false)}
                >
                  Close
                </Button>
              </div>

              {Object.keys(cart).length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(cart).map(([productId, quantity]) => {
                    const product = products.find(p => p.id === productId);
                    if (!product) return null;

                    return (
                      <div key={productId} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(productId)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(productId)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-lg font-bold">{formatPrice(getCartTotal())}</span>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
