/* ================= FIREBASE IMPORTS ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  arrayUnion,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyAf8nAXRMtLVfraFLuc5vDFwWvyGEToU9s",
  authDomain: "my-invesmant-app.firebaseapp.com",
  projectId: "my-invesmant-app",
  storageBucket: "my-invesmant-app.firebasestorage.app",
  messagingSenderId: "939446002148",
  appId: "1:939446002148:web:2806e17b50f3a4f8c167f1"
};

/* ================= INIT ================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= CONSTANT ================= */
const DEPOSIT_ADDRESS = "TLVKwm4u9DQiXgbxwyYn3WBpvvZNGyN8sK";

/* ================= AUTH CHECK ================= */
window.checkAuth = function () {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    } else {
      localStorage.setItem("uid", user.uid);
    }
  });
};

/* ================= SHOW BALANCE ================= */
window.showBalance = async function () {
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  const snap = await getDoc(doc(db, "members", uid));
  if (snap.exists()) {
    const el = document.getElementById("balance");
    if (el) {
      el.innerText = "Balance: " + snap.data().balance + " USDT";
    }
  }
};

/* ================= DEPOSIT ================= */
window.deposit = function () {
  const amt = Number(document.getElementById("depAmount").value);

  if (amt < 20) {
    alert("Minimum deposit is 20 USDT");
    return;
  }

  document.getElementById("walletBox").style.display = "block";
};

/* ================= CONFIRM DEPOSIT ================= */
window.confirmDeposit = async function () {
  const uid = localStorage.getItem("uid");
  const amt = Number(document.getElementById("depAmount").value);

  if (!uid) return alert("Login required");
  if (amt < 20) return alert("Minimum deposit is 20 USDT");

  try {
    await addDoc(collection(db, "deposits"), {
      uid: uid,
      amount: amt,
      walletAddress: DEPOSIT_ADDRESS,
      network: "USDT-TRC20",
      status: "pending",
      createdAt: serverTimestamp()
    });

    alert("✅ Deposit submitted. Waiting for admin approval.");

    document.getElementById("walletBox").style.display = "none";
    document.getElementById("depAmount").value = "";
  } catch (e) {
    alert("Deposit failed");
  }
};

/* ================= LOGOUT ================= */
window.logout = async function () {
  await signOut(auth);
  localStorage.removeItem("uid");
  window.location.href = "login.html";
};
