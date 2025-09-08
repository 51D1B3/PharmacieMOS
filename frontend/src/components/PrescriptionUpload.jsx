import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, X, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const PrescriptionUpload = () => {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.includes('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      return isValidType && isValidSize;
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setUploading(true);
    
    try {
      // Créer FormData pour l'upload
      const formData = new FormData();
      uploadedFiles.forEach((file, index) => {
        formData.append(`prescriptions`, file);
      });
      
      // Ajouter les métadonnées
      formData.append('clientId', user?._id || 'anonymous');
      formData.append('clientName', user ? `${user.prenom} ${user.nom}` : 'Client anonyme');
      formData.append('uploadDate', new Date().toISOString());
      
      // Envoyer les fichiers au backend
      const response = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const uploadResult = await response.json();
        
        // Envoyer notification à l'admin avec les détails de l'ordonnance
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            type: 'prescription',
            title: 'Nouvelle ordonnance reçue',
            message: `${user ? `${user.prenom} ${user.nom}` : 'Un client'} a envoyé une ordonnance à valider`,
            targetRole: 'admin',
            data: {
              prescriptionId: uploadResult.data?._id || uploadResult._id,
              clientId: user?._id,
              clientName: user ? `${user.prenom} ${user.nom}` : 'Client anonyme',
              clientEmail: user?.email,
              fileCount: uploadedFiles.length,
              uploadDate: new Date().toISOString(),
              status: 'pending'
            }
          })
        });
        
        setUploadSuccess(true);
        
        // Show success message for 5 seconds
        setTimeout(() => {
          setUploadSuccess(false);
          setUploadedFiles([]);
        }, 5000);
      } else {
        throw new Error('Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'envoi de l\'ordonnance. Veuillez réessayer.');
    } finally {
      setUploading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
          <FileText className="h-8 w-8" />
          <span>Télécharger votre ordonnance</span>
        </h3>
        <p className="text-blue-100 mt-2">
          Envoyez votre ordonnance en PDF ou image pour vérification par notre pharmacien
        </p>
      </div>

      <div className="p-6">
        {/* Zone de téléchargement */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleChange}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Glissez-déposez vos fichiers ici
              </h4>
              <p className="text-gray-600 mb-4">
                ou cliquez pour sélectionner des fichiers
              </p>
              
              <button
                onClick={onButtonClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Choisir des fichiers
              </button>
            </div>
            
            <p className="text-sm text-gray-500">
              Formats acceptés: PDF, JPG, PNG (max 10MB par fichier)
            </p>
          </div>
        </div>

        {/* Liste des fichiers téléchargés */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Fichiers sélectionnés:</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {file.type.includes('image/') ? (
                      <Image className="h-5 w-5 text-blue-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton d'envoi */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Envoyer au pharmacien</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Message de succès */}
        {uploadSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black bg-opacity-50 absolute inset-0"></div>
            <div className="bg-white rounded-lg p-8 shadow-xl relative z-10 max-w-md mx-4">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ordonnance envoyée avec succès !
                </h3>
                <p className="text-gray-600">
                  Votre ordonnance a été transmise au pharmacien pour vérification. 
                  Vous recevrez une réponse sous peu.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informations importantes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-semibold text-blue-900 mb-1">Information importante</h5>
              <p className="text-sm text-blue-800">
                Votre ordonnance sera vérifiée par notre pharmacien qualifié. 
                Il vous contactera pour confirmer la disponibilité des médicaments 
                et organiser la préparation de votre commande.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionUpload;
