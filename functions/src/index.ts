import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {CallableContext, HttpsError} from 'firebase-functions/lib/providers/https';
import {UserRecord} from 'firebase-functions/lib/providers/auth';
import ListUsersResult = admin.auth.ListUsersResult;

admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

/**
 * Boiler Code
 */
export const demo = functions.https.onCall(async (data: any, context: CallableContext) => {
    try {
        if (context) {
            if (context.auth) {
                if (context.auth.token.admin === true) {
                    console.log('jaiowejf');
                }
            }
        }
    } catch (e) {
        console.log(e);
        return e;
    }
});

/**
 * Trigger when an user being deleted
 */
export const userOnDelete = functions.auth.user().onDelete(async (user: UserRecord, context: functions.EventContext) => {
    try {
        await admin.firestore().doc(`users/${user.uid}`).delete();
        const message = `User Document ${user.email} has been deleted`;
        console.log(message);
        return message;
    } catch (e) {
        console.log(e);
        throw new HttpsError('invalid-argument', e.message);
    }
});

/**
 * Delete User from Authentication
 * Executed by Admin or Dev
 */
export const deleteUserByAdmin = functions.https.onCall(async (data: any, context: CallableContext) => {
    try {
        if (context.auth !== undefined) {
            if (context.auth.token.DEV === true || context.auth.token.ADMIN === true) {
                const toDeleteUser = await admin.auth().getUserByEmail(data.email);
                await admin.auth().deleteUser(toDeleteUser.uid);
                const message = `User ${toDeleteUser.email} has been deleted...`;
                console.log(message);
                return message;
            } else {
                const currentUser = await admin.auth().getUser(context.auth.uid);
                throw new HttpsError('permission-denied', `${currentUser.email} doesn't have claim DEV or ADMIN`);
            }
        } else {
            throw new HttpsError('unauthenticated', `Unauthorised access`);
        }
    } catch (e) {
        console.log(e);
        throw new HttpsError('invalid-argument', e.message);
    }
});

/**
 * Get one User from Authentication
 */
export const getUserById = functions.https.onCall(async (data: any, context: CallableContext) => {
    try {
        if (context.auth !== undefined) {
            if (context.auth.token.DEV === true || context.auth.token.ADMIN === true) {
                const userRecord: UserRecord = await admin.auth().getUser(data.userId);
                return userRecord;
            } else {
                if (context.auth) {
                    if (context.auth.token.uid === data.userId) {
                        const userRecord: UserRecord = await admin.auth().getUser(data.userId);
                        return userRecord;
                    } else {
                        throw new HttpsError('unauthenticated', `Unauthorised access`);
                    }
                }
                throw new HttpsError('permission-denied', `User doesn't have claim DEV or ADMIN`);
            }
        } else {
            throw new HttpsError('unauthenticated', `Unauthorised access`);
        }
    } catch (e) {
        console.log(e);
        throw new HttpsError('invalid-argument', e.message);
    }
});

/**
 * Get All Users from Authentication
 * Executed by Admin or Dev
 */
export const getAllUsersByAdmin = functions.https.onCall(async (data: any, context: CallableContext) => {
    try {
        if (context.auth !== undefined) {
            if (context.auth.token.DEV === true) {
                const listUsersResult: ListUsersResult = await admin.auth().listUsers();
                console.log(listUsersResult.users);
                return listUsersResult.users;
            } else {
                if (context.auth.token.ADMIN === true) {
                    const listUsersResult: ListUsersResult = await admin.auth().listUsers();
                    // @ts-ignore
                    listUsersResult.users = listUsersResult.users.filter(user => user.customClaims.DEV === undefined);
                    console.log(listUsersResult.users);
                    return listUsersResult.users;
                } else {
                    const currentUser = await admin.auth().getUser(context.auth.uid);
                    throw new HttpsError('permission-denied', `${currentUser.email} doesn't have claim DEV or ADMIN`);
                }
            }
        } else {
            throw new HttpsError('unauthenticated', `Unauthorised access`);
        }

    } catch (e) {
        console.log(e);
        throw new HttpsError('invalid-argument', e.message);
    }
});

/**
 * Update another User's Email
 * Executed by Admin or Dev
 */
