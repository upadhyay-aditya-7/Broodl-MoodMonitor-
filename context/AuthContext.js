"use client";
import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useContext, useState, useEffect } from "react";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDataObj, setUserDataObj] = useState({});
  const [loading, setLoding] = useState(true);

  //AUTH HANDLERS
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  function logout() {
    setUserDataObj({});
    setCurrentUser(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        //Set the user to our local context state
        setLoding(true);
        setCurrentUser(user);
        if (!user) {
          return;
        }
        //if user exist fetch data from firebase database
        console.log("Featching User Data");
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        let firebaseData = {};
        if (docSnap.exists()) {
          console.log("Found User Data");
          firebaseData = docSnap.data();
          console.log(firebaseData);
        }
        setUserDataObj(firebaseData);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoding(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userDataObj,
    signup,
    logout,
    login,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
