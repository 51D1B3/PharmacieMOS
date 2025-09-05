import React, { useState } from 'react';
import { Edit3, Trash2, X } from 'lucide-react';

const MessageContextMenu = ({ 
  message, 
  position, 
  onEdit, 
  onDelete, 
  onClose,
  canEdit = true 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEdit(message.id, editText.trim());
    }
    setIsEditing(false);
    onClose();
  };

  const handleCancelEdit = () => {
    setEditText(message.text);
    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      onDelete(message.id);
      onClose();
    }
  };

  if (isEditing) {
    return (
      <div 
        className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-80"
        style={{ 
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 150)
        }}
      >
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modifier le message
          </label>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            rows={3}
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCancelEdit}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSaveEdit}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            disabled={!editText.trim()}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-32"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 150),
        top: Math.min(position.y, window.innerHeight - 100)
      }}
    >
      {canEdit && (
        <button
          onClick={handleEdit}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
        >
          <Edit3 className="h-4 w-4" />
          <span>Modifier</span>
        </button>
      )}
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
      >
        <Trash2 className="h-4 w-4" />
        <span>Supprimer</span>
      </button>
    </div>
  );
};

export default MessageContextMenu;
