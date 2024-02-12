// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyA70LHn9Q8Rub401YVoGeJro9NT6p8eqqs',
	authDomain: 'noboredom-eaf1a.firebaseapp.com',
	databaseURL:
		'https://noboredom-eaf1a-default-rtdb.europe-west1.firebasedatabase.app',
	projectId: 'noboredom-eaf1a',
	storageBucket: 'noboredom-eaf1a.appspot.com',
	messagingSenderId: '574813042916',
	appId: '1:574813042916:web:c9625f4b6a8bf921ac54f1',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
