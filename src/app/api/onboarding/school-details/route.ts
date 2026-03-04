import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication token
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (!payload || !payload.uid) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();

    // Verify that the authenticated user matches the requested user
    if (payload.uid !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: User ID mismatch' },
        { status: 403 }
      );
    }

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

    // Get school document
    const schoolDoc = await getDoc(doc(db, 'schools', schoolId));
    
    if (!schoolDoc.exists()) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    const schoolData = schoolDoc.data();
    
    return NextResponse.json({
      schoolId,
      schoolName: schoolData.name || '',
      address: schoolData.address || '',
      contactPhone: schoolData.contactPhone || '',
      contactEmail: schoolData.contactEmail || '',
      logoUrl: schoolData.logoUrl || null,
    });

  } catch (error: any) {
    console.error('Error fetching school details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch school details' },
      { status: 500 }
    );
  }
}
