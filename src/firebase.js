import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyCK3PxAZZchYOlK0QkFEwAmuezc9JDxgYE",
  authDomain: "cyberzahweb.firebaseapp.com",
  databaseURL: "https://cyberzahweb-default-rtdb.firebaseio.com",
  projectId: "cyberzahweb",
  storageBucket: "cyberzahweb.firebasestorage.app",
  messagingSenderId: "864086602242",
  appId: "1:864086602242:web:6c05b260b093fa3e00ed1b"
}

const app = initializeApp(firebaseConfig)

export const db = getDatabase(app)
