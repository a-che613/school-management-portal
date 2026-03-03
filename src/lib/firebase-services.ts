import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  DocumentData,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { User, School, Inquiry } from '@/types';

// Helper functions
const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
};

const sanitizeData = (data: any): DocumentData => {
  const sanitized: DocumentData = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      sanitized[key] = data[key];
    }
  });
  return sanitized;
};

// User Services
export const userService = {
  async getUserById(userId: string): Promise<User | null> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as User;
  },

  async createUser(userData: Partial<User>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...sanitizeData(userData),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...sanitizeData(userData),
      updatedAt: serverTimestamp(),
    });
  },

  async getUsersByRole(globalRole: string): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('globalRole', '==', globalRole)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as User;
    });
  }
};

// School Services
export const schoolService = {
  async getAllSchools(): Promise<School[]> {
    const q = query(
      collection(db, 'schools'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as School;
    });
  },

  async getSchoolById(schoolId: string): Promise<School | null> {
    const docRef = doc(db, 'schools', schoolId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as School;
  },

  async createSchool(schoolData: Omit<School, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'schools'), {
      ...sanitizeData(schoolData),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateSchool(schoolId: string, schoolData: Partial<School>): Promise<void> {
    const docRef = doc(db, 'schools', schoolId);
    await updateDoc(docRef, {
      ...sanitizeData(schoolData),
      updatedAt: serverTimestamp(),
    });
  },

  async deleteSchool(schoolId: string): Promise<void> {
    const docRef = doc(db, 'schools', schoolId);
    await deleteDoc(docRef);
  },

  // Real-time listener for schools
  onSchoolsChange(callback: (schools: School[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'schools'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const schools = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as School;
      });
      callback(schools);
    });
  }
};

// Inquiry Services
export const inquiryService = {
  async createInquiry(inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'inquiries'), {
      ...sanitizeData(inquiryData),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getAllInquiries(): Promise<Inquiry[]> {
    const q = query(
      collection(db, 'inquiries'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Inquiry;
    });
  }
};
