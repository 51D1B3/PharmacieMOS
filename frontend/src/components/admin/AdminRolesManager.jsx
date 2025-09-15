import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, Edit, Trash2, Users, Check, X, 
  Settings, Eye, Package, FileText, BarChart3,
  CreditCard, MessageSquare, Activity, Database
} from 'lucide-react';

const AdminRolesManager = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: []
  });

  // Permissions disponibles dans le système
  const availablePermissions = [
    {
      category: 'Gestion des Produits',
      icon: Package,
      permissions: [
        { id: 'products.view', name: 'Voir les produits', description: 'Consulter la liste des produits' },
        { id: 'products.create', name: 'Créer des produits', description: 'Ajouter de nouveaux produits' },
        { id: 'products.edit', name: 'Modifier les produits', description: 'Mettre à jour les informations des produits' },
        { id: 'products.delete', name: 'Supprimer les produits', description: 'Supprimer des produits du système' },
        { id: 'stock.manage', name: 'Gérer le stock', description: 'Ajuster les quantités en stock' }
      ]
    },
    {
      category: 'Gestion des Ventes',
      icon: CreditCard,
      permissions: [
        { id: 'sales.view', name: 'Voir les ventes', description: 'Consulter l\'historique des ventes' },
        { id: 'sales.create', name: 'Effectuer des ventes', description: 'Enregistrer de nouvelles ventes' },
        { id: 'sales.refund', name: 'Effectuer des remboursements', description: 'Traiter les retours et remboursements' },
        { id: 'pos.access', name: 'Accès au POS', description: 'Utiliser le système de point de vente' }
      ]
    },
    {
      category: 'Gestion des Utilisateurs',
      icon: Users,
      permissions: [
        { id: 'users.view', name: 'Voir les utilisateurs', description: 'Consulter la liste des utilisateurs' },
        { id: 'users.create', name: 'Créer des utilisateurs', description: 'Ajouter de nouveaux utilisateurs' },
        { id: 'users.edit', name: 'Modifier les utilisateurs', description: 'Mettre à jour les informations utilisateurs' },
        { id: 'users.delete', name: 'Supprimer les utilisateurs', description: 'Supprimer des comptes utilisateurs' },
        { id: 'roles.manage', name: 'Gérer les rôles', description: 'Créer et modifier les rôles et permissions' }
      ]
    },
    {
      category: 'Rapports et Analyses',
      icon: BarChart3,
      permissions: [
        { id: 'reports.view', name: 'Voir les rapports', description: 'Consulter les rapports de vente' },
        { id: 'reports.export', name: 'Exporter les rapports', description: 'Télécharger les rapports en Excel/PDF' },
        { id: 'analytics.view', name: 'Voir les analyses', description: 'Accéder aux tableaux de bord analytiques' },
        { id: 'financial.view', name: 'Voir les données financières', description: 'Consulter les revenus et bénéfices' }
      ]
    },
    {
      category: 'Administration Système',
      icon: Settings,
      permissions: [
        { id: 'system.config', name: 'Configuration système', description: 'Modifier les paramètres du système' },
        { id: 'logs.view', name: 'Voir les journaux', description: 'Consulter les logs d\'activité' },
        { id: 'backup.manage', name: 'Gérer les sauvegardes', description: 'Créer et restaurer des sauvegardes' },
        { id: 'security.manage', name: 'Gérer la sécurité', description: 'Configurer les paramètres de sécurité' }
      ]
    }
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    // Simuler des rôles existants
    const mockRoles = [
      {
        id: 1,
        name: 'Administrateur',
        description: 'Accès complet au système',
        color: 'red',
        permissions: availablePermissions.flatMap(cat => cat.permissions.map(p => p.id)),
        userCount: 1,
        isSystem: true
      },
      {
        id: 2,
        name: 'Pharmacien',
        description: 'Gestion des médicaments et ordonnances',
        color: 'blue',
        permissions: [
          'products.view', 'products.create', 'products.edit', 'stock.manage',
          'sales.view', 'sales.create', 'pos.access',
          'reports.view', 'analytics.view'
        ],
        userCount: 3,
        isSystem: false
      },
      {
        id: 3,
        name: 'Vendeur',
        description: 'Vente et gestion de la caisse',
        color: 'green',
        permissions: [
          'products.view', 'sales.view', 'sales.create', 'pos.access'
        ],
        userCount: 2,
        isSystem: false
      },
      {
        id: 4,
        name: 'Caissier',
        description: 'Gestion des paiements uniquement',
        color: 'yellow',
        permissions: [
          'sales.view', 'sales.create', 'pos.access'
        ],
        userCount: 1,
        isSystem: false
      }
    ];
    setRoles(mockRoles);
  };

  const handleCreateRole = () => {
    const role = {
      id: Date.now(),
      ...newRole,
      color: 'purple',
      userCount: 0,
      isSystem: false
    };
    
    setRoles([...roles, role]);
    setShowCreateModal(false);
    setNewRole({ name: '', description: '', permissions: [] });
  };

  const handleDeleteRole = (roleId) => {
    setRoles(roles.filter(role => role.id !== roleId));
    setShowDeleteModal(null);
  };

  const togglePermission = (permissionId) => {
    const currentPermissions = editingRole ? editingRole.permissions : newRole.permissions;
    const updatedPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId];

    if (editingRole) {
      setEditingRole({ ...editingRole, permissions: updatedPermissions });
    } else {
      setNewRole({ ...newRole, permissions: updatedPermissions });
    }
  };

  const getPermissionsByCategory = () => {
    return availablePermissions.map(category => ({
      ...category,
      permissions: category.permissions.map(permission => ({
        ...permission,
        granted: (editingRole ? editingRole.permissions : newRole.permissions).includes(permission.id)
      }))
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-purple-600" />
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Gestion des Rôles</h3>
            <p className="text-gray-600 dark:text-gray-300">Définir les permissions et accès par rôle</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau rôle</span>
        </button>
      </div>

      {/* Liste des rôles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className={`bg-${role.color}-50 dark:bg-${role.color}-900/20 border border-${role.color}-200 dark:border-${role.color}-800 rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-${role.color}-100 dark:bg-${role.color}-900/50 rounded-lg`}>
                  <Shield className={`h-6 w-6 text-${role.color}-600 dark:text-${role.color}-400`} />
                </div>
                <div>
                  <h4 className={`font-semibold text-${role.color}-900 dark:text-${role.color}-100`}>{role.name}</h4>
                  <p className={`text-sm text-${role.color}-600 dark:text-${role.color}-300`}>{role.userCount} utilisateur{role.userCount > 1 ? 's' : ''}</p>
                </div>
              </div>
              {!role.isSystem && (
                <div className="flex space-x-1">
                  <button 
                    onClick={() => setEditingRole(role)}
                    className={`p-1 text-${role.color}-600 hover:text-${role.color}-800 dark:text-${role.color}-400 dark:hover:text-${role.color}-200`}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setShowDeleteModal(role.id)}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            <p className={`text-sm text-${role.color}-700 dark:text-${role.color}-300 mb-4`}>{role.description}</p>
            
            <div className="space-y-2">
              <p className={`text-xs font-medium text-${role.color}-600 dark:text-${role.color}-400 uppercase tracking-wider`}>
                Permissions ({role.permissions.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 3).map((permissionId) => {
                  const permission = availablePermissions
                    .flatMap(cat => cat.permissions)
                    .find(p => p.id === permissionId);
                  return permission ? (
                    <span key={permissionId} className={`text-xs px-2 py-1 bg-${role.color}-100 dark:bg-${role.color}-900/50 text-${role.color}-700 dark:text-${role.color}-300 rounded-full`}>
                      {permission.name}
                    </span>
                  ) : null;
                })}
                {role.permissions.length > 3 && (
                  <span className={`text-xs px-2 py-1 bg-${role.color}-100 dark:bg-${role.color}-900/50 text-${role.color}-700 dark:text-${role.color}-300 rounded-full`}>
                    +{role.permissions.length - 3} autres
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de création/modification de rôle */}
      {(showCreateModal || editingRole) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingRole ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du rôle
                  </label>
                  <input
                    type="text"
                    value={editingRole ? editingRole.name : newRole.name}
                    onChange={(e) => {
                      if (editingRole) {
                        setEditingRole({ ...editingRole, name: e.target.value });
                      } else {
                        setNewRole({ ...newRole, name: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Ex: Gestionnaire de stock"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingRole ? editingRole.description : newRole.description}
                    onChange={(e) => {
                      if (editingRole) {
                        setEditingRole({ ...editingRole, description: e.target.value });
                      } else {
                        setNewRole({ ...newRole, description: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Description du rôle"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Permissions</h4>
                <div className="space-y-6">
                  {getPermissionsByCategory().map((category) => (
                    <div key={category.category} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <category.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">{category.category}</h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-3">
                            <button
                              onClick={() => togglePermission(permission.id)}
                              className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                permission.granted
                                  ? 'bg-purple-600 border-purple-600 text-white'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-purple-500'
                              }`}
                            >
                              {permission.granted && <Check className="h-3 w-3" />}
                            </button>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {permission.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingRole(null);
                  setNewRole({ name: '', description: '', permissions: [] });
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (editingRole) {
                    setRoles(roles.map(r => r.id === editingRole.id ? editingRole : r));
                    setEditingRole(null);
                  } else {
                    handleCreateRole();
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {editingRole ? 'Modifier' : 'Créer'}
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
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
              Supprimer le rôle
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Êtes-vous sûr de vouloir supprimer ce rôle ? Les utilisateurs associés perdront leurs permissions.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteRole(showDeleteModal)}
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

export default AdminRolesManager;