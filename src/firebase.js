import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectDatabaseEmulator, getDatabase, ref } from 'firebase/database';
import { useDatabaseValue, useDatabaseSetMutation } from "@react-query-firebase/database";
import { connectAuthEmulator, getAuth, getRedirectResult, GoogleAuthProvider, signInWithCredential, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

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
  const { data, isLoading, error } = useDatabaseValue(path, ref(database, path), { subscribe: true });
  const value = (!isLoading && !error && transform) ? transform(data) : data;

  return [ value, isLoading, error ];
};

export const useSetData = (path) => {
  const mutation = useDatabaseSetMutation(ref(database, path));
  return [ mutation.mutate, mutation.isLoading, mutation.error ];
};

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

export const useUserState = () => useAuthState(firebase.auth());
