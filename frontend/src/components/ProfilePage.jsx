import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Heart, Shield, Edit, Save, Camera } from 'lucide-react';

const ProfilePage = ({ user, onClose, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    sexe: user?.sexe || '',
    dateNaissance: user?.dateNaissance || '',
    adresse: {
      rue: user?.adresse?.rue || '',
      ville: user?.adresse?.ville || '',
      codePostal: user?.adresse?.codePostal || '',
      pays: user?.adresse?.pays || 'Guinée'
    },
    informationsMedicales: {
      allergies: user?.informationsMedicales?.allergies || [],
      conditions: user?.informationsMedicales?.conditions || [],
      medicamentsActuels: user?.informationsMedicales?.medicamentsActuels || [],
      groupeSanguin: user?.informationsMedicales?.groupeSanguin || ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      await onUpdateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Mon Profil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Photo de profil */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary-500 shadow-lg">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL || ''}${user.profileImage}`}
                    alt={`${user.prenom} ${user.nom}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                    <User className="h-16 w-16 text-primary-600" />
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full shadow-lg transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white">{user?.prenom} {user?.nom}</h3>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Edit className="h-5 w-5" />
                <span>Modifier le profil</span>
              </button>
            ) : (
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>Sauvegarder</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <span>Annuler</span>
                </button>
              </div>
            )}
          </div>

          {/* Informations personnelles */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-400" />
              Informations personnelles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-white bg-gray-700 rounded-lg px-3 py-2">{user?.prenom}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-white bg-gray-700 rounded-lg px-3 py-2">{user?.nom}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <p className="text-white bg-gray-700 rounded-lg px-3 py-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary-400" />
                  {user?.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-white bg-gray-700 rounded-lg px-3 py-2 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary-400" />
                    {user?.telephone || 'Non renseigné'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sexe</label>
                {isEditing ? (
                  <select
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Autre">Autre</option>
                  </select>
                ) : (
                  <p className="text-white bg-gray-700 rounded-lg px-3 py-2">{user?.sexe || 'Non renseigné'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date de naissance</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-white bg-gray-700 rounded-lg px-3 py-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary-400" />
                    {user?.dateNaissance || 'Non renseigné'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary-400" />
              Adresse
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Rue</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="adresse.rue"
                    value={formData.adresse.rue}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-white bg-gray-700 rounded-lg px-3 py-2">{user?.adresse?.rue || 'Non renseigné'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ville</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="adresse.ville"
                    value={formData.adresse.ville}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-white bg-gray-700 rounded-lg px-3 py-2">{user?.adresse?.ville || 'Non renseigné'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Code postal</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="adresse.codePostal"
                    value={formData.adresse.codePostal}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-white bg-gray-700 rounded-lg px-3 py-2">{user?.adresse?.codePostal || 'Non renseigné'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informations médicales */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-400" />
              Informations médicales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Groupe sanguin</label>
                {isEditing ? (
                  <select
                    name="informationsMedicales.groupeSanguin"
                    value={formData.informationsMedicales.groupeSanguin}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <p className="text-white bg-gray-700 rounded-lg px-3 py-2">{user?.informationsMedicales?.groupeSanguin || 'Non renseigné'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Allergies connues</label>
                <div className="text-white bg-gray-700 rounded-lg px-3 py-2 min-h-[40px]">
                  {user?.informationsMedicales?.allergies?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.informationsMedicales.allergies.map((allergie, index) => (
                        <span key={index} className="bg-red-600 text-white px-2 py-1 rounded text-sm">
                          {allergie}
                        </span>
                      ))}
                    </div>
                  ) : (
                    'Aucune allergie connue'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sécurité du compte */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-400" />
              Sécurité du compte
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">Mot de passe</p>
                  <p className="text-gray-400 text-sm">Dernière modification il y a 30 jours</p>
                </div>
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Modifier
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">Authentification à deux facteurs</p>
                  <p className="text-gray-400 text-sm">Sécurisez votre compte avec 2FA</p>
                </div>
                <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors">
                  Activer
                </button>
              </div>
            </div>
          </div>

          {/* Statistiques du compte */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Statistiques du compte</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary-400">12</p>
                <p className="text-gray-300 text-sm">Commandes passées</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-400">8</p>
                <p className="text-gray-300 text-sm">Ordonnances envoyées</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">3</p>
                <p className="text-gray-300 text-sm">Consultations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;