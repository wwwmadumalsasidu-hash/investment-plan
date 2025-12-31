/* ================== STORAGE ================== */
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

/* ================== SAVE ================== */
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

/* ================== BALANCE SHOW ================== */
function showBalance() {
  const el = document.getElementById("balance");
  if (el && currentUser && users[currentUser]) {
    el.innerText = "Balance: " + users[currentUser].balance + " USDT";
  }
}

/* ================== AUTH ================== */
function register() {
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPass").value;
  const promo = document.getElementById("promoCode").value;

  if (!email || !pass) return alert("Fill all fields");
  if (promo !== "PASIYA") return alert("Invalid promo code");
  if (users[email]) return alert("Account already exists");

  users[email] = {
    password: pass,
    balance: 1,          // 🎁 welcome bonus only
    plans: [],
    pendingDeposit: 0
  };

  saveUsers();
  alert("🎉 Congratulations! You won 1 USDT");
  location.href = "login.html";
}

function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;

  if (!users[email] || users[email].password !== pass)
    return alert("Invalid email or password");

  currentUser = email;
  localStorage.setItem("currentUser", email);
  location.href = "home.html";
}

/* ================== DEPOSIT ================== */
function deposit() {
  const amt = Number(document.getElementById("depAmount").value);

  if (amt < 20) {
    alert("Minimum deposit is 20 USDT");
    return;
  }

  // ❌ NO BALANCE ADD
  users[currentUser].pendingDeposit = amt;
  saveUsers();

  document.getElementById("walletBox").style.display = "block";
}

function confirmDeposit() {
  alert("✅ Deposit submitted. Waiting for admin approval.");
  document.getElementById("depAmount").value = "";
  document.getElementById("walletBox").style.display = "none";
}

/* ================== INVESTMENT PLANS ================== */
function buyPlan(price, dailyIncome) {
  const u = users[currentUser];

  if (u.balance < price) {
    alert("Insufficient balance");
    return;
  }

  u.balance -= price;   // ✔ deduct only
  u.plans.push({
    price: price,
    daily: dailyIncome,
    days: 30,
    lastPaid: Date.now()
  });

  saveUsers();
  showBalance();
  alert("Plan activated (30 days)");
}

/* ================== WITHDRAW ================== */
function withdraw() {
  const amt = Number(document.getElementById("wAmount").value);
  const addr = document.getElementById("trc20").value;

  if (!addr) return alert("Enter TRC20 address");
  if (amt < 5) return alert("Minimum withdraw is 5 USDT");
  if (amt > users[currentUser].balance)
    return alert("Insufficient balance");

  users[currentUser].balance -= amt;
  saveUsers();
  showBalance();

  alert("Withdraw request submitted successfully");
}

/* ================== PAGE LOAD ================== */
window.onload = function () {
  if (currentUser && users[currentUser]) {
    showBalance();
  }
};
