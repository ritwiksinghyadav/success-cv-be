import { AppError, asyncHandler } from "../middleware/error.js";
import { acceptInvite, addOrganisationMemberByUserId, getAllMembersofOrganisation, getAllInvitesOfOrganisation, inviteSingleMember, ResendInvite } from "../models/invite-member.model.js";
import { createOrg, getOrgsByUserID } from "../models/organisation.model.js";
import { getProfileByUserId } from "../models/profile.model.js";
import { getUserByIDModel } from "../models/user.model.js";
import { sendSuccess } from "../utils/apiHelpers.js";
import { memberTypeConstants } from "../utils/constants.js";
import { excludeFields } from "../utils/security-helper.js";
import { validateEmail, validateInteger } from "../utils/validate-helper.js";



export const createOrgByUserIDController = asyncHandler(async (req, res, next) => {

    // const { id } = req.params;
    const id = req.userID
    console.log("USERID", req.userID);

    const validatedId = validateInteger(id, 'User ID');
    const user = await getUserByIDModel(validatedId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const createdOrg = await createOrg(validatedId, req.body);

    if (!createdOrg) {
        return next(new AppError('Organisation creation failed', 500));
    }
    const createMember = await addOrganisationMemberByUserId(createdOrg.id, validatedId, null, memberTypeConstants.ADMIN);
    sendSuccess(res, createdOrg, "Organisation created successfully");
});

export const inviteAMemberController = asyncHandler(async (req, res, next) => {

    const { email, role = memberTypeConstants.MEMBER } = req.body;
    const { id } = req.params;

    const validatedOrgId = validateInteger(id, 'Organisation ID');
    const validatedEmail = validateEmail(email);

    const result = await inviteSingleMember(req.userID, validatedOrgId, validatedEmail, role);

    sendSuccess(res, result.inviteLink, "Member invited successfully", 200);
})

export const acceptInviteController = asyncHandler(async (req, res, next) => {
    const { inviteID } = req.params;
    const userId = req.userID;

    const result = await acceptInvite(inviteID, userId);

    sendSuccess(res, result, "Invite accepted successfully", 200);
});

export const resendInviteController = asyncHandler(async (req, res, next) => {
    const { inviteID } = req.params;
    const userId = req.userID;

    const result = await ResendInvite(inviteID);

    sendSuccess(res, result.inviteLink, "Invite resent successfully", 200);
});

export const getAllMembersofOrganisationController = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const result = await getAllMembersofOrganisation(id);

    sendSuccess(res, result, "Organisation members retrieved successfully", 200);
});

export const getAllInvitesOfOrganisationController = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const result = await getAllInvitesOfOrganisation(id);

    sendSuccess(res, result, "Organisation invites retrieved successfully", 200);
});

export const getOrgsByUserIDController = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const validatedId = validateInteger(id, 'User ID');
    const user = await getUserByIDModel(validatedId);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const organisations = await getOrgsByUserID(validatedId);

    sendSuccess(res, organisations, "User organisations retrieved successfully", 200);
});

export const getAllCandidatesOfOrganisationController = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const validatedOrgId = validateInteger(id, 'Organisation ID');

    // Import the function dynamically to avoid circular dependencies
    const { getCandidatesByOrganisationId } = await import('../models/candidate.model.js');
    const candidates = await getCandidatesByOrganisationId(validatedOrgId);

    sendSuccess(res, candidates, "Organisation candidates retrieved successfully", 200);
});
