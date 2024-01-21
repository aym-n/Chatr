import { useState } from 'react'
import './App.css'

import { initializeApp } from 'firebase/app'
import { getAuth , GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

import { useAuthState } from 'react-firebase-hooks/auth';

const app = initializeApp({
  apiKey: "AIzaSyDKqphTEqTIWYgXpj7yOpDlHO-bdP8RPq0",
  authDomain: "chatr-a378f.firebaseapp.com",
  projectId: "chatr-a378f",
  storageBucket: "chatr-a378f.appspot.com",
  messagingSenderId: "955804601164",
  appId: "1:955804601164:web:0a0d9064e13f0d52335de9",
  measurementId: "G-W7TZJH44EB"
});

export const auth = getAuth(app)
export const db = getFirestore(app)


function App() {
  
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <h1>Chatr</h1>
      {user ? <ChatRoom /> : <SignIn />}
    </div>
  )
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
  }
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  return (
    <>
      <SignOut />
      <h2>Chat Room</h2>
    </>
  )
}



export default App