//Itse näpytelty App.js
import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app'; 
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { async } from '@firebase/util';

firebase.initializeApp({
  apiKey: "AIzaSyA-LGaDdzXGPqVQnb3MMo3X5EOOu4yxUCU",
  authDomain: "harjoitus-superchat-2a6b3.firebaseapp.com",
  projectId: "harjoitus-superchat-2a6b3",
  storageBucket: "harjoitus-superchat-2a6b3.appspot.com",
  messagingSenderId: "1056191085406",
  appId: "1:1056191085406:web:2ddf4fb83cbfa6320c2dcf",
  measurementId: "G-HVRKMMK1XN"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Testi chat</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (

    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button> 
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  
  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {

    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
    })
    setFormValue('');
    dummy.current.scrollIntoView({behavior: 'smooth'});
  }

  return (<>
    <main>
     
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
      <button type="submit" disabled={!formValue}>SEND</button>

    </form>
    
    </>)
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;