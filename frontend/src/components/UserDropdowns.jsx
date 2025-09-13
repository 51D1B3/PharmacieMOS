import React, { useState } from 'react';
import { Settings, Bell, Globe, Shield, Lock, X } from 'lucide-react';

const UserDropdowns = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const handleToggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleNotificationToggle = (enabled) => {
    setNotificationsEnabled(enabled);
    // Logique pour activer/désactiver les notifications
    if (enabled) {
      console.log('Notifications activées - les messages seront reçus automatiquement');
    } else {
      console.log('Notifications désactivées - aucun message ne sera reçu');
    }
  };

  const openLanguageSettings = () => {
    window.open('ms-settings:regionlanguage', '_blank');
    setActiveDropdown(null);
  };

  const openPrivacySettings = () => {
    window.open('ms-settings:privacy', '_blank');
    setActiveDropdown(null);
  };

  const openSecurityModal = () => {
    setShowSecurityModal(true);
    setActiveDropdown(null);
  };

  return (
    <>
      {/* Overlay pour fermer le dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setActiveDropdown(null)}
        />
      )}
      
      <div className="relative">
        <div className="relative">
          <button 
            onClick={() => handleToggleDropdown('settings')}
            className="flex items-center space-x-2 text-white hover:text-primary-200 transition-colors"
          >
            <Settings className="h-5 w-5 text-white" />
            <span className="text-sm font-medium">Paramètres</span>
          </button>

          {activeDropdown === 'settings' && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-40">
              <div className="p-4">
                <h4 className="font-medium text-white mb-4">Paramètres</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Notifications</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationsEnabled}
                        onChange={(e) => handleNotificationToggle(e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="pt-3 border-t border-gray-600">
                    <div className="space-y-2">
                      <button 
                        onClick={openLanguageSettings}
                        className="w-full text-left text-sm text-gray-300 hover:text-primary-400 py-1 flex items-center space-x-2"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Langue et région</span>
                      </button>
                      <button 
                        onClick={openPrivacySettings}
                        className="w-full text-left text-sm text-gray-300 hover:text-primary-400 py-1 flex items-center space-x-2"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Confidentialité</span>
                      </button>
                      <button 
                        onClick={openSecurityModal}
                        className="w-full text-left text-sm text-gray-300 hover:text-primary-400 py-1 flex items-center space-x-2"
                      >
                        <Lock className="h-4 w-4" />
                        <span>Sécurité du compte</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de sécurité du compte */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Lock className="h-6 w-6 mr-2 text-primary-400" />
                Sécurité du compte
              </h2>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Statut de sécurité */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-400" />
                  Statut de sécurité
                </h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 font-medium">Compte sécurisé</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Votre compte PharmaMOS est protégé par nos mesures de sécurité avancées. 
                  Nous utilisons un chiffrement de bout en bout pour protéger vos données médicales sensibles.
                </p>
              </div>

              {/* Authentification */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Authentification</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Mot de passe</p>
                      <p className="text-gray-400 text-sm">Dernière modification il y a 15 jours</p>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Modifier
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Authentification à deux facteurs (2FA)</p>
                      <p className="text-gray-400 text-sm">Sécurisez votre compte avec une double vérification</p>
                    </div>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Activer
                    </button>
                  </div>
                </div>
              </div>

              {/* Protection des données médicales */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-400" />
                  Protection des données médicales
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Chiffrement AES-256</p>
                      <p className="text-gray-400 text-xs">Vos ordonnances et données médicales sont chiffrées</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Conformité RGPD</p>
                      <p className="text-gray-400 text-xs">Respect des normes européennes de protection des données</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Accès contrôlé</p>
                      <p className="text-gray-400 text-xs">Seuls les pharmaciens autorisés peuvent consulter vos données</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommandations */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recommandations de sécurité</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white text-sm font-medium">Activez les notifications de sécurité</p>
                      <p className="text-gray-400 text-xs">Soyez alerté en cas d'activité suspecte</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                    <Lock className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-white text-sm font-medium">Utilisez un mot de passe fort</p>
                      <p className="text-gray-400 text-xs">Minimum 12 caractères avec majuscules, chiffres et symboles</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDropdowns;