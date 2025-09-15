import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Edit, Trash2, Shield, Eye, EyeOff, 
  Search, Filter, MoreVertical, Mail, Phone, Calendar,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const AdminUsersManager = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'pharmacien',
    password: '',
    confirmPassword: '',
    isActive: true
  });

  const roles = [
    { value: 'admin', label: 'Administrateur', color: 'red', description: 'Accès complet au système' },
    { value: 'pharmacien', label: 'Pharmacien', color: 'blue', description: 'Gestion des médicaments et ordonnances' },
    { value: 'vendeur', label: 'Vendeur', color: 'green', description: 'Vente et caisse' },
    { value: 'caissier', label: 'Caissier', color: 'yellow', description: 'Gestion des paiements' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Simuler des données utilisateurs
      const mockUsers = [
        {
          id: 1,
          nom: 'Diallo',
          prenom: 'Mamadou',
          email: 'mamadou.diallo@pharmacie.com',
          telephone: '+224 123 456 789',
          role: 'admin',
          isActive: true,
          createdAt: '2024-01-15',
          lastLogin: '2024-01-20 10:30'
        },
        {
          id: 2,
          nom: 'Camara',
          prenom: 'Fatoumata',
          email: 'fatoumata.camara@pharmacie.com',
          telephone: '+224 987 654 321',
          role: 'pharmacien',
          isActive: true,
          createdAt: '2024-01-10',
          lastLogin: '2024-01-19 14:20'
        },
        {
          id: 3,
          nom: 'Bah',
          prenom: 'Ibrahima',
          email: 'ibrahima.bah@pharmacie.com',
          telephone: '+224 555 123 456',
          role: 'vendeur',
          isActive: false,
          createdAt: '2024-01-05',
          lastLogin: '2024-01-18 09:15'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telephone.includes(searchTerm);
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
    
    setFilteredUsers(filtered);
  };

  const handleCreateUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      // Simuler la création d'utilisateur
      const user = {
        id: Date.now(),
        ...newUser,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: null
      };
      
      setUsers([...users, user]);
      setShowCreateModal(false);
      setNewUser({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        role: 'pharmacien',
        password: '',
        confirmPassword: '',
        isActive: true
      });
      
      alert('Utilisateur créé avec succès');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isActive: !user.isActive }
          : user
      ));
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setUsers(users.filter(user => user.id !== userId));
      setShowDeleteModal(null);
      alert('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || roles[1];
  };

  const getStatusIcon = (isActive) => {
    return isActive ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Gestion des Utilisateurs</h3>
            <p className="text-gray-600 dark:text-gray-300">{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Nouvel utilisateur</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">Tous les rôles</option>
          {roles.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>

      {/* Liste des utilisateurs */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Dernière connexion
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => {
              const roleInfo = getRoleInfo(user.role);
              return (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 font-medium">
                            {user.prenom.charAt(0)}{user.nom.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.prenom} {user.nom}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {user.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {user.telephone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${roleInfo.color}-100 text-${roleInfo.color}-800 dark:bg-${roleInfo.color}-900 dark:text-${roleInfo.color}-200`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {roleInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(user.isActive)}
                      <span className={`ml-2 text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLogin ? (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {user.lastLogin}
                      </div>
                    ) : (
                      <span className="text-gray-400">Jamais connecté</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id)}
                        className={`p-1 rounded ${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => setShowDeleteModal(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Statistiques */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {roles.map(role => {
          const count = users.filter(u => u.role === role.value).length;
          return (
            <div key={role.value} className={`bg-${role.color}-50 dark:bg-${role.color}-900/20 p-4 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm text-${role.color}-600 dark:text-${role.color}-400 font-medium`}>{role.label}</p>
                  <p className={`text-2xl font-bold text-${role.color}-700 dark:text-${role.color}-300`}>{count}</p>
                </div>
                <Shield className={`h-8 w-8 text-${role.color}-600 dark:text-${role.color}-400`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de création d'utilisateur */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Créer un nouvel utilisateur
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={newUser.prenom}
                  onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={newUser.nom}
                  onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={newUser.telephone}
                onChange={(e) => setNewUser({...newUser, telephone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              <input
                type="password"
                placeholder="Mot de passe"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/50 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersManager;