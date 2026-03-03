// Run this script with: node scripts/create-super-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'school-management-portal-adfa2'
});

const auth = admin.auth();
const db = admin.firestore();

async function createSuperAdmin() {
  try {
    // Create the user in Firebase Auth
    const userRecord = await auth.createUser({
      email: 'super.admin@edumanage.pro',
      password: 'SuperAdmin123!@#',
      emailVerified: true,
    });

    console.log('Successfully created user:', userRecord.uid);

    // Create user profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: 'super.admin@edumanage.pro',
      displayName: 'Super Administrator',
      globalRole: 'SUPER_ADMIN',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('Super admin user profile created successfully');
    console.log('Email: super.admin@edumanage.pro');
    console.log('Password: SuperAdmin123!@#');
    
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    admin.app().delete();
  }
}

createSuperAdmin();
