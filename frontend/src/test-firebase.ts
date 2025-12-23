// Test Firebase connectivity
import { db } from './config/firebase.config';
import { collection, getDocs } from 'firebase/firestore';

async function testFirebase() {
  console.log('Testing Firebase connection...');
  console.log('Firebase DB:', db);
  
  try {
    const interviewsRef = collection(db, 'interviews');
    const snapshot = await getDocs(interviewsRef);
    console.log('Successfully connected to Firebase!');
    console.log('Number of interviews:', snapshot.size);
    
    snapshot.forEach((doc) => {
      console.log('Interview:', doc.id, doc.data());
    });
  } catch (error) {
    console.error('Firebase connection error:', error);
  }
}

testFirebase();
