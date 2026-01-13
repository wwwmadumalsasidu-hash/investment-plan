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
  getDocs,
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
onAuthStateChanged(auth, async (user) => {
  if (user) {
    localStorage.setItem("uid", user.uid);
    loadNotification(); // 🔔 show notification on login
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
      bonusClaimed: false,
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
    if (!user) window.location.href = "login.html";
  });
};

// ================= SHOW BALANCE =================
window.showBalance = async function () {
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  const snap = await getDoc(doc(db, "members", uid));
  if (snap.exists()) {
    document.getElementById("balance").innerText =
      "Balance: " + snap.data().balance + " USDT";
  }
};

// ================= CLAIM 500 USDT BONUS =================
window.claimBonus = async function () {
  const uid = localStorage.getItem("uid");
  const ref = doc(db, "members", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  if (snap.data().bonusClaimed === true) {
    alert("Bonus already claimed");
    return;
  }

  await setDoc(ref, {
    balance: snap.data().balance ,
    bonusClaimed: true
  }, { merge: true });

  alert("✅ 500 USDT bonus added to your balance");
  showBalance();
};

// ================= DEPOSIT =================
window.deposit = function () {
  const amt = Number(document.getElementById("depAmount")?.value);
  if (amt < 40) {
    alert("Minimum deposit is 40 USDT");
    return;
  }
  document.getElementById("walletBox").style.display = "block";
};

window.confirmDeposit = async function () {
  const amt = Number(document.getElementById("depAmount")?.value);
  const uid = localStorage.getItem("uid");

  if (amt < 40) return;

  await addDoc(collection(db, "deposits"), {
    uid,
    amount: amt,
    address: DEPOSIT_ADDRESS,
    network: "TRC20",
    status: "pending",
    createdAt: serverTimestamp()
  });

  alert("✅ Deposit submitted. Waiting for approval.");
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

  const snap = await getDoc(doc(db, "members", uid));
  const bal = snap.data().balance;

  // 🔴 BONUS RULE
  if (snap.data().bonusClaimed === true) {
    const depSnap = await getDocs(collection(db, "deposits"));
    let totalDeposit = 0;

    depSnap.forEach(d => {
      if (d.data().uid === uid && d.data().status === "approved") {
        totalDeposit += d.data().amount;
      }
    });

    if (totalDeposit < 100) {
      alert(
        "To withdraw the bonus amount, you must deposit at least 100 USDT."
      );
      return;
    }
  }

  if (amt > bal) {
    alert("Insufficient balance");
    return;
  }

  await setDoc(doc(db, "members", uid), {
    balance: bal - amt
  }, { merge: true });

  await addDoc(collection(db, "withdraws"), {
    uid,
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

// ================= NOTIFICATION =================
function showNotify(title, msg) {
  document.getElementById("notifyTitle").innerText = title;
  document.getElementById("notifyMsg").innerText = msg;
  document.getElementById("notification").style.display = "block";
}

window.closeNotify = function () {
  document.getElementById("notification").style.display = "none";
};

async function loadNotification() {
  const snap = await getDocs(collection(db, "notifications"));
  snap.forEach(d => {
    if (d.data().active === true) {
      showNotify(d.data().title, d.data().message);
    }
  });
}
