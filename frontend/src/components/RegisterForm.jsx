import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, AlertCircle, CheckCircle, ArrowRight, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    sexe: '',
    profileImage: null,
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profileImage: e.target.files[0],
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('prenom', formData.prenom);
    data.append('nom', formData.nom);
    data.append('email', formData.email);
    data.append('password', formData.password);
    if (formData.telephone) data.append('telephone', formData.telephone);
    if (formData.sexe) data.append('sexe', formData.sexe);
    if (formData.profileImage) data.append('profileImage', formData.profileImage);

    try {
      await register(data);
      setSuccess('Compte créé avec succès ! Redirection...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Erreur lors de la création du compte');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-200 to-teal-300 dark:from-gray-800 dark:via-gray-900 dark:to-black py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden animate-gradientShift">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-300/30 via-emerald-300/30 to-teal-300/30 animate-gradientShift"></div>
        
        {/* Interactive morphing blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-300/40 to-emerald-400/40 animate-morphBlob interactive-blob mix-blend-multiply filter blur-2xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-300/35 to-teal-400/35 animate-morphBlob interactive-blob animation-delay-2000 mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-40 left-40 w-72 h-72 bg-gradient-to-bl from-teal-300/30 to-green-400/30 animate-morphBlob interactive-blob animation-delay-4000 mix-blend-multiply filter blur-xl"></div>
        
        {/* Interactive floating elements */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-lime-300/20 to-green-400/20 rounded-full animate-float pulse-on-hover filter blur-lg"></div>
        <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-gradient-to-l from-emerald-300/25 to-teal-400/25 rounded-full animate-float pulse-on-hover animation-delay-2000 filter blur-md"></div>
        
        {/* Interactive ripple zones */}
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-r from-green-400/15 to-emerald-500/15 rounded-full ripple-effect animate-float"></div>
        <div className="absolute bottom-20 left-10 w-20 h-20 bg-gradient-to-l from-teal-400/20 to-green-500/20 rounded-full ripple-effect animate-float animation-delay-2000"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '20px 20px'}}></div>
      </div>
      
      {/* Bouton retour vers LandingPage */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 group flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-white/20"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="hidden sm:inline">Accueil</span>
      </Link>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center animate-fadeInUp">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-green-500 shadow-lg transform hover:scale-105 transition-transform duration-300 animate-float">
            <UserPlus className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="mt-6 text-center text-4xl font-bold bg-gradient-to-r from-primary-600 to-green-600 dark:from-primary-400 dark:to-green-400 bg-clip-text text-transparent">
            Rejoignez-nous !
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600 dark:text-gray-300 font-medium">
            Créez votre compte PharmaMOS
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/50 animate-slideInRight">
        <form className="space-y-6" onSubmit={handleSubmit} encType="multipart/form-data" aria-busy={loading}>
          {error && (
            <div className="rounded-xl bg-red-50 p-4 border-l-4 border-red-400 animate-shake">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 animate-bounce" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-green-50 p-4 border-l-4 border-green-400">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 animate-pulse" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{success}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prénom
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-primary-300"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-primary-300"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-primary-300"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Téléphone (optionnel)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-primary-300"
                  placeholder="+224 XXX XX XX XX"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sexe" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sexe (optionnel)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="sexe"
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-primary-300"
                >
                  <option value="">Sélectionnez votre sexe</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Photo de profil (optionnel)
              </label>
              <div className="mt-1 space-y-3">
                {formData.profileImage && (
                  <div className="flex items-center space-x-3">
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary-200">
                      <img
                        src={URL.createObjectURL(formData.profileImage)}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{formData.profileImage.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(formData.profileImage.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, profileImage: null })}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
                <input
                  id="profileImage"
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-primary-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-gray-600 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-gray-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-primary-300"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-primary-300"
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Création en cours...
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Créer mon compte</span>
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                Connectez-vous
              </Link>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
