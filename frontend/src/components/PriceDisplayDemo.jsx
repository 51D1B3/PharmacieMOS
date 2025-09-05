import React from 'react';
import { formatPrice, formatPriceWithDiscount, calculateDiscountPercentage } from '../services/priceFormatter';
import { Package, Tag, TrendingDown } from 'lucide-react';

const PriceDisplayDemo = () => {
  // Exemples de produits avec prix en GNF
  const sampleProducts = [
    {
      id: 1,
      name: "Paracétamol 500mg",
      brand: "Doliprane",
      originalPrice: 15000,
      discountedPrice: 12000,
      hasDiscount: true
    },
    {
      id: 2,
      name: "Amoxicilline 250mg",
      brand: "Clamoxyl",
      originalPrice: 45000,
      discountedPrice: null,
      hasDiscount: false
    },
    {
      id: 3,
      name: "Vitamine C 1000mg",
      brand: "Laroscorbine",
      originalPrice: 25000,
      discountedPrice: 18750,
      hasDiscount: true
    },
    {
      id: 4,
      name: "Sirop contre la toux",
      brand: "Toplexil",
      originalPrice: 32000,
      discountedPrice: null,
      hasDiscount: false
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Package className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Affichage des Prix en GNF</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleProducts.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.brand}</p>
              </div>
              {product.hasDiscount && (
                <div className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center space-x-1">
                  <TrendingDown className="h-3 w-3" />
                  <span>PROMO</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {product.hasDiscount ? (
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(product.discountedPrice)}
                    </span>
                    <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded font-medium">
                      -{calculateDiscountPercentage(product.originalPrice, product.discountedPrice)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    Prix normal: {formatPrice(product.originalPrice)}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Économie: {formatPrice(product.originalPrice - product.discountedPrice)}
                  </div>
                </div>
              ) : (
                <div className="text-lg font-bold text-primary-600">
                  {formatPrice(product.originalPrice)}
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Prix affiché TTC</span>
                <div className="flex items-center space-x-1">
                  <Tag className="h-3 w-3" />
                  <span>Franc Guinéen (GNF)</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Informations sur l'affichage des prix</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tous les prix sont affichés en Francs Guinéens (GNF)</li>
          <li>• Les prix incluent les séparateurs de milliers pour une meilleure lisibilité</li>
          <li>• Les remises sont calculées automatiquement avec le pourcentage d'économie</li>
          <li>• Le formatage est cohérent dans toute l'application</li>
        </ul>
      </div>
    </div>
  );
};

export default PriceDisplayDemo;