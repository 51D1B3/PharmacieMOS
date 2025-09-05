import React, { useState } from 'react';
import { 
  Plus, DollarSign, Upload, Package, ShoppingCart, Users,
  FileText, Calendar, Settings, Zap, TrendingUp, Activity
} from 'lucide-react';
import NewProductModal from './NewProductModal';

const AdminQuickActions = () => {
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showPOSModal, setShowPOSModal] = useState(false);

  const quickActions = [
    {
      id: 'add-product',
      title: 'Ajouter un produit',
      description: 'Ajouter un nouveau produit au catalogue',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => setShowNewProductModal(true)
    },
    {
      id: 'pos-sale',
      title: 'Encaissement POS',
      description: 'Effectuer une vente au point de vente',
      icon: DollarSign,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => setShowPOSModal(true)
    },
    {
      id: 'import-catalog',
      title: 'Import catalogue',
      description: 'Importer des produits via fichier Excel/CSV',
      icon: Upload,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => console.log('Import catalog')
    },
    {
      id: 'stock-check',
      title: 'Vérification stock',
      description: 'Lancer une vérification complète du stock',
      icon: Package,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => console.log('Stock check')
    },
    {
      id: 'new-order',
      title: 'Nouvelle commande',
      description: 'Créer une commande fournisseur',
      icon: ShoppingCart,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      action: () => console.log('New order')
    },
    {
      id: 'add-client',
      title: 'Nouveau client',
      description: 'Enregistrer un nouveau client',
      icon: Users,
      color: 'bg-teal-500 hover:bg-teal-600',
      action: () => console.log('Add client')
    },
    {
      id: 'generate-report',
      title: 'Générer rapport',
      description: 'Créer un rapport de ventes ou de stock',
      icon: FileText,
      color: 'bg-pink-500 hover:bg-pink-600',
      action: () => console.log('Generate report')
    },
    {
      id: 'schedule-delivery',
      title: 'Planifier livraison',
      description: 'Organiser les livraisons du jour',
      icon: Calendar,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      action: () => console.log('Schedule delivery')
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Zap className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Actions rapides</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>Productivité</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:border-transparent hover:shadow-lg hover:scale-105"
            >
              <div className={`absolute inset-0 ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${action.color} group-hover:bg-white/20 transition-colors duration-200`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                <h4 className="font-medium text-gray-900 group-hover:text-white transition-colors duration-200 mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors duration-200">
                  {action.description}
                </p>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">45</div>
            <div className="text-sm text-gray-600">Ventes aujourd'hui</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">8</div>
            <div className="text-sm text-gray-600">Alertes stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">23</div>
            <div className="text-sm text-gray-600">Réservations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">12</div>
            <div className="text-sm text-gray-600">Messages non lus</div>
          </div>
        </div>
      </div>

      {/* New Product Modal */}
      {showNewProductModal && (
        <NewProductModal 
          onClose={() => setShowNewProductModal(false)}
          onProductCreated={() => {
            setShowNewProductModal(false);
            // Vous pourriez vouloir rafraîchir la liste des produits ici
          }}
        />
      )}

      {/* POS Modal */}
      {showPOSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Point de vente - Nouvelle vente</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client (optionnel)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom du client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher produit</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Scanner ou taper le nom du produit"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Panier</h4>
                <p className="text-sm text-gray-600">Aucun article ajouté</p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total: 0 GNF</span>
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Espèces</option>
                  <option>Carte</option>
                  <option>Mobile Money</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowPOSModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Encaisser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuickActions;