export const updateEmailByAdmin = functions.https.onCall(async (data: any, context: CallableContext) => {
    try {
        if (context.auth !== undefined) {
            if (context.auth.token.DEV === true || context.auth.token.ADMIN === true) {
                const toUpdateUser: UserRecord = await admin.auth().getUserByEmail(data.email);
                const updatedUser: UserRecord = await admin.auth().updateUser(toUpdateUser.uid, {
                    email: data.newEmail
                });
                console.log(updatedUser);

                // Update the user in Firestore because there's no trigger onUpdateUser available
                await admin.firestore().doc(`users/${updatedUser.uid}`).set({email: data.newEmail});
                return `New Email for User ${toUpdateUser.email} has been updated successfully to ${updatedUser.email}`;
            } else {
                const currentUser = await admin.auth().getUser(context.auth.uid);
                throw new HttpsError('permission-denied', `${currentUser.email} doesn't have claim DEV or ADMIN`);
            }
        } else {
            throw new HttpsError('unauthenticated', `Unauthorised access`);
        }
    } catch (e) {
        console.log(e);
        throw new HttpsError('invalid-argument', e.message);
    }
});

/**
 * Update another User's Password
 * Executed by Admin or Dev
 */
export const updatePasswordByAdmin = functions.https.onCall(async (data: any, context: CallableContext) => {
    try {
        if (context.auth !== undefined) {
            if (context.auth.token.DEV === true || context.auth.token.ADMIN === true) {
                const toUpdateUser = await admin.auth().getUserByEmail(data.email);
                const updatedUser: UserRecord = await admin.auth().updateUser(toUpdateUser.uid, {
                    password: data.password
                });
                console.log(updatedUser);
                return `Password for User ${toUpdateUser.email} has been updated successfully`;
            } else {
                const currentUser = await admin.auth().getUser(context.auth.uid);
                throw new HttpsError('permission-denied', `${currentUser.email} doesn't have claim DEV or ADMIN`);
            }
        } else {
            throw new HttpsError('unauthenticated', `Unauthorised access`);
        }

    } catch (e) {
        console.log(e);
        throw new HttpsError('invalid-argument', e.message);
    }
});

/**
 * Role of the user
 */
export enum Claim {
    DEV = 'DEV',
    ADMIN = 'ADMIN',
    WORKER = 'WORKER',
}

/**
 * Convert Claim Enum value -> Boolean value
 * @param claim: Claim
 */
export const claimEnumToBoolean = (claim: Claim) => {
    switch (claim) {
        case Claim.DEV:
            return {DEV: true};
            break;
        case Claim.ADMIN:
            return {ADMIN: true};
            break;
        case Claim.WORKER:
            return {WORKER: true};
            break;
    }
};

export const claimBooleanToEnum = (user: any | UserRecord) => {
    if (user.customClaims.DEV === true) {
        return Claim.DEV;
    }
    if (user.customClaims.ADMIN === true) {
        return Claim.ADMIN;
    }
    if (user.customClaims.WORKER === true) {
        return Claim.WORKER;
    }
    throw new HttpsError('cancelled', 'Not a valid Claim. Must be ADMIN or WORKER');
};

/**
 * Helper to set claim to user
 * @param email: string
 * @param claim: Claim
 */
export const makeClaimHelper = async (email: string, claim: Claim) => {
    const user = await admin.auth().getUserByEmail(email);
    const customClaim = {};
    // @ts-ignore
    customClaim[claim] = true;
    return admin.auth().setCustomUserClaims(user.uid, customClaim);
};

/**
 * Helper to set claim directly to User
 * @param claim: Claim
 */
export const makeClaimToUser = async (user: any | UserRecord) => {
    try {
        return admin.auth().setCustomUserClaims(user.uid, user.customClaims);
    } catch (e) {
        throw new HttpsError('cancelled', e.message);
    }
};

export const createUserHelper = async (user: any) => {
    let createdUser: UserRecord | any = {};
    try {
        createdUser = await admin.auth().createUser({
            displayName: user.displayName,
            email: user.email,
            password: user.password,
        });
    } catch (e) {
        console.log(e);
        throw new HttpsError('invalid-argument', e.message);
    }

    user.uid = createdUser.uid;
    await makeClaimToUser(user);

    const createdUserDoc = {
        customClaims: user.customClaims,
        displayName: user.displayName,
        email: user.email,
    };
    await admin.firestore().doc(`users/${user.uid}`).create(createdUserDoc);
    return `User ${createdUser.email} with Claim ${claimBooleanToEnum(user)} has been created...`;
};

