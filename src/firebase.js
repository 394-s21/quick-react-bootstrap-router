import { useEffect, useState } from 'react';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectDatabaseEmulator, getDatabase, onValue, ref, set } from 'firebase/database';
import { connectAuthEmulator, getAuth, getRedirectResult, GoogleAuthProvider, onIdTokenChanged, signInWithCredential, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDp9QVoEc3rX33r9VQf4i6ph3mfKygIkto",
  authDomain: "quick-react-fb.firebaseapp.com",
  databaseURL: "https://quick-react-fb.firebaseio.com",
  projectId: "quick-react-fb",
  storageBucket: "quick-react-fb.appspot.com",
  messagingSenderId: "260148191080",
  appId: "1:260148191080:web:c06f4f2f3012e3df"
};

const firebase = getApps().length === 0
? initializeApp(firebaseConfig)
: getApp();

const auth = getAuth(firebase);
const database = getDatabase(firebase);


if (process.env.REACT_APP_EMULATE) {
  console.log('running with emulators')
  try { 
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectDatabaseEmulator(database, '127.0.0.1', 9000);

    signInWithCredential(auth, GoogleAuthProvider.credential(
      '{"sub": "qEvli4msW0eDz5mSVO6j3W7i8w1k", "email": "tester@gmail.com", "displayName":"Test User", "email_verified": true}'
    ));
  }
  catch (e) {
    console.log(e)
  }
}

export const useData = (path, transform) => { 
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    const dbRef = ref(database, path);
    return onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      setData(transform ? transform(val) : val);
      setLoading(false);
      setError(null);
    }, (error) => {
      setData(null);
      setLoading(false);
      setError(error);
    });
  }, [path, transform]);

  return [data, loading, error];
};

export const setData = async (path, value) => (
  set(ref(database, path), value)
);

export const signInWithGoogle = () => {
  signInWithPopup(auth, new GoogleAuthProvider());
};

export const signInWithGoogleRedirect = async () => {
  signInWithRedirect(auth, new GoogleAuthProvider());
  try {
    const result = await getRedirectResult(auth);
    console.log(result.user);
  } catch (error) {
    console.log(error.code);
  }
};

const firebaseSignOut = () => signOut(auth);

export { firebaseSignOut as signOut };

export const useUserState = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    onIdTokenChanged(auth, setUser);
  }, []);

  return [user];
};
