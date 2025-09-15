import React, { useState } from 'react';
import { io } from 'socket.io-client';

const PrescriptionUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('prescription', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/prescriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Ordonnance envoyée avec succès!');
        setFile(null);
        e.target.reset();
      } else {
        setMessage('Erreur: ' + data.message);
      }
    } catch (error) {
      setMessage('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Envoyer une ordonnance</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner l'image de votre ordonnance
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Envoi...' : 'Envoyer l\'ordonnance'}
        </button>
      </form>
      
      {message && (
        <div className={`mt-4 p-3 rounded-md ${message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PrescriptionUpload;