import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js'; // Correction ici

// Créer une nouvelle ordonnance
export const createPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image requise' });
    }

    const prescription = await Prescription.create({
      clientId: req.user.id,
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename
    });

    await prescription.populate('clientId', 'nom prenom email telephone');

    res.status(201).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer toutes les ordonnances (admin)
export const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('clientId', 'nom prenom email telephone')
      .populate('processedBy', 'nom prenom')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mettre à jour le statut d'une ordonnance
export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        notes, 
        processedBy: req.user.id 
      },
      { new: true }
    ).populate('clientId', 'nom prenom email');

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
