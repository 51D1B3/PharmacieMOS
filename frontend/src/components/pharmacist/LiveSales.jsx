import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { TrendingUp, Package, Clock } from 'lucide-react';

const LiveSales = () => {
  const [sales, setSales] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    loadTodaySales();
    
    // Connexion WebSocket
    const newSocket = io('http://localhost:5005');
    setSocket(newSocket);
    
    newSocket.emit('join-room', { userId: 'pharmacist', role: 'pharmacist' });
    
    // Écouter les nouvelles ventes
    newSocket.on('new-sale', (data) => {
      setSales(prev => [data.sale, ...prev]);
      setTodayTotal(prev => prev + data.sale.totalPrice);
    });

    return () => newSocket.close();
  }, []);

  const loadTodaySales = async () => {
    try {
      const response = await fetch('http://localhost:5005/api/sales/today');
      const data = await response.json();
      if (data.success) {
        setSales(data.data);
        const total = data.data.reduce((sum, sale) => sum + sale.totalPrice, 0);
        setTodayTotal(total);
      }
    } catch (error) {
      console.error('Erreur chargement ventes:', error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistiques du jour */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total du jour</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {todayTotal.toLocaleString()} GNF
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ventes</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {sales.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dernière vente</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {sales.length > 0 ? formatTime(sales[0].createdAt) : '--:--'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des ventes en temps réel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Ventes du jour ({sales.length})
        </h3>
        
        <div className="max-h-96 overflow-y-auto space-y-3">
          {sales.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Aucune vente aujourd'hui</p>
            </div>
          ) : (
            sales.map((sale) => (
              <div key={sale._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {sale.productName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {sale.clientName} • Qté: {sale.quantity} • {formatTime(sale.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {sale.totalPrice.toLocaleString()} GNF
                  </p>
                  <p className="text-xs text-gray-500">
                    {sale.unitPrice} GNF/unité
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSales;