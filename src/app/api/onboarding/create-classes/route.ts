import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { userId, academicYearId, classes } = await request.json();

    if (!userId || !academicYearId || !classes || classes.length === 0) {
      return NextResponse.json(
        { error: 'User ID, academic year ID, and at least one class are required' },
        { status: 400 }
      );
    }

    // Validate class structure
    for (const classData of classes) {
      if (!classData.gradeLevel || classData.gradeLevel.trim() === '') {
        return NextResponse.json(
          { error: 'Grade level is required for all classes' },
          { status: 400 }
        );
      }
      
      if (!classData.displayName || classData.displayName.trim() === '') {
        return NextResponse.json(
          { error: 'Display name is required for all classes' },
          { status: 400 }
        );
      }
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

    // Create classes
    const createdClasses = [];
    
    for (const classData of classes) {
      const classDocument = {
        schoolId,
        academicYearId,
        gradeLevel: classData.gradeLevel,
        stream: classData.stream || '',
        displayName: classData.displayName,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'classes'), classDocument);
      createdClasses.push({
        id: docRef.id,
        ...classDocument,
      });
    }

    return NextResponse.json({
      message: 'Classes created successfully',
      count: createdClasses.length,
      classes: createdClasses,
    });

  } catch (error: any) {
    console.error('Error creating classes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create classes' },
      { status: 500 }
    );
  }
}
