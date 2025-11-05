import { AppError, asyncHandler } from "../middleware/error.js";
import { getProfileByUserId } from "../models/profile.model.js";
import { getUserByIDModel } from "../models/user.model.js";
import { sendSuccess } from "../utils/apiHelpers.js";
import { excludeFields } from "../utils/security-helper.js";
import { validateInteger } from "../utils/validate-helper.js";


// Get user by ID
export const getUserByIdController = asyncHandler(async (req, res, next) => {

    const { id } = req.params;
    const validatedId = validateInteger(id, 'User ID');
    const user = await getUserByIDModel(validatedId);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // const profile = await getProfileByUserId(validatedId);
    // if (profile) {
    //     user.profile = excludeFields(profile, ['userID', 'createdAt', 'updatedAt', 'deletedAt', 'id', 'candidateID']);
    // }

    sendSuccess(res, user, "User retrieved successfully");
});

export const getUserProfileByUserID = asyncHandler(async (req, res, next) => {

    const { id } = req.params;
    const validatedId = validateInteger(id, 'User ID');
    const user = await getUserByIDModel(validatedId);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const profile = await getProfileByUserId(validatedId);
    if (profile) {
        user.profile = excludeFields(profile, ['userID', 'createdAt', 'updatedAt', 'deletedAt', 'id', 'candidateID']);
    }

    sendSuccess(res, user, "User retrieved successfully");
});

