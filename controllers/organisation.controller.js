import { AppError, asyncHandler } from "../middleware/error.js";
import { createOrg } from "../models/organisation.model.js";
import { getProfileByUserId } from "../models/profile.model.js";
import { getUserByIDModel } from "../models/user.model.js";
import { sendSuccess } from "../utils/apiHelpers.js";
import { excludeFields } from "../utils/security-helper.js";
import { validateInteger } from "../utils/validate-helper.js";



export const createOrgByUserIDController = asyncHandler(async (req, res, next) => {

    const { id } = req.params;
    const validatedId = validateInteger(id, 'User ID');
    const user = await getUserByIDModel(validatedId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const createdOrg = await createOrg(validatedId, req.body);

    if (!createdOrg) {
        return next(new AppError('Organisation creation failed', 500));
    }

    sendSuccess(res, createdOrg, "Organisation created successfully");
});

