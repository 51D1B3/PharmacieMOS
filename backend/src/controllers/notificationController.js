const createNotification = async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      createdAt: new Date(),
      id: Date.now().toString()
    };

    // Ici vous pourriez sauvegarder en base de données
    console.log('Nouvelle notification:', notificationData);

    res.status(201).json({
      success: true,
      message: 'Notification créée avec succès',
      data: notificationData
    });
  } catch (error) {
    console.error('Erreur création notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la notification'
    });
  }
};

module.exports = {
  createNotification
};