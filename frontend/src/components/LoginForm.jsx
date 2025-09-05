import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      // Redirect based on user role
      if (user.role === 'admin' || user.role === 'pharmacist') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-200 to-teal-300 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden animate-gradientShift">
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
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center animate-fadeInUp">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-green-500 shadow-lg transform hover:scale-105 transition-transform duration-300 animate-float">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="mt-6 text-center text-4xl font-bold bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
            Bienvenue !
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600 font-medium">
            Connectez-vous à votre espace PharmaMOS
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 animate-slideInRight">
        <form className="space-y-6" onSubmit={handleSubmit}>
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

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-primary-300"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-primary-300"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-primary-600 transition-colors duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-primary-600 transition-colors duration-200" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
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
                  Connexion en cours...
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Se connecter</span>
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Créez votre compte
              </Link>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
