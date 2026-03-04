import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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

    // Get academic years for the school
    const academicYearsQuery = query(
      collection(db, 'academicYears'),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(academicYearsQuery);
    const years: any[] = [];
    let hasActiveYear = false;

    querySnapshot.forEach((doc) => {
      const yearData = { id: doc.id, ...doc.data() } as any;
      years.push(yearData);
      if (yearData.isActive) {
        hasActiveYear = true;
      }
    });

    return NextResponse.json({
      years,
      hasActiveYear,
    });

  } catch (error: any) {
    console.error('Error fetching academic years:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch academic years' },
      { status: 500 }
    );
  }
}
