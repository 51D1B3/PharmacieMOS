import React, { useState } from 'react';
import apiService from '../services/api.jsx';
import * as XLSX from 'xlsx';
import { 
  Plus, DollarSign, Upload, Package, ShoppingCart, Users,
  FileText, Calendar, Settings, Zap, TrendingUp, Activity
} from 'lucide-react';
import NewProductModal from './NewProductModal';

const AdminQuickActions = () => {
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [showStockCheckModal, setShowStockCheckModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const [reportData, setReportData] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryTimes, setDeliveryTimes] = useState({});
  const [stockStats, setStockStats] = useState({ total: 0, alerts: 0, lost: 0 });

  React.useEffect(() => {
    if (showNewOrderModal) {
      apiService.getSuppliers().then(setSuppliers);
    }
  }, [showNewOrderModal]);

  const handleGenerateReport = async () => {
    // Exemple : récupère les ventes du jour, produits vendus, etc.
    try {
      const orders = await apiService.getOrders();
      const today = new Date();
      const dailyOrders = (orders.data || orders).filter(order => {
        const d = new Date(order.createdAt);
        return d.toDateString() === today.toDateString();
      });
      setReportData({
        totalVentes: dailyOrders.length,
        totalMontant: dailyOrders.reduce((sum, o) => sum + (o.totalTTC || o.total || 0), 0),
        commandes: dailyOrders
      });
    } catch (e) {
      setReportData(null);
    }
  };

  const fetchDeliveries = async () => {
    setShowDeliveryModal(true);
    try {
      const orders = await apiService.getOrders();
      const today = new Date();
      const toDeliver = (orders.data || orders).filter(order => {
        const d = new Date(order.createdAt);
        return d.toDateString() === today.toDateString() && order.deliveryMethod === 'home' && order.status !== 'delivered';
      });
      setDeliveries(toDeliver);
    } catch (e) {
      setDeliveries([]);
    }
  };

  const quickActions = [
    {
      id: 'add-product',
      title: 'Ajouter un produit',
      description: 'Ajouter un nouveau produit au catalogue',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600',
  action: () => setShowNewProductModal(true),
    },
    {
      id: 'pos-sale',
      title: 'Encaissement POS',
      description: 'Effectuer une vente au point de vente',
      icon: DollarSign,
      color: 'bg-blue-500 hover:bg-blue-600',
  action: () => setShowPOSModal(true),
    },
    {
      id: 'import-catalog',
      title: 'Import catalogue',
      description: 'Exporter tous les produits en Excel',
      icon: Upload,
      color: 'bg-purple-500 hover:bg-purple-600',
  action: async () => {
        try {
          const products = await apiService.getProducts();
          const data = (products.data || products).map(p => ({
            CodeProduit: p.sku || p._id,
            NomProduit: p.name,
            Catégorie: p.category?.name || '',
            PrixAchat: p.priceHT || '',
            PrixVente: p.priceTTC || '',
            Stock: p.stock?.onHand || 0,
            Fournisseur: p.supplierId?.name || '',
            DateExpira: p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : ''
          }));
          const ws = XLSX.utils.json_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Catalogue');
          const fileName = `CatalogueProduits_${new Date().toISOString().slice(0,10)}.xlsx`;
          XLSX.writeFile(wb, fileName);
          // Tenter d'ouvrir automatiquement dans Excel (si supporté)
          window.open(fileName);
        } catch (e) {
          alert('Erreur lors de l\'export catalogue.');
        }
      }
    },
    {
      id: 'stock-check',
      title: 'Vérification stock',
      description: 'Lancer une vérification complète du stock',
      icon: Package,
      color: 'bg-orange-500 hover:bg-orange-600',
  action: async () => {
        setShowStockCheckModal(true);
        try {
          const products = await apiService.getProducts();
          const all = (products.data || products);
          setStockStats({
            total: all.length,
            alerts: all.filter(p => (p.stock?.onHand || 0) <= (p.stock?.thresholdAlert || 10)).length,
            lost: all.filter(p => (p.stock?.onHand || 0) < 0).length
          });
        } catch (e) {
          setStockStats({ total: 0, alerts: 0, lost: 0 });
        }
      }
    },
    {
      id: 'new-order',
      title: 'Nouvelle commande',
      description: 'Créer une commande fournisseur',
      icon: ShoppingCart,
      color: 'bg-indigo-500 hover:bg-indigo-600',
  action: () => setShowNewOrderModal(true),
    },
    {
      id: 'add-supplier',
      title: 'Nouveau fournisseur',
      description: 'Enregistrer un nouveau fournisseur',
      icon: Users,
      color: 'bg-teal-500 hover:bg-teal-600',
      action: () => setShowNewSupplierModal(true),
    },
    {
      id: 'generate-report',
      title: 'Générer rapport',
      description: 'Créer un rapport de ventes ou de stock',
      icon: FileText,
      color: 'bg-pink-500 hover:bg-pink-600',
  action: () => setShowReportModal(true),
    },
    {
      id: 'schedule-delivery',
      title: 'Planifier livraison',
      description: 'Organiser les livraisons du jour',
      icon: Calendar,
      color: 'bg-yellow-500 hover:bg-yellow-600',
  action: fetchDeliveries,
    }
  ];

  return (
    <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Zap className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-wide">Actions rapide</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Activity className="h-4 w-4" />
          <span>Productivité</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className={`flex flex-col items-start p-7 rounded-2xl shadow-lg border-2 border-gray-800 focus:outline-none focus:ring-2 focus:ring-white mb-4 md:mb-0 transition-all duration-200 ${action.color}`}
              style={{ minHeight: 140 }}
            >
              <div className="flex items-center mb-3">
                <Icon className="h-9 w-9 mr-3 text-white drop-shadow" />
                <span className="text-xl font-bold text-white">{action.title}</span>
              </div>
              <p className="text-base text-white opacity-90 font-medium">{action.description}</p>
            </button>
          );
        })}
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

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-8">
            <h3 className="text-lg font-semibold text-white mb-4">Rapport du jour</h3>
            <button onClick={handleGenerateReport} className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Afficher le rapport</button>
            {reportData ? (
              <div className="space-y-3 mb-6">
                <div className="text-gray-200">Nombre de ventes : <span className="font-bold">{reportData.totalVentes}</span></div>
                <div className="text-gray-200">Montant total : <span className="font-bold">{reportData.totalMontant.toLocaleString()} GNF</span></div>
                <div className="text-gray-200">Commandes du jour :</div>
                <ul className="text-gray-400 text-sm max-h-40 overflow-y-auto">
                  {reportData.commandes.map((o, i) => (
                    <li key={o._id || i}>N° {o.orderNumber || o._id} - {o.totalTTC?.toLocaleString() || o.total?.toLocaleString()} GNF</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-gray-400 mb-6">Clique sur "Afficher le rapport" pour voir les activités du jour.</div>
            )}
            <div className="flex flex-col md:flex-row gap-3 justify-end">
              <button onClick={() => setShowReportModal(false)} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800">Fermer</button>
              {reportData && (
                <button onClick={() => {
                  // Génération PDF ou autre extension
                  import('jspdf').then(jsPDF => {
                    const doc = new jsPDF.jsPDF();
                    doc.text('Rapport du jour', 10, 10);
                    doc.text(`Nombre de ventes : ${reportData.totalVentes}`, 10, 20);
                    doc.text(`Montant total : ${reportData.totalMontant.toLocaleString()} GNF`, 10, 30);
                    let y = 40;
                    reportData.commandes.forEach((o, i) => {
                      doc.text(`Commande ${i+1} : N°${o.orderNumber || o._id} - ${o.totalTTC?.toLocaleString() || o.total?.toLocaleString()} GNF`, 10, y);
                      y += 10;
                    });
                    doc.save(`Rapport_${new Date().toISOString().slice(0,10)}.pdf`);
                  });
                }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Générer PDF</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stock Check Modal */}
      {showStockCheckModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-xl max-w-sm w-full mx-4 p-8">
            <h3 className="text-lg font-semibold text-white mb-4">Vérification du stock</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-200"><span>Total produits :</span><span className="font-bold">{stockStats.total}</span></div>
              <div className="flex justify-between text-yellow-400"><span>En alerte :</span><span className="font-bold">{stockStats.alerts}</span></div>
              <div className="flex justify-between text-red-400"><span>Perdus :</span><span className="font-bold">{stockStats.lost}</span></div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowStockCheckModal(false)} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-8">
            <h3 className="text-lg font-semibold text-white mb-4">Nouvelle commande fournisseur</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;
              const data = {
                product: form.product.value,
                quantity: form.quantity.value,
                supplierId: form.supplierId.value,
                supplierEmail: form.supplierEmail.value,
                message: form.message.value
              };
              try {
                await apiService.createSupplierOrder(data); // À implémenter côté backend/api
                alert('Commande envoyée au fournisseur !');
                setShowNewOrderModal(false);
              } catch (err) {
                alert('Erreur lors de l\'envoi de la commande.');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Produit *</label>
                <input name="product" required className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Quantité *</label>
                <input name="quantity" type="number" min="1" required className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Fournisseur *</label>
                <select name="supplierId" required className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" onChange={e => {
                  const selected = suppliers.find(s => s._id === e.target.value);
                  if (selected) document.getElementsByName('supplierEmail')[0].value = selected.email;
                }}>
                  <option value="">Sélectionner...</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Email du fournisseur *</label>
                <input name="supplierEmail" required className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Message</label>
                <textarea name="message" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" rows={3} placeholder="Détails ou instructions supplémentaires..."></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowNewOrderModal(false)} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Envoyer la commande</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Supplier Modal */}
      {showNewSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-8">
            <h3 className="text-lg font-semibold text-white mb-4">Ajouter un nouveau fournisseur</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;
              const data = {
                name: form.name.value,
                contactPerson: form.contactPerson.value,
                email: form.email.value,
                phone: form.phone.value,
                address: form.address.value,
                status: 'active'
              };
              try {
                await apiService.createSupplier(data);
                alert('Fournisseur ajouté avec succès !');
                setShowNewSupplierModal(false);
              } catch (err) {
                alert('Erreur lors de l\'ajout du fournisseur.');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Nom du fournisseur *</label>
                <input name="name" required className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Contact *</label>
                <input name="contactPerson" required className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Email *</label>
                <input name="email" type="email" required className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Téléphone *</label>
                <input name="phone" required className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Adresse</label>
                <input name="address" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowNewSupplierModal(false)} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-8">
            <h3 className="text-lg font-semibold text-white mb-4">Livraisons à planifier</h3>
            {deliveries.length === 0 ? (
              <div className="text-gray-400">Aucune livraison à planifier aujourd'hui.</div>
            ) : (
              <div className="space-y-6">
                {deliveries.map((order) => (
                  <div key={order._id} className="bg-gray-800 rounded-lg p-4 mb-2">
                    <div className="text-white font-semibold mb-1">Client : {order.customer?.prenom} {order.customer?.nom} ({order.customer?.email})</div>
                    <div className="text-gray-300 mb-1">Adresse : {order.customer?.address || 'N/A'}</div>
                    <div className="text-gray-300 mb-1">Produit(s) : {order.items.map(i => i.product?.name).join(', ')}</div>
                    <div className="text-gray-300 mb-2">Montant : {order.totalTTC?.toLocaleString()} GNF</div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-gray-200">Heure de livraison :</label>
                      <input type="time" value={deliveryTimes[order._id] || ''} onChange={e => setDeliveryTimes(t => ({...t, [order._id]: e.target.value}))} className="bg-gray-700 text-white rounded px-2 py-1" />
                    </div>
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      onClick={async () => {
                        const heure = deliveryTimes[order._id];
                        if (!heure) return alert('Choisis une heure de livraison.');
                        try {
                          await apiService.sendDeliveryEmail({
                            orderId: order._id,
                            clientEmail: order.customer?.email,
                            heureLivraison: heure,
                            description: `Votre commande sera livrée à ${heure}. Merci de votre confiance !`
                          });
                          alert('Email envoyé au client !');
                        } catch (e) {
                          alert('Erreur lors de l\'envoi de l\'email.');
                        }
                      }}
                    >Livrer</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowDeliveryModal(false)} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuickActions;
