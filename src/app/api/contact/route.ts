import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolName, contactPerson, contactEmail, contactPhone, address, message } = body;

    // Validate required fields
    if (!schoolName || !contactPerson || !contactEmail || !contactPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store in Firestore
    const docRef = await addDoc(collection(db, 'schoolRequests'), {
      schoolName,
      contactPerson,
      contactEmail,
      contactPhone,
      address: address || null,
      message: message || null,
      status: 'new',
      createdAt: serverTimestamp(),
    });

    // Send email notification
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1>New School Request — EduManage</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">School Information</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0;"><strong>School Name:</strong> ${schoolName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Contact Person:</strong> ${contactPerson}</p>
            <p style="margin: 0 0 10px 0;"><strong>Contact Email:</strong> ${contactEmail}</p>
            <p style="margin: 0 0 10px 0;"><strong>Contact Phone:</strong> ${contactPhone}</p>
            ${address ? `<p style="margin: 0 0 10px 0;"><strong>Address:</strong> ${address}</p>` : ''}
            ${message ? `<p style="margin: 0 0 10px 0;"><strong>Message:</strong> ${message}</p>` : ''}
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #92400e;">
              <strong>Next Steps:</strong> Please contact this school to set up their EduManage account.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Request ID: ${docRef.id}
            </p>
          </div>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
          <p style="margin: 0;">&copy; 2026 EduManage. All rights reserved.</p>
        </div>
      </div>
    `;

    // TODO: Replace with actual email service integration
    // For now, we'll simulate the email sending
    console.log('Sending email to: azienwi.che@gmail.com');
    console.log('Subject: New School Request — EduManage');
    console.log('Email content:', emailContent);

    // Example with Nodemailer:
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'azienwi.che@gmail.com',
      subject: `New School Request — EduManage`,
      html: emailContent,
    });
    */

    return NextResponse.json({
      message: 'Request submitted successfully',
      requestId: docRef.id
    });

  } catch (error: any) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit request' },
      { status: 500 }
    );
  }
}
