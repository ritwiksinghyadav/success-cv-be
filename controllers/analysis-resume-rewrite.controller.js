import { AppError, asyncHandler } from "../middleware/error.js";
import { addOrganisationMemberByUserId } from "../models/invite-member.model.js";
import { createOrg } from "../models/organisation.model.js";
import { createAnalysisRecord, createUserDocument } from "../models/resume-and-analysis.model.js";
import { getUserByIDModel } from "../models/user.model.js";
import { sendSuccess } from "../utils/apiHelpers.js";
import { memberTypeConstants } from "../utils/constants.js";
import { validateInteger } from "../utils/validate-helper.js";



export const createResumeController = asyncHandler(async (req, res, next) => {

    // const { id } = req.params;
    const id = req.userID
    console.log("USERID", req.userID);

    const validatedId = validateInteger(id, 'User ID');
    const user = await getUserByIDModel(validatedId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    //check req body
    if (!req.body || typeof req.body !== 'object') {
        return next(new AppError('Invalid request body', 400));
    }

    // Check for missing required fields
    const { title, fileURL, meta } = req.body;
    if (!title || !fileURL) {
        return next(new AppError('Missing required fields', 400));
    }

    const createdDocument = await createUserDocument(validatedId, {
        title,
        fileURL,
        meta
    });

    const createAnalysis = await createAnalysisRecord(validatedId, createdDocument.id, meta, {
        title,
        fileURL,
        meta
    });
    if (!createAnalysis) {
        return next(new AppError('Analysis creation failed', 500));
    }

    sendSuccess(res, { ...createAnalysis, steps: "Use the jobId to track the analysis process" }, "Document created successfully", 201);
});