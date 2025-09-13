import Joi from 'joi';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

const validate = (schema, property) => (req, res, next) => {
    const { error } = schema.validate(req[property]);
    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    return next();
};

export {
    validate,
};