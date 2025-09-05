// Service pour tracker les connexions clients en temps réel
const API_URL = process.env.REACT_APP_API_URL;

class ConnectionTracker {
  constructor() {
    this.connectedClients = new Set();
    this.listeners = [];
    this.heartbeatInterval = null;
    this.startHeartbeat();
  }

  // Démarrer le heartbeat pour maintenir les connexions actives
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000); // Heartbeat toutes les 30 secondes
  }

  // Envoyer un heartbeat au serveur
  async sendHeartbeat() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/auth/heartbeat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.updateConnectedClients(data.connectedClients || []);
      }
    } catch (error) {
      console.error('Erreur heartbeat:', error);
    }
  }

  // Mettre à jour la liste des clients connectés
  updateConnectedClients(clients) {
    this.connectedClients = new Set(clients);
    this.notifyListeners();
  }

  // Ajouter un client connecté
  addConnectedClient(clientId) {
    this.connectedClients.add(clientId);
    this.notifyListeners();
  }

  // Supprimer un client déconnecté
  removeConnectedClient(clientId) {
    this.connectedClients.delete(clientId);
    this.notifyListeners();
  }

  // Obtenir la liste des clients connectés
  getConnectedClients() {
    return Array.from(this.connectedClients);
  }

  // Vérifier si un client est connecté
  isClientConnected(clientId) {
    return this.connectedClients.has(clientId);
  }

  // Ajouter un listener pour les changements
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notifier tous les listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.getConnectedClients());
      } catch (error) {
        console.error('Erreur dans listener:', error);
      }
    });
  }

  // Marquer la connexion d'un utilisateur
  async markUserConnected() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_URL}/api/auth/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
    }
  }

  // Marquer la déconnexion d'un utilisateur
  async markUserDisconnected() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_URL}/api/auth/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  // Nettoyer les ressources
  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.listeners = [];
  }
}

// Instance singleton
const connectionTracker = new ConnectionTracker();

export default connectionTracker;
