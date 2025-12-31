/* ================= STORAGE ================= */
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

/* ================= HELPERS ================= */
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

function showBalance() {
  const b = document.getElementById("balance");
  if (b && users[currentUser]) {
    b.innerText = "Balance: " + users[currentUser].balance + " USDT";
  }
}

/* ================= AUTH ================= */
function register() {
  const email = regEmail.value.trim();
  const pass = regPass.value;
  const promo = promoCode.value;

  if (!email || !pass) return alert("Fill all fields");
  if (promo !== "PASIYA") return alert("Invalid promo code");
  if (users[email]) return alert("Account already exists");

  users[email] = {
    password: pass,
    balance: 1,          // 🎁 welcome bonus ONLY
    plans: [],
    pendingDeposit: 0
  };

  saveUsers();
  alert("🎉 Congratulations! You won 1 USDT");
  location.href = "login.html";
}

function login() {
  const email = loginEmail.value.trim();
  const pass = loginPass.value;

  if (!users[email] || users[email].password !== pass)
    return alert("Invalid login");

  currentUser = email;
  localStorage.setItem("currentUser", email);
  location.href = "home.html";
}

/* ================= DEPOSIT ================= */
function deposit() {
  const amt = Number(depAmount.value);

  if (amt < 20) {
    alert("Minimum deposit is 20 USDT");
    return;
  }

  // ❌ NO BALANCE CHANGE HERE
  users[currentUser].pendingDeposit = amt;
  saveUsers();

  document.getElementById("walletBox").style.display = "block";
}

function confirmDeposit() {
  // ❌ ❌ ❌ NO balance += amount ❌ ❌ ❌
  alert("Deposit submitted successfully. Waiting for confirmation.");
  depAmount.value = "";
  walletBox.style.display = "none";
}

/* ================= INVESTMENT PLANS ================= */
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
  alert("Plan activated for 30 days");
}

/* ================= DAILY INCOME ================= */
/* ⚠️ IMPORTANT: income only when admin allows OR manual call */
function addDailyIncome() {
  const u = users[currentUser];
  const now = Date.now();

  u.plans.forEach(p => {
    if (p.days > 0 && now - p.lastPaid >= 86400000) {
      // ❌ COMMENT THIS if you DON'T want auto income
      // u.balance += p.daily;

      p.days--;
      p.lastPaid = now;
    }
  });

  saveUsers();
  showBalance();
}

/* ================= WITHDRAW ================= */
function withdraw() {
  const amt = Number(wAmount.value);
  const addr = trc20.value;

  if (amt < 5) return alert("Minimum withdraw is 5 USDT");
  if (!addr) return alert("Enter TRC20 address");
  if (amt > users[currentUser].balance)
    return alert("Insufficient balance");

  users[currentUser].balance -= amt;
  saveUsers();
  showBalance();

  alert("Withdraw request submitted successfully");
    }
