import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, serverTimestamp, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { UserProfile } from '@/types/user';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const analytics = typeof window !== 'undefined' && isSupported().then(supported => supported ? getAnalytics(app) : null);

export async function createUserProfile(
  userId: string,
  data: Partial<Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>>
) {
  const profileRef = doc(collection(db, 'profiles'), userId);
  const timestamp = serverTimestamp();
  const profileData: UserProfile = {
    userId,
    firstName: data.firstName?.trim() ?? '',
    lastName: data.lastName?.trim() ?? '',
    email: data.email?.toLowerCase() ?? '',
    provider: data.provider ?? 'email',
    createdAt: timestamp as unknown as Timestamp,
    updatedAt: timestamp as unknown as Timestamp,
  };
  try {
    await setDoc(profileRef, profileData);
    return profileRef;
  } catch (error) {
    console.error('Firestore error in createUserProfile:', error);
    throw new Error('Impossibile creare il profilo in Firestore.');
  }
}

export async function getUserProfile(userId: string) {
  const profileRef = doc(collection(db, 'profiles'), userId);
  const profileSnap = await getDoc(profileRef);
  if (!profileSnap.exists()) {
    return null;
  }
  return profileSnap.data() as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>>
) {
  try {
    const profileRef = doc(collection(db, 'profiles'), userId);
    await updateDoc(profileRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return profileRef;
  } catch (error) {
    console.error('Firestore error in updateUserProfile:', error);
    throw new Error('Impossibile aggiornare il profilo in Firestore.');
  }
}

export default app;
