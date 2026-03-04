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

    // Get active academic year for the school
    const activeYearQuery = query(
      collection(db, 'academicYears'),
      where('schoolId', '==', schoolId),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(activeYearQuery);
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'No active academic year found' },
        { status: 404 }
      );
    }

    const activeYearDoc = querySnapshot.docs[0];
    const yearData = { id: activeYearDoc.id, ...activeYearDoc.data() };

    return NextResponse.json({
      year: yearData,
    });

  } catch (error: any) {
    console.error('Error fetching active academic year:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch active academic year' },
      { status: 500 }
    );
  }
}
