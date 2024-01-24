/* React imports */
import { useEffect, useState, useRef } from "react";

import "./App.css";

/* Firebase Imports */
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyDKqphTEqTIWYgXpj7yOpDlHO-bdP8RPq0",
  authDomain: "chatr-a378f.firebaseapp.com",
  projectId: "chatr-a378f",
  storageBucket: "chatr-a378f.appspot.com",
  messagingSenderId: "955804601164",
  appId: "1:955804601164:web:0a0d9064e13f0d52335de9",
  measurementId: "G-W7TZJH44EB",
});

export const auth = getAuth(app);
export const db = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <>
      {/*
  Heads up! 👋

  Plugins:
    - @tailwindcss/forms
*/}

      <header className="bg-gray-50 sticky">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Welcome {user ? "Back, " + user.displayName : ", User"}
            </h1>

            <p className="mt-1.5 text-sm text-gray-500">
              {user
                ? "Type something! and leave a cool message 🚀"
                : "Get started by logging in using google"}
            </p>
          </div>
          <div className="mt-3">{user ? <SignOut /> : <SignIn />}</div>
        </div>
      </header>
      <div className="chat-area flex-1 flex flex-col justify-center items-center">
        <div className=" w-1/2">
          <ChatRoom />
        </div>
      </div>
    </>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };
  return (
    <button
      onClick={signInWithGoogle}
      class="inline-flex items-center gap-2 rounded-md bg-blue-500 px-3 py-2 text-sm text-white shadow-sm focus:relative"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
      Sign in
    </button>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button
        onClick={() => auth.signOut()}
        class="inline-flex items-center gap-2 rounded-md bg-red-500 px-3 py-2 text-sm text-white shadow-sm focus:relative"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
          />
        </svg>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  return (
    <>
      <div className="flex-1 overflow-y-scroll">
        <ChatMessages />
      </div>
      <ChatInput />
    </>
  );
}

function ChatMessages() {
  const [messages, setMessages] = useState([]);
  const messagesRef = collection(db, "messages");
  const end = useRef();
  const q = query(messagesRef, orderBy("createdAt"), limit(25));
  useEffect(() => {
    const unsuscribe = onSnapshot(q, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
      end.current.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsuscribe();
  }, []);

  return (
    <>
      <div className="overflow-y-scroll h-screen ">
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={end}></div>
      </div>
    </>
  );
}

function ChatMessage(props) {
  const { text, createdAt, uid, photoURL, user } = props.message;
  if (auth.currentUser != null && uid == auth.currentUser.uid) {
    return (
      <div className="message me mb-4 flex text-right">
        <div className="flex-1 px-1">
          <div className="inline-block bg-blue-600 rounded-full p-2 px-6 text-white">
            <span>{text}</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="message mb-4 flex">
      <div className="flex-2">
        <div className="w-12 h-12 relative">
          <img
            className="w-12 h-12 rounded-full mx-auto"
            src={photoURL}
            alt="chat-user"
          />
          <span className="absolute w-4 h-4 bg-gray-400 rounded-full right-0 bottom-0 border-2 border-white"></span>
        </div>
      </div>
      <div className="flex-1 px-1">
        <div className="inline-block bg-gray-300 rounded-full p-2 px-6 text-gray-700">
          <span>{text}</span>
        </div>
        <div className="pl-4">
          <small className="text-gray-500">{user}</small>
        </div>
      </div>
    </div>
  );
}

function ChatInput() {
  const [formValue, setFormValue] = useState("");
  const end = useRef();
  const sendMessage = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "messages"), {
      text: formValue,
      createdAt: serverTimestamp(),
      uid: auth.currentUser.uid,
      photoURL: auth.currentUser.photoURL,
      user: auth.currentUser.displayName,
    });
    setFormValue("");

    end.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0 fixed bottom-5 w-1/2">
      <div className="relative flex">
        <form onSubmit={sendMessage} className="w-full">
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            type="text"
            placeholder="Write your message!"
            className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-5 bg-gray-200 rounded-md py-3"
          />
          <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
            >
              <span className="font-bold">Send</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-6 w-6 ml-2 transform rotate-90"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
