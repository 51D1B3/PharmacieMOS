import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import StockMovement from '../models/StockMovement.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { getIO } from '../socket/io.js';

// @desc    Récupérer toutes les commandes avec pagination et filtres
// @route   GET /api/orders
// @access  Private (Admin, Pharmacist)
export const getOrders = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        status,
        orderType,
        customerId,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    // Construire la requête
    const query = {};

    // Filtres
    if (status) query.status = status;
    if (orderType) query.orderType = orderType;
    if (customerId) query.customer = customerId;
    if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Options de tri
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Exécuter la requête
    const orders = await Order.find(query)
        .populate('customer', 'nom prenom email telephone')
        .populate('seller', 'nom prenom')
        .populate('items.product', 'name sku priceTTC images')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    // Compter le total
    const total = await Order.countDocuments(query);

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
        success: true,
        data: orders,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNextPage,
            hasPrevPage
        }
    });
});

// @desc    Récupérer une commande par ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('customer', 'nom prenom email telephone adresse')
        .populate('seller', 'nom prenom')
        .populate('items.product', 'name sku priceTTC images description')
        // no createdBy field in schema

    if (!order) {
        throw new AppError('Commande non trouvée', 404);
    }

    // Vérifier l'accès (client peut voir ses propres commandes, admin/pharmacist peuvent voir toutes)
    if (req.user.role === 'client' && order.customer._id.toString() !== req.user.id) {
        throw new AppError('Accès non autorisé', 403);
    }

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Créer une nouvelle commande
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
    const {
        items,
        orderType = 'commande',
        deliveryMethod = 'pickup',
        shippingAddress,
        contactInfo,
        payment = {},
        notes,
        couponCode,
        status
    } = req.body;

    const paymentMethod = payment.method || 'cash';

    if (!items || items.length === 0) {
        throw new AppError('La commande doit contenir au moins un article', 400);
    }

    // Vérifier et calculer les prix des produits
    const orderItems = [];
    let subtotalHT = 0;
    let subtotalTTC = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    for (const item of items) {
        const product = await Product.findById(item.product || item.productId);
        if (!product) {
            throw new AppError(`Produit non trouvé: ${item.product || item.productId}`, 400);
        }

        if (!product.isActive) {
            throw new AppError(`Produit non disponible: ${product.name}`, 400);
        }

        // Vérifier le stock
        if (product.stock.onHand < item.quantity) {
            throw new AppError(`Stock insuffisant pour ${product.name}`, 400);
        }

        // Vérifier la prescription si nécessaire
        if (product.isPrescriptionRequired && !item.prescription) {
            throw new AppError(`Prescription requise pour ${product.name}`, 400);
        }

        const itemTotalTTC = product.priceTTC * item.quantity;
        const itemDiscount = item.discount || 0;
        const itemPriceHT = Math.round((product.priceTTC / (1 + (product.taxRate || 0) / 100)) * 100) / 100;
        const itemTotalHT = Math.round((itemPriceHT * item.quantity) * 100) / 100;

        orderItems.push({
            productId: product._id,
            quantity: item.quantity,
            unitPrice: product.priceTTC,
            totalPrice: itemTotalTTC,
            discount: itemDiscount,
            prescription: item.prescription,
            notes: item.notes,
            priceHT: item.priceHT || itemPriceHT,
            priceTTC: item.priceTTC || product.priceTTC,
            taxRate: item.taxRate || product.taxRate || 0,
            totalHT: item.totalHT || itemTotalHT,
            totalTTC: item.totalTTC || (itemTotalTTC - itemDiscount)
        });

        subtotalHT += itemTotalHT;
        subtotalTTC += (itemTotalTTC - itemDiscount);
        taxTotal += Math.max(0, (product.priceTTC - itemPriceHT) * item.quantity);
        discountTotal += itemDiscount;
    }

    // Calculer les totaux
    const shippingCost = deliveryMethod === 'delivery' ? 2000 : 0; // 2000 GNF pour la livraison
    const totalHT = subtotalHT + shippingCost;
    const totalTTC = subtotalTTC + shippingCost;

    // Créer la commande
    const order = await Order.create({
        customer: req.user.role === 'client' ? req.user.id : req.body.customerId,
        orderType,
        deliveryMethod,
        shippingAddress,
        contactInfo,
        payment: {
            method: paymentMethod,
            status: payment.status || 'pending',
            amount: payment.amount || totalTTC,
            paidAt: payment.paidAt || (payment.status === 'paid' ? new Date() : null)
        },
        status: status || 'pending',
        items: orderItems.map(i => ({
            product: i.productId,
            quantity: i.quantity,
            priceHT: i.priceHT,
            priceTTC: i.priceTTC,
            taxRate: Math.round(((i.priceTTC - i.priceHT) / i.priceHT) * 100),
            discount: i.discount || 0,
            totalHT: Math.round((i.priceHT * i.quantity) * 100) / 100,
            totalTTC: Math.round(((i.priceTTC * i.quantity) - i.discount) * 100) / 100,
            prescription: i.prescription,
            notes: i.notes
        })),
        subtotalHT,
        subtotalTTC,
        taxTotal,
        discountTotal,
        shippingCost,
        totalHT,
        totalTTC,
        notes: notes ? { customer: notes } : undefined,
        coupon: couponCode ? { code: couponCode } : undefined,
        seller: req.user.role !== 'client' ? req.user.id : null
    });

    // Gérer le stock selon le type de commande et le statut
    if (orderType === 'vente_pos' && status === 'completed') {
        // Pour les ventes POS terminées, déduire directement du stock
        for (const item of orderItems) {
            const product = await Product.findById(item.productId);
            if (product) {
                const stockBefore = product.stock.onHand;
                product.stock.onHand = Math.max(0, product.stock.onHand - item.quantity);
                await product.save();

                // Enregistrer le mouvement de stock
                await StockMovement.create({
                    productId: item.productId,
                    type: 'out',
                    quantity: item.quantity,
                    reference: `Order ${order.orderNumber}`,
                    referenceType: 'sales_order',
                    referenceId: order._id,
                    stockBefore: stockBefore,
                    stockAfter: product.stock.onHand,
                    reason: 'sale',
                    notes: `Vente POS - ${order.orderNumber}`,
                    createdBy: req.user.id
                });

                // Mettre à jour les statistiques du produit
                await product.addSale(item.quantity, item.totalTTC);
            }
        }
    } else {
        // Réserver le stock pour les autres types de commandes
        for (const item of orderItems) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock.reserved += item.quantity;
                await product.save();
            }
        }
    }

    // Populate les relations
    await order.populate('customer', 'nom prenom email telephone');
    await order.populate('items.product', 'name sku priceTTC images');

    // Émettre un événement Socket.IO
    const io = getIO();
    if (io && io.emitOrderUpdate) {
        io.emitOrderUpdate(order, 'created');
    }

    logger.info(`Commande créée: ${order.orderNumber} par ${req.user.email}`);

    res.status(201).json({
        success: true,
        data: order
    });
});

// @desc    Mettre à jour le statut d'une commande
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin, Pharmacist)
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new AppError('Commande non trouvée', 404);
    }

    // Vérifier les transitions de statut autorisées
    const allowedTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready', 'cancelled'],
        ready: ['shipped', 'delivered', 'cancelled'],
        shipped: ['delivered', 'refunded'],
        delivered: ['refunded'],
        cancelled: [],
        refunded: [],
        failed: []
    };

    const currentStatus = order.status;
    const allowedNextStatuses = allowedTransitions[currentStatus];

    if (!allowedNextStatuses.includes(status)) {
        throw new AppError(`Transition de statut non autorisée: ${currentStatus} → ${status}`, 400);
    }

    // Gérer les actions spécifiques selon le statut
    if (status === 'cancelled') {
        // Libérer le stock réservé, ne pas toucher onHand
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock.reserved = Math.max(0, product.stock.reserved - item.quantity);
                await product.save();

                // Enregistrer un mouvement type adjustment (trace), sans effet sur onHand
                await StockMovement.create({
                    productId: item.product,
                    type: 'adjustment',
                    quantity: 0,
                    reference: `Order ${order.orderNumber} cancelled`,
                    referenceType: 'sales_order',
                    referenceId: order._id,
                    stockBefore: product.stock.onHand,
                    stockAfter: product.stock.onHand,
                    reason: 'adjustment',
                    notes: `Annulation de commande ${order.orderNumber}`,
                    createdBy: req.user.id
                });
            }
        }
    } else if (status === 'preparing') {
        // Déduire le stock (vente en préparation) en utilisant les mouvements
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                // Libérer la partie réservée équivalente
                product.stock.reserved = Math.max(0, product.stock.reserved - item.quantity);
                await product.save();

                await StockMovement.create({
                    productId: item.product,
                    type: 'out',
                    quantity: item.quantity,
                    reference: `Order ${order.orderNumber}`,
                    referenceType: 'sales_order',
                    referenceId: order._id,
                    stockBefore: product.stock.onHand,
                    stockAfter: Math.max(0, product.stock.onHand - item.quantity),
                    reason: 'sale',
                    notes: `Vente pour commande ${order.orderNumber}`,
                    createdBy: req.user.id
                });
            }
        }
    }

    // Mettre à jour le statut
    order.status = status;
    order.statusHistory.push({
        status,
        timestamp: new Date(),
        updatedBy: req.user.id,
        notes: notes || `Statut changé de ${currentStatus} à ${status}`
    });

    await order.save();

    // Émettre un événement Socket.IO
    const io = getIO();
    if (io && io.emitOrderUpdate) {
        io.emitOrderUpdate(order, 'status_updated');
    }

    logger.info(`Statut de commande mis à jour: ${order.orderNumber} ${currentStatus} → ${status} par ${req.user.email}`);

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Récupérer les commandes d'un client
// @route   GET /api/orders/my-orders
// @access  Private (Client)
export const getMyOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;

    const query = { customer: req.user.id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
        .populate('items.product', 'name sku priceTTC images')
        .populate('seller', 'nom prenom')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
        success: true,
        data: orders,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
        }
    });
});

// @desc    Annuler une commande
// @route   POST /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new AppError('Commande non trouvée', 404);
    }

    // Vérifier l'autorisation
    if (req.user.role === 'client' && order.customerId.toString() !== req.user.id) {
        throw new AppError('Accès non autorisé', 403);
    }

    // Vérifier que la commande peut être annulée
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
        throw new AppError('Cette commande ne peut plus être annulée', 400);
    }

    // Mettre à jour le statut
    await updateOrderStatus(req, res);
});

// @desc    Récupérer les statistiques des commandes
// @route   GET /api/orders/stats
// @access  Private (Admin, Pharmacist)
export const getOrderStats = asyncHandler(async (req, res) => {
    const { period = '30d' } = req.query;

    // Calculer la date de début selon la période
    const startDate = new Date();
    switch (period) {
        case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(startDate.getDate() - 90);
            break;
        case '1y':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        default:
            startDate.setDate(startDate.getDate() - 30);
    }

    // Statistiques générales
    const totalOrders = await Order.countDocuments({
        createdAt: { $gte: startDate }
    });

    const totalRevenue = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: { $in: ['completed', 'delivered'] }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$total' }
            }
        }
    ]);

    // Statistiques par statut
    const statusStats = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Statistiques par jour
    const dailyStats = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$createdAt'
                    }
                },
                orders: { $sum: 1 },
                revenue: {
                    $sum: {
                        $cond: [
                            { $in: ['$status', ['completed', 'delivered']] },
                            '$total',
                            0
                        ]
                    }
                }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            period,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            statusStats,
            dailyStats
        }
    });
});
