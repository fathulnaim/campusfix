import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth, ADMIN_EMAIL } from "../firebase";

/**
 * Checks whether the given user or email has Maintenance Admin privileges.
 * Per Requirement #1: admin@campus.edu is the Maintenance Admin; all others are Students.
 * @param {string|{ email?: string }} userOrEmail 
 * @returns {boolean}
 */
export function isMaintenanceAdmin(userOrEmail) {
  if (!userOrEmail) return false;
  const email = typeof userOrEmail === "string" ? userOrEmail : userOrEmail.email;
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Signs up a new user with Email and Password using Firebase Auth.
 * @param {string} email 
 * @param {string} password 
 * @param {string} [displayName]
 */
export async function signUpUser(email, password, displayName = "") {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName }).catch(() => {});
    }
    return cred.user;
  } catch (err) {
    throw formatAuthError(err);
  }
}

/**
 * Signs in an existing user with Email and Password using Firebase Auth.
 * @param {string} email 
 * @param {string} password 
 */
export async function loginUser(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return cred.user;
  } catch (err) {
    throw formatAuthError(err);
  }
}

/**
 * Signs out the current user.
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Subscribes to Firebase Auth state changes.
 * @param {(user: import('firebase/auth').User | null) => void} callback 
 * @returns {() => void} unsubscribe function
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Translates Firebase Auth error codes into friendly user messages.
 * @param {any} err 
 * @returns {Error}
 */
function formatAuthError(err) {
  const code = err?.code || "";
  let message = err?.message || "Authentication error occurred.";

  switch (code) {
    case "auth/invalid-email":
      message = "Invalid email format. Please check your email address.";
      break;
    case "auth/user-not-found":
    case "auth/invalid-credential":
      message = "Invalid email or password. If you don't have an account, please switch to Sign Up.";
      break;
    case "auth/wrong-password":
      message = "Incorrect password. Please try again.";
      break;
    case "auth/email-already-in-use":
      message = "This email address is already registered. Please Sign In instead.";
      break;
    case "auth/weak-password":
      message = "Password should be at least 6 characters long.";
      break;
    case "auth/network-request-failed":
      message = "Network error. Please check your internet connection.";
      break;
    case "auth/too-many-requests":
      message = "Access temporarily blocked due to many failed attempts. Try again later.";
      break;
    default:
      if (err.message) {
        message = err.message;
      }
      break;
  }

  const cleanErr = new Error(message);
  cleanErr.code = code;
  return cleanErr;
}