/**
 * Create a new User
 * Executed by Admin or Dev
 */
export const createUser = functions.https.onCall(async (data: any, context: CallableContext) => {
    try {
        if (context.auth !== undefined) {
            const user = data.user;
            if (context.auth.token.DEV === true || context.auth.token.ADMIN === true) {
                const claim = claimBooleanToEnum(user);
                switch (claim) {
                    case Claim.DEV:
                        throw new HttpsError('permission-denied', `not allowed to create DEV`);
                        break;
                    case Claim.ADMIN:
                    case Claim.WORKER:
                        return createUserHelper(user);
                        break;
                }
                throw new HttpsError('invalid-argument', 'not accepted Role: must be ADMIN, MODERATOR or DESIGNER');
            } else {
                const currentUser = await admin.auth().getUser(context.auth.uid);
                throw new HttpsError('permission-denied', `${currentUser.email} doesn't have claim DEV or ADMIN`);
            }
        } else {
            throw new HttpsError('unauthenticated', `Unauthorised access`);
        }
    } catch (e) {
        console.log(e);
        throw new HttpsError('invalid-argument', e.message);
    }
});

/**
 * Update another User's Password
 * Executed by Admin or Dev
 */
export const updateUserByAdmin = functions.https.onCall(async (data: any, context: CallableContext) => {
    try {
        if (context.auth !== undefined) {
            const user = data.user;
            if (context.auth.token.DEV === true || context.auth.token.ADMIN === true) {
                let updatedUser: UserRecord | any = {};
                if (user.password !== '') {
                    updatedUser = await admin.auth().updateUser(user.uid, {
                        displayName: user.displayName,
                        email: user.email,
                        password: user.password
                    });
                } else {
                    updatedUser = await admin.auth().updateUser(user.uid, {
                        displayName: user.displayName,
                        email: user.email,
                    });
                }

                console.log(updatedUser);

                await makeClaimToUser(user);

                const toUpdateUserDoc = {
                    customClaims: user.customClaims,
                    displayName: user.displayName,
                    email: user.email,
                };
                const docRef = await admin.firestore().doc(`users/${user.uid}`).update(toUpdateUserDoc);
                console.log(docRef);
                return `User ${user.email} has been updated successfully`;
            } else {
                const currentUser = await admin.auth().getUser(context.auth.uid);
                if (context.auth.token.ADMIN === true && user.customClaims.DEV === true) {
                    throw new HttpsError('permission-denied', `${currentUser.email} doesn't have claim DEV`);
                }
                throw new HttpsError('permission-denied', `${currentUser.email} doesn't have claim DEV or ADMIN`);
            }
        } else {
            throw new HttpsError('unauthenticated', `Unauthorised access`);
        }

    } catch (e) {
        console.log(e);
        throw new HttpsError('invalid-argument', e.message);
    }
});

/**
 * Trigger when an user being created
 */
// export const userOnCreate = functions.auth.user().onCreate(async (user: UserRecord, context: functions.EventContext) => {
//     try {
//         const toCreateUserDoc = {
//             customClaims: user.customClaims,
//             displayName: user.displayName,
//             email: user.email,
//         };
//         const docRef = await admin.firestore().doc(`users/${user.uid}`).create(toCreateUserDoc);
//         console.log(docRef);
//
//         const message = `User Document ${user.email} has been created`;
//         console.log(message);
//         return message;
//     } catch (e) {
//         console.log(e);
//         throw new HttpsError('invalid-argument', e.message);
//     }
// });

/**
 * Make an User have Claim ADMIN
 * Executed by DEV
 */
export const makeDev = functions.https.onCall(async (data: any, context: CallableContext) => {
    try {
        if (context.auth !== undefined) {
            console.log(data);
            await makeClaimHelper(data.email, Claim.DEV);
            return `User ${data.email} has been claimed DEV`;

        } else {
            throw new HttpsError('unauthenticated', `Unauthorised access`);
        }
    } catch (e) {
        console.log(e);
        throw new HttpsError('invalid-argument', e.message);
    }
});
