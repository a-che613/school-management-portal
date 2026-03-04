import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
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

    // Get teacher document from Firestore
    const teacherDoc = await getDoc(doc(db, 'teachers', userId));
    
    if (!teacherDoc.exists()) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    const teacherData = teacherDoc.data();
    
    return NextResponse.json({
      fullName: teacherData.fullName || '',
      phoneNumber: teacherData.phoneNumber || '',
      profilePictureUrl: teacherData.profilePictureUrl || null,
    });

  } catch (error: any) {
    console.error('Error fetching teacher profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch teacher profile' },
      { status: 500 }
    );
  }
}
