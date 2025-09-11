import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user || null);

      if (user) {
        const ref = doc(db, "users", user.uid);
        const unsubDoc = onSnapshot(ref, async (snap) => {
          if (snap.exists()) {
            setProfile({ id: snap.id, ...snap.data() });
          } else {
            // Create a minimal profile if missing (fallback)
            const fallback = {
              email: user.email,
              role: "customer",
              name: user.email?.split("@")[0] ?? "User",
              createdAt: serverTimestamp(),
            };
            await setDoc(ref, fallback, { merge: true });
          }
          setInitializing(false);
        });
        // store unsubscribe on window to clean when user logs out
        // but we can just return it on unmount
        return () => unsubDoc();
      } else {
        setProfile(null);
        setInitializing(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user: firebaseUser, profile, initializing, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
