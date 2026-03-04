import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { userId, yearName, startDate, endDate } = await request.json();

    if (!userId || !yearName || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'User ID, year name, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Get user document to find schoolId
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const schoolId = userData.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID not found for user' },
        { status: 404 }
      );
    }

    // Check if there's already an active academic year
    const activeYearsQuery = query(
      collection(db, 'academicYears'),
      where('schoolId', '==', schoolId),
      where('isActive', '==', true)
    );

    const activeYearsSnapshot = await getDocs(activeYearsQuery);
    
    if (!activeYearsSnapshot.empty) {
      return NextResponse.json(
        { error: 'An active academic year already exists. Please deactivate it first.' },
        { status: 400 }
      );
    }

    // Create new academic year
    const academicYearData = {
      schoolId,
      name: yearName,
      isActive: true,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'academicYears'), academicYearData);

    return NextResponse.json({
      message: 'Academic year created successfully',
      yearId: docRef.id,
      year: {
        id: docRef.id,
        ...academicYearData,
      },
    });

  } catch (error: any) {
    console.error('Error creating academic year:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create academic year' },
      { status: 500 }
    );
  }
}
