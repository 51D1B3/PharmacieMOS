import axios from 'axios';
// import { mockProducts, mockReservations, mockUser, simulateApiDelay, simulateApiError } from '../data/mockData';

const API_BASE_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';

class ApiService {
  api;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les erreurs d'authentification
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentification
  async login(email, password) {
    // if (USE_MOCK_DATA) {
    //   await simulateApiDelay(1000);
    //   if (simulateApiError()) {
    //     throw new Error('Erreur de connexion');
    //   }
      
    //   // Simuler une connexion réussie avec n'importe quel email/password
    //   const mockResponse = {
    //     user: mockUser,
    //     accessToken: 'mock-access-token',
    //     refreshToken: 'mock-refresh-token',
    //   };
    //   return mockResponse;
    // }

    const response = await this.api.post('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  }

  async register(userData) {
    // if (USE_MOCK_DATA) {
    //   await simulateApiDelay(1500);
    //   if (simulateApiError()) {
    //     throw new Error('Erreur lors de la création du compte');
    //   }
      
    //   // Simuler une inscription réussie
    //   const mockResponse = {
    //     user: {
    //       ...mockUser,
    //       ...userData,
    //       _id: Date.now().toString(),
    //     },
    //     accessToken: 'mock-access-token',
    //     refreshToken: 'mock-refresh-token',
    //   };
    //   return mockResponse;
    // }

    const response = await this.api.post('/auth/register', userData);
    return response.data.data;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await this.api.post('/auth/refresh', {
      refreshToken,
    });
    return response.data.data;
  }

  // Produits
  async createProduct(productData) {
    const response = await this.api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }
  async getProducts(params) {
    try {
      console.log('Calling API: GET /products with params:', params);
      const response = await this.api.get('/products', { params });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  async getProduct(id) {
    const response = await this.api.get(`/products/${id}`);
    return response.data.data;
  }

  // Catégories
  async getCategories(params) {
    try {
      console.log('Calling API: GET /categories');
      const response = await this.api.get('/categories', { params: { ...params, tree: true } });
      console.log('Categories API Response:', response.data);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Réservations
  async createReservation(reservationData) {
    const response = await this.api.post('/reservations', reservationData);
    return response.data.data;
  }

  async getReservations() {
    try {
      console.log('Calling API: GET /reservations');
      const response = await this.api.get('/reservations');
      console.log('Reservations API Response:', response.data);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  }

  async cancelReservation(id) {
    await this.api.delete(`/reservations/${id}`);
  }

  // Commandes
  async createOrder(orderData) {
    const response = await this.api.post('/orders', orderData);
    return response.data.data;
  }

  async getOrders() {
    try {
      console.log('Calling API: GET /orders');
      const response = await this.api.get('/orders');
      console.log('Orders API Response:', response.data);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  // Messages
  async getMessages(userId) {
    const response = await this.api.get(`/messages/${userId}`);
    return response.data.data;
  }

  async sendMessage(messageData) {
    const response = await this.api.post('/messages', messageData);
    return response.data.data;
  }

  // Profil utilisateur
  async getProfile() {
    const response = await this.api.get('/users/profile');
    return response.data.data;
  }

  async updateProfile(userData) {
    const response = await this.api.put('/users/profile', userData);
    return response.data.data;
  }

  // Utilisateurs (pour admin)
  async getUsers() {
    try {
      console.log('Calling API: GET /users');
      const response = await this.api.get('/users');
      console.log('Users API Response:', response.data);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Fournisseurs (pour admin)
  async getSuppliers() {
    try {
      console.log('Calling API: GET /suppliers');
      const response = await this.api.get('/suppliers');
      console.log('Suppliers API Response:', response.data);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  }

  // Notifications
  async getNotifications() {
    try {
      console.log('Calling API: GET /notifications');
      const response = await this.api.get('/notifications');
      console.log('Notifications API Response:', response.data);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();
export default apiService;
