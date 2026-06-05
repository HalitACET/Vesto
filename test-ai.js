const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp({ projectId: 'vesto-a0eb8' });
const db = getFirestore();
db.collection('wardrobeItems').where('aiAnalysis', '!=', null).limit(1).get().then(snap => {
  if (snap.empty) {
    console.log('No items found');
  } else {
    console.log(JSON.stringify(snap.docs[0].data().aiAnalysis, null, 2));
  }
}).catch(console.error);
