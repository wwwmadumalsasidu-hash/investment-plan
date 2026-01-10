import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= REGISTER ================= */
window.registerUser = async function () {
  const email = regEmail.value.trim();
  const pass = regPass.value;
  const promo = promoCode.value;

  if (!email || !pass) return alert("Fill all fields");
  if (promo !== "PASIYA") return alert("Invalid promo code");

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;

    await setDoc(doc(db, "members", uid), {
      email,
      promoCode: promo,
      balance: 1, // 🎁 welcome bonus
      plans: [],
      pendingDeposit: 0,
      createdAt: serverTimestamp()
    });

    alert("🎉 Account created with 1 USDT bonus");
    location.href = "login.html";
  } catch (e) {
    alert(e.message);
  }
};

/* ================= LOGIN ================= */
window.loginUser = async function () {
  const email = loginEmail.value.trim();
  const pass = loginPass.value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    localStorage.setItem("uid", cred.user.uid);
    location.href = "home.html";
  } catch {
    alert("Invalid login");
  }
};

/* ================= BALANCE ================= */
window.showBalance = async function () {
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  const snap = await getDoc(doc(db, "members", uid));
  if (snap.exists()) {
    balance.innerText = "Balance: " + snap.data().balance + " USDT";
  }
};

/* ================= DEPOSIT ================= */
window.deposit = async function () {
  const uid = localStorage.getItem("uid");
  const amt = Number(depAmount.value);
  if (amt < 20) return alert("Minimum deposit 20 USDT");

  await updateDoc(doc(db, "members", uid), {
    pendingDeposit: amt
  });

  alert("Deposit submitted (waiting approval)");
};

/* ================= BUY PLAN ================= */
window.buyPlan = async function (price, daily) {
  const uid = localStorage.getItem("uid");
  const ref = doc(db, "members", uid);
  const snap = await getDoc(ref);

  if (snap.data().balance < price)
    return alert("Insufficient balance");

  await updateDoc(ref, {
    balance: snap.data().balance - price,
    plans: arrayUnion({
      price,
      daily,
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
  const amt = Number(wAmount.value);
  const addr = trc20.value;

  if (!addr) return alert("Enter address");
  if (amt < 5) return alert("Minimum withdraw 5");

  const ref = doc(db, "members", uid);
  const snap = await getDoc(ref);

  if (amt > snap.data().balance)
    return alert("Insufficient balance");

  await updateDoc(ref, {
    balance: snap.data().balance - amt
  });

  showBalance();
  alert("Withdraw request sent");
};
