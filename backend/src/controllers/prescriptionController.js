import Prescription from '../models/Prescription.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { notifyAdmins, notifyClient } from '../socket/socketHandler.js';

// @desc    Soumettre une nouvelle ordonnance
// @route   POST /api/prescriptions
// @access  Private
export const submitPrescription = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Aucune image d\'ordonnance fournie'
    });
  }

  const prescription = await Prescription.create({
    clientId: req.userId,
    clientName: `${req.user.prenom} ${req.user.nom}`,
    clientEmail: req.user.email,
    imageUrl: req.file.path, // URL Cloudinary
    cloudinaryPublicId: req.file.public_id
  });

  console.log(`✅ Nouvelle ordonnance reçue de ${req.user.email} - ID: ${prescription._id}`);

  // Notification temps réel aux admins
  notifyAdmins({
    id: prescription._id,
    clientName: prescription.clientName,
    clientEmail: prescription.clientEmail,
    imageUrl: prescription.imageUrl,
    submittedAt: prescription.submittedAt,
    message: `Nouvelle ordonnance de ${prescription.clientName}`
  });

  res.status(201).json({
    success: true,
    message: 'Ordonnance soumise avec succès',
    data: {
      prescription
    }
  });
});

// Alias pour compatibilité
export const createPrescription = submitPrescription;

// @desc    Obtenir les ordonnances du client
// @route   GET /api/prescriptions/my
// @access  Private
export const getMyPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ clientId: req.userId })
    .sort({ submittedAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      prescriptions
    }
  });
});

// @desc    Obtenir toutes les ordonnances (Admin)
// @route   GET /api/prescriptions/all
// @access  Private (Admin)
export const getAllPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find()
    .populate('clientId', 'nom prenom email telephone')
    .sort({ submittedAt: -1 });

  console.log(`📊 Admin consulte ${prescriptions.length} ordonnances`);

  res.status(200).json({
    success: true,
    data: {
      prescriptions
    }
  });
});

// @desc    Mettre à jour le statut d'une ordonnance (Admin)
// @route   PUT /api/prescriptions/:id
// @access  Private (Admin)
export const updatePrescriptionStatus = asyncHandler(async (req, res) => {
  const { status, pharmacistNotes, medications, estimatedTotal } = req.body;

  const prescription = await Prescription.findByIdAndUpdate(
    req.params.id,
    {
      status,
      pharmacistNotes,
      medications,
      estimatedTotal,
      processedAt: status !== 'pending' ? new Date() : undefined
    },
    { new: true, runValidators: true }
  ).populate('clientId', 'nom prenom email');

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Ordonnance non trouvée'
    });
  }

  console.log(`🔄 Ordonnance ${prescription._id} mise à jour: ${status}`);

  // Notification temps réel au client
  if (status === 'processed') {
    notifyClient(prescription.clientId._id, {
      prescriptionId: prescription._id,
      status,
      medications,
      pharmacistNotes,
      estimatedTotal,
      message: `Votre ordonnance a été traitée`
    });
  }

  res.status(200).json({
    success: true,
    message: 'Ordonnance mise à jour avec succès',
    data: {
      prescription
    }
  });
});
