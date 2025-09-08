import React from 'react';
import { ShoppingCart, Eye, Star, AlertTriangle } from 'lucide-react';
import { formatPrice, calculateDiscountPercentage } from '../services/priceFormatter';

const ProductCard = ({ product, onAddToCart }) => {
  const stockOnHand = product.stock?.onHand || 0;
  const isLowStock = stockOnHand <= (product.stock?.thresholdAlert || 5) && stockOnHand > 0;
  const isOutOfStock = stockOnHand === 0;
  const isPrescriptionRequired = product.isPrescriptionRequired;

  // Construire l'URL de l'image
  const imageUrl = product.image && product.image !== '/uploads/products/default.png'
    ? `${import.meta.env.VITE_API_URL}${product.image}`
    // URL d'un placeholder si aucune image n'est disponible
    : `https://via.placeholder.com/400x400.png/f3f4f6/9ca3af?text=${encodeURIComponent(product.nom || product.name || 'Produit')}`;

  // Gestion du prix
  const finalPrice = product.discountedPrice ?? product.priceTTC ?? product.prix;
  const originalPrice = product.priceTTC ?? product.prix;
  const hasDiscount = product.hasActiveDiscount && finalPrice < originalPrice;

  return (
    <div className="card-hover group flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4">
        <img
          src={imageUrl}
          alt={product.name || 'Product image'}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/400x400.png/f3f4f6/9ca3af?text=${encodeURIComponent(product.nom || product.name || 'Produit')}`;
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {hasDiscount && (
            <div className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              PROMO
            </div>
          )}
          {isOutOfStock && (
            <div className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Rupture
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <div className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Stock Faible
            </div>
          )}
        </div>

        {isPrescriptionRequired && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full" title="Ordonnance requise">
            Rx
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
            <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <Eye className="h-5 w-5 text-gray-700" />
            </button>
            {!isOutOfStock && (
              <button
                onClick={onAddToCart}
                className="p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-2 flex-grow flex flex-col">
        <p className="text-sm text-gray-500 font-medium">{product.brand}</p>
        
        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 flex-grow">
          {product.nom || product.name}
        </h3>
        
        <p className="text-sm text-gray-600">
          {product.dosage} - {product.form}
        </p>

        <div className="flex items-center justify-between pt-2 mt-auto">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(finalPrice)}
            </span>
            {hasDiscount && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
                <span className="text-xs text-red-600 font-medium">
                  -{calculateDiscountPercentage(originalPrice, finalPrice)}
                </span>
              </div>
            )}
          </div>
          
          {!isOutOfStock ? (
            <button
              onClick={onAddToCart}
              className="bg-green-100 text-green-700 hover:bg-green-200 font-bold py-2 px-3 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-200 text-gray-500 px-3 py-2 rounded-lg font-medium cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
           {isOutOfStock ? (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Indisponible
              </div>
            ) : (
              <div className="flex items-center text-gray-600">
                <div className={`w-2 h-2 rounded-full mr-2 ${isLowStock ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                {stockOnHand} en stock
              </div>
            )}
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1">{product.statistics?.averageRating?.toFixed(1) || 'N/A'}</span>
            </div>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Réf: {product.sku}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;