import React, { useState, useEffect } from 'react';
import { 
  History, Calendar, Receipt, Eye, Download, 
  Filter, Search, User, Package, CreditCard
} from 'lucide-react';

const PharmacistHistory = () => {
  const [salesHistory, setSalesHistory] = useState([]);
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [activeView, setActiveView] = useState('sales');
  const [dateFilter, setDateFilter] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      // Charger l'historique des ventes (commandes)
      const salesResponse = await fetch('/api/orders?status=delivered', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        const formattedSales = salesData.map(order => ({
          id: order._id,
          date: order.createdAt,
          customer: order.customer ? `${order.customer.prenom} ${order.customer.nom}` : 'Client anonyme',
          phone: order.customer?.telephone || '',
          items: order.items.map(item => ({
            name: item.product?.name || 'Produit',
            quantity: item.quantity,
            price: item.priceTTC
          })),
          total: order.totalTTC,
          paymentMethod: order.payment?.method || 'cash'
        }));
        setSalesHistory(formattedSales);
      }
      
      // Charger l'historique des ordonnances
      const prescriptionsResponse = await fetch('/api/prescriptions?status=validated,rejected', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (prescriptionsResponse.ok) {
        const prescriptionsData = await prescriptionsResponse.json();
        const formattedPrescriptions = prescriptionsData.map(p => ({
          id: p._id,
          date: p.validatedAt || p.submittedAt,
          patient: p.clientId ? `${p.clientId.prenom} ${p.clientId.nom}` : p.clientName,
          phone: p.clientId?.telephone || 'Non renseigné',
          status: p.status,
          medications: [],
          note: p.validatedBy || p.description || '',
          delivered: p.status === 'validated'
        }));
        setPrescriptionHistory(formattedPrescriptions);
      }
      
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      setSalesHistory([]);
      setPrescriptionHistory([]);
    }
  };

  const filterByDate = (items) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return items.filter(item => {
      const itemDate = new Date(item.date);
      switch (dateFilter) {
        case 'today':
          return itemDate >= today;
        case 'week':
          return itemDate >= thisWeek;
        case 'month':
          return itemDate >= thisMonth;
        default:
          return true;
      }
    });
  };

  const filterBySearch = (items) => {
    if (!searchTerm) return items;
    
    return items.filter(item => {
      if (activeView === 'sales') {
        return item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.phone.includes(searchTerm) ||
               item.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      } else {
        return item.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.phone.includes(searchTerm) ||
               item.medications.some(med => med.toLowerCase().includes(searchTerm.toLowerCase()));
      }
    });
  };

  const getFilteredData = () => {
    const data = activeView === 'sales' ? salesHistory : prescriptionHistory;
    return filterBySearch(filterByDate(data));
  };

  const getTotalSales = () => {
    return filterByDate(salesHistory).reduce((sum, sale) => sum + sale.total, 0);
  };

  const downloadReport = () => {
    const data = getFilteredData();
    const reportType = activeView === 'sales' ? 'ventes' : 'ordonnances';
    const filename = `rapport-${reportType}-${dateFilter}.pdf`;
    
    // Simuler le téléchargement
    alert(`Téléchargement du rapport ${filename} démarré`);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ventes {dateFilter === 'today' ? "aujourd'hui" : dateFilter === 'week' ? 'cette semaine' : 'ce mois'}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{filterByDate(salesHistory).length}</p>
            </div>
            <Receipt className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chiffre d'affaires</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{getTotalSales().toLocaleString()} GNF</p>
            </div>
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ordonnances traitées</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{filterByDate(prescriptionHistory).length}</p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <History className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Historique</h3>
              <p className="text-gray-600 dark:text-gray-300">Vos activités récentes</p>
            </div>
          </div>
          
          <button
            onClick={downloadReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger</span>
          </button>
        </div>

        {/* Onglets */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveView('sales')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'sales'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Ventes ({salesHistory.length})
          </button>
          <button
            onClick={() => setActiveView('prescriptions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'prescriptions'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Ordonnances ({prescriptionHistory.length})
          </button>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Rechercher ${activeView === 'sales' ? 'une vente' : 'une ordonnance'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="all">Tout</option>
          </select>
        </div>

        {/* Liste des éléments */}
        <div className="space-y-4">
          {getFilteredData().map((item) => (
            <div key={item.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              {activeView === 'sales' ? (
                // Affichage des ventes
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {item.customer || 'Client anonyme'}
                        </h4>
                        {item.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">{item.phone}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Articles vendus:</p>
                        <div className="space-y-1">
                          {item.items.map((product, index) => (
                            <p key={index} className="text-sm text-gray-900 dark:text-gray-100">
                              {product.name} x{product.quantity} - {(product.price * product.quantity).toLocaleString()} GNF
                            </p>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
                          <p className="text-lg font-bold text-green-600">{item.total.toLocaleString()} GNF</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(item.date).toLocaleString('fr-FR')}
                          </p>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                            Espèces
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Affichage des ordonnances
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.patient}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.phone}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Médicaments:</p>
                        <div className="space-y-1">
                          {item.medications.map((med, index) => (
                            <p key={index} className="text-sm text-gray-900 dark:text-gray-100">{med}</p>
                          ))}
                        </div>
                        {item.note && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Note:</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100">{item.note}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === 'validated' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                          }`}>
                            {item.status === 'validated' ? 'Validée' : 'Rejetée'}
                          </span>
                          {item.delivered && (
                            <p className="text-xs text-green-600 mt-1">Médicaments délivrés</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(item.date).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message si aucun élément */}
        {getFilteredData().length === 0 && (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Aucun {activeView === 'sales' ? 'vente' : 'ordonnance'} trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Modifiez vos critères de recherche ou la période
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacistHistory;