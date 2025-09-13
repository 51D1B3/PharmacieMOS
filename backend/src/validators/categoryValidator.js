import Joi from 'joi';

export const createCategorySchema = Joi.object({
    name: Joi.string().required().min(3).max(50).trim(),
    description: Joi.string().optional().max(255).trim(),
    parentId: Joi.string().optional().hex().length(24), // Updated to parentId
    parent: Joi.string().optional().hex().length(24), // Backward compatibility
});

export const updateCategorySchema = Joi.object({
    name: Joi.string().min(3).max(50).trim(),
    description: Joi.string().max(255).trim(),
    parentId: Joi.string().hex().length(24).allow(null), // Updated to parentId
    parent: Joi.string().hex().length(24).allow(null), // Backward compatibility
}).min(1);

export const getCategoriesQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().trim().default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    name: Joi.string().trim(),
    parentId: Joi.string().hex().length(24), // Updated to parentId
    parent: Joi.string().hex().length(24), // Backward compatibility
});