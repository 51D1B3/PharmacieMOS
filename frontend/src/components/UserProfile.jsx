import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, ChevronUp, LogOut, Phone } from 'lucide-react';

const UserProfile = ({ user, onLogout, onShowProfile }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    {
      icon: User,
      label: 'Mon profil',
      description: 'Gérer mes informations personnelles',
      action: () => onShowProfile && onShowProfile()
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
      >
        <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-primary-200">
          {user?.profileImage ? (
            <img 
              src={user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL || ''}${user.profileImage}`}
              alt={`${user.prenom} ${user.nom}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full bg-primary-100 flex items-center justify-center ${user?.profileImage ? 'hidden' : ''}`}>
            <User className="h-4 w-4 text-primary-600" />
          </div>
        </div>
        <span className="hidden md:block font-medium text-white">
          {user?.prenom} {user?.nom}
        </span>
        {showMenu ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {/* User Menu Dropdown */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary-200">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL || ''}${user.profileImage}`}
                    alt={`${user.prenom} ${user.nom}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-primary-100 flex items-center justify-center ${user?.profileImage ? 'hidden' : ''}`}>
                  <User className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {user?.prenom} {user?.nom}
                </h4>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  {user?.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.action();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <div className="flex-shrink-0">
                  <item.icon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <hr className="my-2" />

          {/* Logout */}
          <div className="py-2">
            <button
              onClick={() => {
                onLogout();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
