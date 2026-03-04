import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

    // Update user document to mark onboarding as complete
    await updateDoc(doc(db, 'users', userId), {
      onboardingCompleted: true,
      onboardingStep: 0,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      message: 'Onboarding completed successfully',
    });

  } catch (error: any) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
