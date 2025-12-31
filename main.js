/* ===== STORAGE ===== */
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

/* ===== HELPERS ===== */
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

function checkLogin() {
  if (!currentUser || !users[currentUser]) {
    location.href = "login.html";
  }
}

function showBalance() {
  const el = document.getElementById("balance");
  if (el) {
    el.innerText = "Balance: " + users[currentUser].balance + " USDT";
  }
}

/* ===== AUTH ===== */
function register() {
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPass").value;
  const promo = document.getElementById("promoCode").value;

  if (!email || !pass) {
    alert("Fill all fields");
    return;
  }

  if (promo !== "PASIYA") {
    alert("Invalid Promo Code");
    return;
  }

  if (users[email]) {
    alert("User already exists");
    return;
  }

  users[email] = {
    password: pass,
    balance: 1,          // welcome bonus
    plans: [],
    pendingDeposit: 0
  };

  saveUsers();
  alert("Registered successfully! You received 1 USDT");
  location.href = "login.html";
}

function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;

  if (!users[email] || users[email].password !== pass) {
    alert("Invalid email or password");
    return;
  }

  currentUser = email;
  localStorage.setItem("currentUser", email);
  location.href = "home.html";
}

/* ===== DEPOSIT ===== */
function deposit() {
  const amount = Number(document.getElementById("depAmount").value);

  if (amount < 20) {
    alert("Minimum deposit amount is 20 USDT");
    return;
  }

  users[currentUser].pendingDeposit = amount;
  saveUsers();

  const box = document.getElementById("walletBox");
  if (box) box.style.display = "block";
}

function confirmDeposit() {
  alert("Deposit submitted. Waiting for admin approval.");
  document.getElementById("depAmount").value = "";
  const box = document.getElementById("walletBox");
  if (box) box.style.display = "none";
}

/* ===== INVESTMENT PLAN (unchanged logic) ===== */
function buyPlan(price, dailyIncome) {
  const user = users[currentUser];

  if (user.balance < price) {
    alert("Insufficient balance");
    return;
  }

  user.balance -= price;
  user.plans.push({
    price: price,
    daily: dailyIncome,
    days: 30
  });

  saveUsers();
  showBalance();
  alert("Investment plan activated");
}

/* ===== WITHDRAW ===== */
function checkWithdrawFields() {
  const amount = Number(document.getElementById("wAmount").value);
  const addr = document.getElementById("trc20").value;
  const btn = document.getElementById("withdrawBtn");

  if (btn) {
    btn.disabled = !(amount >= 5 && addr.length > 10);
  }
}

function withdraw() {
  const amount = Number(document.getElementById("wAmount").value);
  const user = users[currentUser];

  if (amount < 5) {
    alert("Minimum withdraw is 5 USDT");
    return;
  }

  if (amount > user.balance) {
    alert("Not enough balance");
    return;
  }

  user.balance -= amount;
  saveUsers();
  showBalance();

  alert("Withdraw request submitted");
   }
