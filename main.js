/* ================= DATABASE ================= */
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

/* ================= SAVE ================= */
function saveUsers(){
  localStorage.setItem("users", JSON.stringify(users));
}

/* ================= CHECK LOGIN ================= */
function checkLogin(){
  if(!currentUser){
    window.location.href = "index.html";
  }
}

/* ================= SHOW BALANCE ================= */
function showBalance(){
  let el = document.getElementById("balance");
  if(el && users[currentUser]){
    el.innerText = "Balance: " + users[currentUser].balance + " USDT";
  }
}

/* ================= REGISTER ================= */
function register(){
  let email = document.getElementById("email").value;
  let pass  = document.getElementById("password").value;
  let promo = document.getElementById("promo").value;

  if(promo !== "PASIYA"){
    alert("Invalid promo code");
    return;
  }

  if(users[email]){
    alert("Account already exists");
    return;
  }

  users[email] = {
    password: pass,
    balance: 1,   // 🎉 Welcome bonus
    plans: []
  };

  saveUsers();
  localStorage.setItem("currentUser", email);
  alert("🎉 Congratulations! You won 1 USDT");
  window.location.href = "home.html";
}

/* ================= LOGIN ================= */
function login(){
  let email = document.getElementById("email").value;
  let pass  = document.getElementById("password").value;

  if(!users[email] || users[email].password !== pass){
    alert("Wrong email or password");
    return;
  }

  localStorage.setItem("currentUser", email);
  window.location.href = "home.html";
}

/* ================= DEPOSIT ================= */
function deposit(){
  let amt = parseFloat(document.getElementById("amount").value);
  if(amt < 50){
    alert("Minimum deposit is 50 USDT");
    return;
  }
  document.getElementById("depositBox").style.display = "block";
}

/* ================= BUY INVESTMENT PLAN ================= */
/* ❗❗ PLANS LOGIC UNCHANGED ❗❗ */
function buyPlan(cost, income){
  let u = users[currentUser];

  if(u.balance < cost){
    alert("Insufficient balance");
    return;
  }

  u.balance -= cost;
  u.plans.push({
    income: income,
    days: 30
  });

  saveUsers();
  showBalance();
  alert("Investment plan activated (30 days)");
}

/* ================= WITHDRAW ================= */
function withdraw(){
  let amt = parseFloat(document.getElementById("wAmount").value);
  if(amt < 2){
    alert("Minimum withdraw amount is 2 USDT");
    return;
  }
  alert("Withdraw request successful");
}

/* ================= ADMIN – UPDATE USER BALANCE ================= */
/* 📱 PHONE FRIENDLY */
function adminUpdateBalance(){
  let key = prompt("Enter admin key");
  if(key !== "ADMIN123"){
    alert("Access denied");
    return;
  }

  let email = prompt("Enter user email");
  if(!users[email]){
    alert("User not found");
    return;
  }

  let newBal = prompt("Enter new balance (USDT)");
  users[email].balance = parseFloat(newBal);

  saveUsers();
  alert("Balance updated successfully");
}

/* ================= DAILY INCOME (DEMO MODE) ================= */
/* 10 seconds = 1 day (demo purpose) */
setInterval(()=>{
  if(!currentUser || !users[currentUser]) return;

  let u = users[currentUser];
  u.plans.forEach(plan=>{
    if(plan.days > 0){
      u.balance += plan.income;
      plan.days--;
    }
  });

  saveUsers();
  showBalance();
}, 10000);
