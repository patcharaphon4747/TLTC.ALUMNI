
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { AlumniProfile, ActivityImage } from '../types';

// Updated with user-provided Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCGLnypfItUtClA3j2_Pu7DZLuijsYzmYE",
    authDomain: "alumni-member.firebaseapp.com",
    projectId: "alumni-member",
    storageBucket: "alumni-member.firebasestorage.app",
    messagingSenderId: "144129152332",
    appId: "1:144129152332:web:2865f8080769c4dbccebe9",
    measurementId: "G-KVF2WQMTX8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const firebaseService = {
    auth,

    /**
     * Fetches a specific alumni profile by UID from the 'alumni' collection.
     */
    async getProfile(uid: string): Promise<AlumniProfile | null> {
        const docRef = doc(db, "alumni", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as AlumniProfile;
        }
        return null;
    },

    /**
     * Fetches all registered alumni profiles for the directory.
     */
    async getAllProfiles(): Promise<AlumniProfile[]> {
        try {
            const q = query(collection(db, "alumni"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlumniProfile));
        } catch (error) {
            console.error("Error fetching profiles:", error);
            return [];
        }
    },

    /**
     * Saves or merges a profile into the 'alumni' collection.
     */
    async saveProfile(profile: AlumniProfile) {
        const docRef = doc(db, "alumni", profile.id);
        await setDoc(docRef, profile, { merge: true });
    },

    /**
     * Adds an image object to the user's gallery array in Firestore.
     */
    async addActivityImage(userId: string, image: ActivityImage) {
        const docRef = doc(db, "alumni", userId);
        await updateDoc(docRef, {
            gallery: arrayUnion(image)
        });
    },

    /**
     * Removes an image object from the user's gallery array in Firestore.
     */
    async deleteActivityImage(userId: string, image: ActivityImage) {
        const docRef = doc(db, "alumni", userId);
        await updateDoc(docRef, {
            gallery: arrayRemove(image)
        });
    }
};
