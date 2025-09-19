import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { FileText, Eye, Check, Package, CreditCard } from 'lucide-react';

const PrescriptionManager = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [medications, setMedications] = useState([]);
  const [products, setProducts] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    loadPrescriptions();
    loadProducts();
    
    // WebSocket pour nouvelles ordonnances
    const newSocket = io('http://localhost:5005');
    setSocket(newSocket);
    
    newSocket.emit('join-room', { userId: 'pharmacist', role: 'pharmacist' });
    newSocket.on('new-prescription', (prescription) => {
      setPrescriptions(prev => [prescription, ...prev]);
    });

    return () => newSocket.close();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const response = await fetch('http://localhost:5005/api/prescriptions/all');
      const data = await response.json();
      if (data.success) {
        setPrescriptions(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement ordonnances:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('http://localhost:5005/api/products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const addMedication = () => {
    setMedications([...medications, { productId: '', quantity: 1 }]);
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const validatePrescription = async () => {
    if (!selectedPrescription || medications.length === 0) return;

    try {
      const response = await fetch(`http://localhost:5005/api/prescriptions/${selectedPrescription._id}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications })
      });

      if (response.ok) {
        alert('Ordonnance validée avec succès');
        loadPrescriptions();
        setSelectedPrescription(null);
        setMedications([]);
      }
    } catch (error) {
      alert('Erreur lors de la validation');
    }
  };

  const preparePrescription = async (prescriptionId) => {
    try {
      const response = await fetch(`http://localhost:5005/api/prescriptions/${prescriptionId}/prepare`, {
        method: 'PUT'
      });

      if (response.ok) {
        alert('Ordonnance préparée, client notifié');
        loadPrescriptions();
      }
    } catch (error) {
      alert('Erreur lors de la préparation');
    }
  };

  const processPayment = async (prescriptionId, paymentMethod) => {
    try {
      const response = await fetch(`http://localhost:5005/api/prescriptions/${prescriptionId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod })
      });

      if (response.ok) {
        alert('Paiement confirmé');
        loadPrescriptions();
      }
    } catch (error) {
      alert('Erreur lors du paiement');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'validated': return 'bg-blue-100 text-blue-800';
      case 'prepared': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des ordonnances */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Ordonnances ({prescriptions.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {prescription.clientName}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                    {prescription.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {new Date(prescription.createdAt).toLocaleDateString()} à {new Date(prescription.createdAt).toLocaleTimeString()}
                </p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedPrescription(prescription)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Voir</span>
                  </button>
                  
                  {prescription.status === 'validated' && (
                    <button
                      onClick={() => preparePrescription(prescription._id)}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
                    >
                      <Package className="h-4 w-4" />
                      <span>Préparer</span>
                    </button>
                  )}
                  
                  {prescription.status === 'prepared' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => processPayment(prescription._id, 'cash')}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Espèces
                      </button>
                      <button
                        onClick={() => processPayment(prescription._id, 'orange_money')}
                        className="text-xs bg-orange-600 text-white px-2 py-1 rounded"
                      >
                        Orange Money
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails de l'ordonnance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          {selectedPrescription ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Ordonnance - {selectedPrescription.clientName}
              </h3>
              
              <img 
                src={`http://localhost:5005${selectedPrescription.imageUrl}`} 
                alt="Ordonnance" 
                className="w-full h-48 object-contain bg-gray-100 rounded-lg mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x200/f3f4f6/9ca3af?text=Image+non+disponible';
                }}
                onDoubleClick={() => {
                  const newWindow = window.open('', '_blank');
                  newWindow.document.write(`
                    <html>
                      <head><title>Ordonnance - ${selectedPrescription.clientName}</title></head>
                      <body style="margin:0;padding:20px;background:#f0f0f0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                        <img src="http://localhost:5005${selectedPrescription.imageUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" />
                      </body>
                    </html>
                  `);
                }}
                title="Double-cliquez pour agrandir"
              />
              
              {selectedPrescription.status === 'pending' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-white bg-blue-600 px-3 py-2 rounded-lg">Ajouter les médicaments:</h4>
                  
                  {medications.map((med, index) => (
                    <div key={index} className="flex space-x-2">
                      <select
                        value={med.productId}
                        onChange={(e) => updateMedication(index, 'productId', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Sélectionner un produit</option>
                        {products.map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name} - {product.price} GNF
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={med.quantity}
                        onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  ))}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={addMedication}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Ajouter médicament
                    </button>
                    <button
                      onClick={validatePrescription}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Valider ordonnance
                    </button>
                  </div>
                </div>
              )}
              
              {selectedPrescription.medications && selectedPrescription.medications.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Médicaments:</h4>
                  <div className="space-y-2">
                    {selectedPrescription.medications.map((med, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{med.name} x{med.quantity}</span>
                        <span className={med.available ? 'text-green-600' : 'text-red-600'}>
                          {med.available ? 'Disponible' : 'Indisponible'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 font-semibold">
                    Total: {selectedPrescription.totalAmount?.toLocaleString()} GNF
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Sélectionnez une ordonnance pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionManager;