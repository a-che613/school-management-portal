import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const userId = formData.get('userId') as string;
    const fullName = formData.get('fullName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const profileFile = formData.get('profilePicture') as File | null;

    if (!userId || !fullName || !phoneNumber) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Update teacher document
    const updateData: any = {
      fullName,
      phoneNumber,
      updatedAt: serverTimestamp(),
    };

    // Handle profile picture upload if provided
    if (profileFile) {
      // For now, we'll skip actual file upload and just store a placeholder
      // In production, you would upload to Firebase Storage or similar
      updateData.profilePictureUrl = `https://via.placeholder.com/200x200?text=${encodeURIComponent(fullName)}`;
    }

    await updateDoc(doc(db, 'teachers', userId), updateData);

    return NextResponse.json({
      message: 'Teacher profile updated successfully',
      userId,
    });

  } catch (error: any) {
    console.error('Error updating teacher profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update teacher profile' },
      { status: 500 }
    );
  }
}
