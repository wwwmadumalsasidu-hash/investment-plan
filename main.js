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

/* ================= REGISTER ================= */
window.registerUser = async function () {
  const email = document.getElementById("regEmail")?.value.trim();
  const pass = document.getElementById("regPass")?.value;
  const promo = document.getElementById("promoCode")?.value;

  if (!email || !pass) {
    alert("Fill all fields");
    return;
  }

  if (promo !== "PASIYA") {
    alert("Invalid promo code");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;

    await setDoc(doc(db, "members", uid), {
      email: email,
      promoCode: promo,
      balance: 1, // 🎁 welcome bonus
      plans: [],
      pendingDeposit: 0,
      createdAt: serverTimestamp()
    });

    alert("🎉 Registration successful! 1 USDT added");
    window.location.href = "login.html";
  } catch (err) {
    alert(err.message);
  }
};

/* ================= LOGIN ================= */
window.loginUser = async function () {
  const email = document.getElementById("loginEmail")?.value.trim();
  const pass = document.getElementById("loginPass")?.value;

  if (!email || !pass) {
    alert("Enter email & password");
    return;
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    localStorage.setItem("uid", cred.user.uid);
    window.location.href = "home.html";
  } catch (err) {
    alert("Invalid login details");
  }
};

/* ================= AUTH CHECK ================= */
window.checkAuth = function () {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
};

/* ================= SHOW BALANCE ================= */
window.showBalance = async function () {
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  const snap = await getDoc(doc(db, "members", uid));
  if (snap.exists()) {
    const balEl = document.getElementById("balance");
    if (balEl) {
      balEl.innerText = "Balance: " + snap.data().balance + " USDT";
    }
  }
};

/* ================= DEPOSIT ================= */
window.deposit = async function () {
  const uid = localStorage.getItem("uid");
  const amt = Number(document.getElementById("depAmount")?.value);

  if (amt < 20) {
    alert("Minimum deposit is 20 USDT");
    return;
  }

  await updateDoc(doc(db, "members", uid), {
    pendingDeposit: amt
  });

  alert("Deposit request sent");
};

/* ================= BUY PLAN ================= */
window.buyPlan = async function (price, daily) {
  const uid = localStorage.getItem("uid");
  const ref = doc(db, "members", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  if (snap.data().balance < price) {
    alert("Insufficient balance");
    return;
  }

  await updateDoc(ref, {
    balance: snap.data().balance - price,
    plans: arrayUnion({
      price: price,
      daily: daily,
      days: 30,
      lastPaid: Date.now()
    })
  });

  showBalance();
  alert("Plan activated");
};

/* ================= WITHDRAW ================= */
window.withdraw = async function () {
  const uid = localStorage.getItem("uid");
  const amt = Number(document.getElementById("wAmount")?.value);
  const addr = document.getElementById("trc20")?.value;

  if (!addr) {
    alert("Enter wallet address");
    return;
  }

  if (amt < 5) {
    alert("Minimum withdraw is 5 USDT");
    return;
  }

  const ref = doc(db, "members", uid);
  const snap = await getDoc(ref);

  if (amt > snap.data().balance) {
    alert("Insufficient balance");
    return;
  }

  await updateDoc(ref, {
    balance: snap.data().balance - amt
  });

  showBalance();
  alert("Withdraw request sent");
};

/* ================= LOGOUT ================= */
window.logout = async function () {
  await signOut(auth);
  localStorage.removeItem("uid");
  window.location.href = "login.html";
};
