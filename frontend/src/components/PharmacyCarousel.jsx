import React, { useState, useEffect } from 'react';

const PharmacyCarousel = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Images de pharmacie (URLs d'exemple - remplacez par vos vraies images)
  const pharmacyImages = [
    '/images/PHARMA_3.jpg',
    '/images/medecin-ethnique.jpg',
    '/images/pharmaciste-qui-organise-des-medicaments.jpg',
    '/images/vue-rapprochee-dune-main.jpg',
    '/images/armes-modernes.jpg',
    '/images/panier-medicament.jpg',
    '/images/deux-pharmaciens-afro-americains.jpg'
  ];  

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % pharmacyImages.length
      );
    }, 3000); // Change d'image toutes les 3 secondes

    return () => clearInterval(interval);
  }, [pharmacyImages.length]);

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="relative w-full" style={{height: '480px'}}>
        <img
          src={pharmacyImages[currentImageIndex]}
          alt={`PharmaMOS ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-semibold">Votre PharmaMOS de Confiance</h3>
          <p className="text-sm opacity-90">Services professionnels et conseils personnalisés</p>
        </div>
        
        {/* Indicateurs */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {pharmacyImages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Cadre avec logo en transparence et texte défilant */}
      <div className="relative w-full bg-white bg-opacity-90 overflow-hidden mt-6" style={{height: '240px'}}>
        {/* Logo en arrière-plan avec transparence */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-20"
          style={{
            backgroundImage: 'url(/images/LogoPharma.jpg)',
            backgroundSize: 'contain'
          }}
        ></div>
        
        {/* Texte défilant */}
        <div className="relative z-10 h-full flex items-center overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-2xl font-bold text-primary-600">
            BIENVENUE A LA PHARMACIE MOS VOTRE SANTE EST NOTRE PRIORITE. OUVERT TOUS LES JOURS DE 8H A 22H. CONTACTEZ LE (+224 623 84 11 49)
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyCarousel;
