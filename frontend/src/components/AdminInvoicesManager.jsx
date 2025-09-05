import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Eye, Search, Filter, RefreshCw,
  DollarSign, Calendar, User, CreditCard, Plus, Edit,
  Printer, Mail, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const AdminInvoicesManager = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const mockInvoices = [
        {
          id: 'F001',
          number: 'FAC-2024-001',
          type: 'invoice',
          client: {
            name: 'Marie Diallo',
            email: 'marie.diallo@email.com',
            phone: '+224623841149',
            address: 'Madina, Conakry'
          },
          items: [
            { name: 'Paracétamol 500mg', quantity: 2, unitPrice: 7500, total: 15000 },
            { name: 'Vitamine C', quantity: 1, unitPrice: 12000, total: 12000 }
          ],
          subtotal: 27000,
          tax: 2700,
          total: 29700,
          status: 'paid',
          issueDate: '2024-08-26T10:30:00Z',
          dueDate: '2024-09-26T10:30:00Z',
          paidDate: '2024-08-26T11:15:00Z',
          paymentMethod: 'cash',
          notes: 'Paiement comptant'
        },
        {
          id: 'F002',
          number: 'FAC-2024-002',
          type: 'invoice',
          client: {
            name: 'Ahmed Camara',
            email: 'ahmed.camara@email.com',
            phone: '+224664123456',
            address: 'Kaloum, Conakry'
          },
          items: [
            { name: 'Amoxicilline 250mg', quantity: 1, unitPrice: 25000, total: 25000 },
            { name: 'Ibuprofène 400mg', quantity: 2, unitPrice: 18000, total: 36000 }
          ],
          subtotal: 61000,
          tax: 6100,
          total: 67100,
          status: 'pending',
          issueDate: '2024-08-25T14:00:00Z',
          dueDate: '2024-09-25T14:00:00Z',
          paymentMethod: 'mobile_money',
          notes: 'En attente de paiement mobile money'
        },
        {
          id: 'A001',
          number: 'AV-2024-001',
          type: 'credit',
          client: {
            name: 'Fatou Barry',
            email: 'fatou.barry@email.com',
            phone: '+224612345678',
            address: 'Dixinn, Conakry'
          },
          items: [
            { name: 'Aspirine 100mg', quantity: 1, unitPrice: -15000, total: -15000 }
          ],
          subtotal: -15000,
          tax: -1500,
          total: -16500,
          status: 'processed',
          issueDate: '2024-08-24T16:20:00Z',
          processedDate: '2024-08-24T16:30:00Z',
          reason: 'Produit défectueux',
          notes: 'Remboursement effectué'
        },
        {
          id: 'F003',
          number: 'FAC-2024-003',
          type: 'invoice',
          client: {
            name: 'Mamadou Bah',
            email: 'mamadou.bah@email.com',
            phone: '+224655987654',
            address: 'Ratoma, Conakry'
          },
          items: [
            { name: 'Doliprane 1000mg', quantity: 1, unitPrice: 18000, total: 18000 }
          ],
          subtotal: 18000,
          tax: 1800,
          total: 19800,
          status: 'overdue',
          issueDate: '2024-08-15T09:00:00Z',
          dueDate: '2024-08-25T09:00:00Z',
          paymentMethod: 'card',
          notes: 'Facture en retard de paiement'
        },
        {
          id: 'A002',
          number: 'AV-2024-002',
          type: 'credit',
          client: {
            name: 'Aissatou Sow',
            email: 'aissatou.sow@email.com',
            phone: '+224677123456',
            address: 'Matoto, Conakry'
          },
          items: [
            { name: 'Vitamine C 1000mg', quantity: 2, unitPrice: -12000, total: -24000 }
          ],
          subtotal: -24000,
          tax: -2400,
          total: -26400,
          status: 'pending',
          issueDate: '2024-08-23T11:30:00Z',
          reason: 'Erreur de facturation',
          notes: 'Avoir en cours de traitement'
        }
      ];
      
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'invoice': return 'Facture';
      case 'credit': return 'Avoir';
      default: return 'Inconnu';
    }
  };

  const getStatusLabel = (status, type) => {
    if (type === 'credit') {
      switch (status) {
        case 'pending': return 'En attente';
        case 'processed': return 'Traité';
        case 'cancelled': return 'Annulé';
        default: return 'Inconnu';
      }
    }
    
    switch (status) {
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = (status, type) => {
    if (type === 'credit') {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'processed': return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }

    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'card': return 'Carte';
      case 'mobile_money': return 'Mobile Money';
      case 'transfer': return 'Virement';
      default: return 'Inconnu';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || invoice.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetails(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return Math.abs(amount).toLocaleString() + ' GNF';
  };

  const getTotalRevenue = () => {
    return filteredInvoices
      .filter(invoice => invoice.type === 'invoice' && invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.total, 0);
  };

  const getTotalCredits = () => {
    return Math.abs(filteredInvoices
      .filter(invoice => invoice.type === 'credit')
      .reduce((sum, invoice) => sum + invoice.total, 0));
  };

  const getOverdueAmount = () => {
    return filteredInvoices
      .filter(invoice => invoice.type === 'invoice' && invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.total, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Factures et avoirs</h2>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
            {filteredInvoices.length} documents
          </span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadInvoices}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="h-4 w-4" />
            <span>Nouvelle facture</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">CA facturé</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(getTotalRevenue())}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Factures payées</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {filteredInvoices.filter(i => i.type === 'invoice' && i.status === 'paid').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Impayées</span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(getOverdueAmount())}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Avoirs</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {formatCurrency(getTotalCredits())}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par client, numéro ou produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="invoice">Factures</option>
              <option value="credit">Avoirs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Document</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Client</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Montant</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Échéance</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${
                        invoice.type === 'invoice' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        <FileText className={`h-3 w-3 ${
                          invoice.type === 'invoice' ? 'text-green-600' : 'text-purple-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{invoice.number}</p>
                        <p className="text-xs text-gray-600">{getTypeLabel(invoice.type)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.client.name}</p>
                      <p className="text-sm text-gray-600">{invoice.client.phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className={`font-semibold ${
                      invoice.type === 'credit' ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {invoice.type === 'credit' ? '-' : ''}{formatCurrency(invoice.total)}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(invoice.status, invoice.type)}`}>
                      {getStatusLabel(invoice.status, invoice.type)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDate(invoice.issueDate)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {invoice.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className={`text-sm ${
                          invoice.status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-600'
                        }`}>
                          {formatDate(invoice.dueDate)}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDetails(invoice)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded">
                        <Printer className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded">
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
          <p className="text-gray-600">
            {searchTerm || typeFilter !== 'all' 
              ? 'Aucun document ne correspond à vos critères de recherche.' 
              : 'Aucune facture ou avoir pour le moment.'}
          </p>
        </div>
      )}

      {/* Invoice Details Modal */}
      {showDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {getTypeLabel(selectedInvoice.type)} {selectedInvoice.number}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedInvoice.status, selectedInvoice.type)}`}>
                    {getStatusLabel(selectedInvoice.status, selectedInvoice.type)}
                  </span>
                </div>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Client & Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Informations client
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Nom:</span> {selectedInvoice.client.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedInvoice.client.email}</p>
                    <p><span className="font-medium">Téléphone:</span> {selectedInvoice.client.phone}</p>
                    <p><span className="font-medium">Adresse:</span> {selectedInvoice.client.address}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Informations document</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Type:</span> {getTypeLabel(selectedInvoice.type)}</p>
                    <p><span className="font-medium">Date d'émission:</span> {formatDate(selectedInvoice.issueDate)}</p>
                    {selectedInvoice.dueDate && (
                      <p><span className="font-medium">Date d'échéance:</span> {formatDate(selectedInvoice.dueDate)}</p>
                    )}
                    {selectedInvoice.paidDate && (
                      <p><span className="font-medium">Date de paiement:</span> {formatDate(selectedInvoice.paidDate)}</p>
                    )}
                    {selectedInvoice.paymentMethod && (
                      <p><span className="font-medium">Mode de paiement:</span> {getPaymentMethodLabel(selectedInvoice.paymentMethod)}</p>
                    )}
                    {selectedInvoice.reason && (
                      <p><span className="font-medium">Motif:</span> {selectedInvoice.reason}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Détail des articles
                </h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Article</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Quantité</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Prix unitaire</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="py-2 px-4">{item.name}</td>
                          <td className="py-2 px-4">{Math.abs(item.quantity)}</td>
                          <td className="py-2 px-4">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2 px-4 font-medium">
                            {item.total < 0 ? '-' : ''}{formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan="3" className="py-2 px-4 font-medium text-right">Sous-total:</td>
                        <td className="py-2 px-4 font-medium">
                          {selectedInvoice.subtotal < 0 ? '-' : ''}{formatCurrency(selectedInvoice.subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="py-2 px-4 font-medium text-right">TVA (10%):</td>
                        <td className="py-2 px-4 font-medium">
                          {selectedInvoice.tax < 0 ? '-' : ''}{formatCurrency(selectedInvoice.tax)}
                        </td>
                      </tr>
                      <tr className="border-t border-gray-300">
                        <td colSpan="3" className="py-2 px-4 font-bold text-right text-lg">Total:</td>
                        <td className="py-2 px-4 font-bold text-lg">
                          {selectedInvoice.total < 0 ? '-' : ''}{formatCurrency(selectedInvoice.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedInvoice.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Modifier
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Imprimer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Envoyer par email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoicesManager;
