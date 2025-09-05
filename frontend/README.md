# PharmaConnect - Frontend Client

Application frontend moderne pour la gestion de pharmacie en ligne avec interface utilisateur interactive et responsive.

## 🚀 Fonctionnalités Principales

### 🔍 Barre de Recherche Avancée
- **Recherche instantanée** : Recherche en temps réel des médicaments par nom, marque ou catégorie
- **Filtres avancés** : 
  - Catégories (Antibiotiques, Antalgiques, Vitamines, etc.)
  - Fourchettes de prix (0-10€, 10-25€, 25-50€, 50€+)
  - Type de prescription (Avec/Sans ordonnance)
  - Disponibilité en stock
- **Résultats en dropdown** : Affichage instantané avec images, prix et statut de stock
- **Ajout rapide au panier** : Clic pour ajouter directement depuis les résultats

### 🏠 Section Hero/Bannière Interactive
- **Carrousel automatique** : Rotation des messages promotionnels toutes les 5 secondes
- **Messages dynamiques** :
  - Accueil personnalisé
  - Promotions spéciales
  - Conseils santé
- **Éléments flottants animés** : Icônes avec animations CSS
- **Cartes d'information** : Horaires, localisation, contact
- **Conseil santé du jour** : Message informatif avec design attractif

### 💊 Catalogue de Produits Amélioré
- **Cartes produits interactives** :
  - Images avec hover effects
  - Badges de statut (Stock limité, Rupture, Ordonnance requise)
  - Actions rapides (Voir détails, Ajouter au panier)
  - Informations complètes (Prix, stock, description)
- **Sections organisées** :
  - Produits populaires
  - Promotions spéciales
  - Catalogue complet
- **Filtres et tri** : Par catégorie, prix, popularité

### ⭐ Produits Populaires et Promotions
- **Section dédiée** : Mise en avant des produits les plus populaires
- **Badges promotionnels** : Indicateurs visuels des réductions
- **Design attractif** : Icônes et couleurs pour attirer l'attention

### 📅 Suivi des Réservations
- **Widget interactif** : Affichage des réservations en cours
- **Statuts visuels** :
  - En attente (Jaune)
  - Validée (Bleu)
  - Retirée (Vert)
  - Annulée (Rouge)
- **Actions rapides** : Voir détails, annuler (si en attente)
- **Informations détaillées** : Nombre d'articles, montant, date

### 🛒 Panier Rapide (Mini-Cart)
- **Aperçu compact** : Affichage des 4 premiers articles
- **Contrôles de quantité** : Plus/Moins avec validation
- **Suppression rapide** : Bouton pour retirer des articles
- **Calcul automatique** : Total en temps réel
- **Actions principales** : Voir panier complet, Commander, Réserver
- **Conseils** : Informations sur la livraison gratuite

### 🔔 Centre de Notifications
- **Notifications en temps réel** :
  - Nouveaux produits en stock
  - Promotions spéciales
  - Statut des réservations
  - Alertes importantes
- **Filtres** : Toutes, Non lues, Par type
- **Marquage comme lu** : Clic pour marquer comme lue
- **Compteur visuel** : Badge avec nombre de notifications non lues

### 💬 Widget Chat Pharmacien
- **Chat en temps réel** : Connexion Socket.IO
- **Interface intuitive** : Bouton flottant, fenêtre coulissante
- **Historique des messages** : Conservation des conversations
- **Notifications** : Alertes de nouveaux messages
- **Responsive** : Adaptation mobile et desktop

### 👤 Profil Utilisateur Amélioré
- **Menu déroulant complet** :
  - Informations utilisateur
  - Accès rapide au profil
  - Historique des commandes
  - Paramètres
  - Déconnexion
- **Design moderne** : Interface claire et organisée

## 🛠️ Technologies Utilisées

- **React 18** : Framework principal
- **Tailwind CSS** : Styling et design system
- **Lucide React** : Icônes modernes
- **Socket.IO Client** : Communication temps réel
- **Axios** : Gestion des requêtes API

## 🎨 Design System

### Couleurs
- **Primary** : Vert pharmacie (#16a34a)
- **Secondary** : Gris neutre (#64748b)
- **Success** : Vert (#22c55e)
- **Warning** : Jaune (#f59e0b)
- **Error** : Rouge (#ef4444)
- **Info** : Bleu (#3b82f6)

### Composants
- **Cards** : Conteneurs avec ombres et bordures
- **Buttons** : Styles primaire et secondaire
- **Inputs** : Champs avec focus states
- **Modals** : Fenêtres modales et drawers

## 📱 Responsive Design

L'application est entièrement responsive avec :
- **Mobile First** : Design optimisé pour mobile
- **Breakpoints** : sm, md, lg, xl
- **Navigation adaptative** : Menu hamburger sur mobile
- **Grilles flexibles** : Adaptation automatique des colonnes

## 🚀 Installation et Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm start

# Build de production
npm run build
```

## 🔧 Configuration

### Variables d'environnement
```env
REACT_APP_API_URL=http://localhost:5000/api
NODE_ENV=development
```

### API Endpoints
- `GET /api/products` - Liste des produits
- `GET /api/reservations` - Réservations utilisateur
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription

## 📊 Performance

- **Lazy Loading** : Chargement à la demande
- **Debounced Search** : Recherche optimisée
- **Memoization** : Composants optimisés
- **Bundle Splitting** : Code divisé par routes

## 🔒 Sécurité

- **Authentification JWT** : Tokens sécurisés
- **Intercepteurs Axios** : Gestion automatique des tokens
- **Validation côté client** : Vérification des données
- **HTTPS** : Communication sécurisée

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests de couverture
npm run test:coverage

# Tests E2E
npm run test:e2e
```

## 📈 Améliorations Futures

- [ ] Mode sombre
- [ ] Notifications push
- [ ] PWA (Progressive Web App)
- [ ] Intégration paiement
- [ ] Géolocalisation
- [ ] Scanner de codes-barres
- [ ] Rappels de médicaments
- [ ] Intégration calendrier

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Email : support@pharmaconnect.com
- Documentation : [docs.pharmaconnect.com](https://docs.pharmaconnect.com)
- Issues : [GitHub Issues](https://github.com/pharmaconnect/frontend/issues)
