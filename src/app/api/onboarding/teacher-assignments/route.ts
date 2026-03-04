import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get teacher document
    const teacherDoc = await getDoc(doc(db, 'teachers', userId));
    
    if (!teacherDoc.exists()) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    const teacherData = teacherDoc.data();
    const schoolId = teacherData.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID not found for teacher' },
        { status: 404 }
      );
    }

    // Get school information
    const schoolDoc = await getDoc(doc(db, 'schools', schoolId));
    const schoolName = schoolDoc.exists() ? schoolDoc.data().name : 'Unknown School';

    // Get active academic year
    const activeYearQuery = query(
      collection(db, 'academicYears'),
      where('schoolId', '==', schoolId),
      where('isActive', '==', true)
    );

    const activeYearSnapshot = await getDocs(activeYearQuery);
    const academicYear = activeYearSnapshot.empty 
      ? 'Not Set' 
      : activeYearSnapshot.docs[0].data().name;

    // Get teacher's subject assignments
    const subjectsQuery = query(
      collection(db, 'teacherSubjects'),
      where('teacherId', '==', userId)
    );

    const subjectsSnapshot = await getDocs(subjectsQuery);
    const subjects = subjectsSnapshot.docs.map(doc => doc.data().subjectName);

    // Get teacher's class assignments
    const classesQuery = query(
      collection(db, 'teacherClasses'),
      where('teacherId', '==', userId)
    );

    const classesSnapshot = await getDocs(classesQuery);
    const classes = classesSnapshot.docs.map(doc => doc.data().className);

    return NextResponse.json({
      subjects,
      classes,
      academicYear,
      schoolName,
    });

  } catch (error: any) {
    console.error('Error fetching teacher assignments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch teacher assignments' },
      { status: 500 }
    );
  }
}
