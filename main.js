// ================= FIREBASE IMPORTS =================
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
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyAf8nAXRMtLVfraFLuc5vDFwWvyGEToU9s",
  authDomain: "my-invesmant-app.firebaseapp.com",
  projectId: "my-invesmant-app",
  storageBucket: "my-invesmant-app.firebasestorage.app",
  messagingSenderId: "939446002148",
  appId: "1:939446002148:web:2806e17b50f3a4f8c167f1"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DEPOSIT_ADDRESS = "TLVKwm4u9DQiXgbxwyYn3WBpvvZNGyN8sK";

// ================= AUTH STATE =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem("uid", user.uid);
  }
});

// ================= REGISTER =================
window.registerUser = async function () {
  const email = document.getElementById("regEmail")?.value.trim();
  const pass = document.getElementById("regPass")?.value;
  const promo = document.getElementById("promoCode")?.value.trim();

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

    await setDoc(doc(db, "members", cred.user.uid), {
      email: email,
      balance: 1,
      createdAt: serverTimestamp()
    });

    alert("🎉 Registration successful (1 USDT bonus)");
    window.location.href = "login.html";
  } catch (e) {
    alert(e.message);
  }
};

// ================= LOGIN =================
window.loginUser = async function () {
  const email = document.getElementById("loginEmail")?.value.trim();
  const pass = document.getElementById("loginPass")?.value;

  if (!email || !pass) {
    alert("Enter email and password");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    window.location.href = "home.html";
  } catch (e) {
    alert("Login failed: " + e.message);
  }
};

// ================= CHECK AUTH =================
window.checkAuth = function () {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
};

// ================= SHOW BALANCE =================
window.showBalance = async function () {
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  const snap = await getDoc(doc(db, "members", uid));
  if (snap.exists()) {
    const bal = snap.data().balance || 0;
    const el = document.getElementById("balance");
    if (el) el.innerText = "Balance: " + bal + " USDT";
  }
};

// ================= DEPOSIT =================
window.deposit = function () {
  const amt = Number(document.getElementById("depAmount")?.value);
  if (amt < 20) {
    alert("Minimum deposit is 20 USDT");
    return;
  }
  document.getElementById("walletBox").style.display = "block";
};

window.confirmDeposit = async function () {
  const amt = Number(document.getElementById("depAmount")?.value);
  const uid = localStorage.getItem("uid");

  if (amt < 20) return;

  await addDoc(collection(db, "deposits"), {
    uid: uid,
    amount: amt,
    address: DEPOSIT_ADDRESS,
    network: "TRC20",
    status: "pending",
    createdAt: serverTimestamp()
  });

  alert("✅ Deposit submitted. Waiting for approval.");
  document.getElementById("walletBox").style.display = "none";
  document.getElementById("depAmount").value = "";
};

// ================= BUY PLAN =================
window.buyPlan = async function (price, daily) {
  const uid = localStorage.getItem("uid");
  const ref = doc(db, "members", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();
  if (data.balance < price) {
    alert("Insufficient balance");
    return;
  }

  await setDoc(ref, {
    balance: data.balance - price
  }, { merge: true });

  await addDoc(collection(db, "plans"), {
    uid: uid,
    price: price,
    dailyIncome: daily,
    days: 30,
    status: "active",
    createdAt: serverTimestamp()
  });

  alert("✅ Plan activated");
  showBalance();
};

// ================= WITHDRAW =================
window.withdraw = async function () {
  const amt = Number(document.getElementById("wAmount")?.value);
  const addr = document.getElementById("wAddress")?.value.trim();
  const uid = localStorage.getItem("uid");

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

  if (!snap.exists()) return;

  const bal = snap.data().balance;
  if (amt > bal) {
    alert("Insufficient balance");
    return;
  }

  await setDoc(ref, {
    balance: bal - amt
  }, { merge: true });

  await addDoc(collection(db, "withdraws"), {
    uid: uid,
    amount: amt,
    address: addr,
    status: "pending",
    createdAt: serverTimestamp()
  });

  alert("✅ Withdraw request submitted");
  showBalance();
};

// ================= LOGOUT =================
window.logout = async function () {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "login.html";
};
