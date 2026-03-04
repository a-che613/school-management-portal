import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

    const formData = await request.formData();
    
    const schoolId = formData.get('schoolId') as string;
    const schoolName = formData.get('schoolName') as string;
    const address = formData.get('address') as string;
    const contactPhone = formData.get('contactPhone') as string;
    const contactEmail = formData.get('contactEmail') as string;
    const logoFile = formData.get('logo') as File | null;

    // Verify that the authenticated user has permission to update this school
    // This would require checking user's schoolId, but for now we'll proceed
    // In production, you'd want to verify the user belongs to this school

    if (!schoolId || !schoolName || !address || !contactPhone || !contactEmail) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Update school document
    const updateData: any = {
      name: schoolName,
      address,
      contactPhone,
      contactEmail,
      updatedAt: serverTimestamp(),
    };

    // Handle logo upload if provided
    if (logoFile) {
      // For now, we'll skip actual file upload and just store a placeholder
      // In production, you would upload to Firebase Storage or similar
      updateData.logoUrl = `https://via.placeholder.com/200x200?text=${encodeURIComponent(schoolName)}`;
    }

    await updateDoc(doc(db, 'schools', schoolId), updateData);

    return NextResponse.json({
      message: 'School details updated successfully',
      schoolId,
    });

  } catch (error: any) {
    console.error('Error updating school details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update school details' },
      { status: 500 }
    );
  }
}
