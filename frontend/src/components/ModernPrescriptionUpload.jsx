import React, { useState, useRef } from 'react';
import { Upload, Camera, Check, AlertCircle, X, FileImage } from 'lucide-react';

const ModernPrescriptionUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
      setMessage('');
    } else {
      setMessage('Veuillez sélectionner une image valide');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        const pastedFile = item.getAsFile();
        handleFileSelect(pastedFile);
        break;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('prescription', file);

    try {
      const response = await fetch('http://localhost:5005/api/prescriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer test-token`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        setMessage('✅ Ordonnance envoyée avec succès!');
        setFile(null);
        setPreview(null);
      } else {
        setMessage('❌ ' + (data.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('❌ Serveur non disponible. Vérifiez que le serveur est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setMessage('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Envoyer une ordonnance</h2>
              <p className="text-green-100">Glissez, collez ou sélectionnez votre image</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Zone de drop */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragging 
                ? 'border-green-400 bg-green-50 scale-105' 
                : file 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onPaste={handlePaste}
            tabIndex={0}
          >
            {preview ? (
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Aperçu" 
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                />
                <button
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mt-4 flex items-center justify-center space-x-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">{file.name}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                  isDragging ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Upload className={`h-8 w-8 ${isDragging ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    {isDragging ? 'Déposez votre image ici' : 'Ajoutez votre ordonnance'}
                  </p>
                  <p className="text-gray-500 mb-4">
                    Glissez-déposez, collez (Ctrl+V) ou cliquez pour sélectionner
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <FileImage className="h-5 w-5" />
                    <span>Choisir un fichier</span>
                  </button>
                </div>
                
                <p className="text-xs text-gray-400">
                  Formats acceptés: JPG, PNG, WEBP (max 5MB)
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.includes('✅') ? (
                <Check className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span className="font-medium">{message}</span>
            </div>
          )}

          {/* Bouton d'envoi */}
          {file && (
            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Envoyer l'ordonnance</span>
                  </>
                )}
              </button>
              
              <button
                onClick={removeFile}
                className="px-6 py-4 border-2 border-gray-300 hover:border-red-400 hover:text-red-600 text-gray-600 rounded-xl font-semibold transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-4">💡 Conseils pour une meilleure qualité</h3>
        <ul className="text-base text-blue-700 space-y-2">
          <li>• Assurez-vous que l'ordonnance est bien éclairée</li>
          <li>• Évitez les reflets et les ombres</li>
          <li>• Vérifiez que le texte est lisible</li>
          <li>• Prenez la photo bien droite</li>
        </ul>
      </div>
    </div>
  );
};

export default ModernPrescriptionUpload;