export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  globalRole: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT';
  associatedSchoolIds: string[];
  activeSchoolId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface School {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SchoolMetadata {
  id: string;
  schoolId: string;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  lastUpdated: Date;
}

export interface SchoolSettings {
  id: string;
  schoolId: string;
  educationSystem: 'CAMEROON_SECONDARY' | 'GRADE_BASED' | 'CUSTOM';
  academicYear: string;
  timezone: string;
  currency: string;
  features: {
    reportCards: boolean;
    promotions: boolean;
    finance: boolean;
    attendance: boolean;
  };
}

export interface Inquiry {
  id: string;
  schoolName: string;
  country: string;
  educationSystem: string;
  numberOfStudents: number;
  numberOfTeachers: number;
  contactPersonName: string;
  email: string;
  phone: string;
  message?: string;
  status: 'PENDING' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}
