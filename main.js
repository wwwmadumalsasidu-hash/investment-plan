// ====== Users & Current ======
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

// ====== Save users to localStorage ======
function saveUsers(){ localStorage.setItem("users", JSON.stringify(users)); }

// ====== Check login ======
function checkLogin(){ 
    if(!currentUser) window.location.href="index.html"; 
}

// ====== Show balance ======
function showBalance(){
  let el = document.getElementById("balance");
  if(el && users[currentUser]) el.innerText = "Balance: "+users[currentUser].balance+" USDT";
}

// ====== REGISTER ======
function register(){
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;
  let promo = document.getElementById("promo").value;

  if(promo !== "PASIYA"){ alert("Invalid promo code"); return; }
  if(users[email]){ alert("Account exists"); return; }

  users[email] = { password:pass, balance:1, plans:[] };
  saveUsers();
  localStorage.setItem("currentUser", email);
  alert("🎉 Congratulations! You won 1 USDT");
  window.location.href="home.html";
}

// ====== LOGIN ======
function login(){
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;

  if(!users[email] || users[email].password !== pass){
      alert("Wrong email or password");
      return;
  }
  localStorage.setItem("currentUser", email);
  window.location.href="home.html";
}

// ====== DEPOSIT ======
function deposit(){
  let amt = parseFloat(document.getElementById("amount").value);

  // <-- Minimum deposit updated to 20
  if(amt < 20){ alert("Minimum deposit 20 USDT"); return; }

  document.getElementById("depositBox").style.display="block";
}

// ====== BUY PLAN ======
function buyPlan(cost, income){
  let u = users[currentUser];
  if(u.balance < cost){ alert("Insufficient balance"); return; }

  u.balance -= cost;
  u.plans.push({income: income, days:30});
  saveUsers(); 
  showBalance();
  alert("Investment plan activated (30 days)");
}

// ====== WITHDRAW ======
function withdraw(){
  let amt = parseFloat(document.getElementById("wAmount").value);
  if(amt < 2){ alert("Minimum withdraw 2 USDT"); return; }

  alert("Withdraw request successful");
}

// ====== ADMIN ======
function adminUpdateBalance(){
  let key = prompt("Enter admin key");
  if(key !== "ADMIN123"){ alert("Access denied"); return; }

  let email = prompt("Enter user email");
  if(!users[email]){ alert("User not found"); return; }

  let bal = prompt("Enter new balance (USDT)");
  users[email].balance = parseFloat(bal);
  saveUsers();
  alert("Balance updated successfully");
}

// ====== DAILY INCOME DEMO ======
setInterval(()=>{
  if(!currentUser || !users[currentUser]) return;

  let u = users[currentUser];
  u.plans.forEach((p, i)=>{
    if(p.days > 0){
      u.balance += p.income;
      p.days--;

      // Update plan progress if progress bar exists
      let dayEl = document.getElementById(`daysLeft${i+1}`);
      let progressEl = document.getElementById(`progress${i+1}`);
      if(dayEl) dayEl.innerText = p.days;
      if(progressEl) progressEl.style.width = ((30-p.days)/30*100)+"%";
    }
  });
  saveUsers();
  showBalance();
}, 10000); // 10 seconds = demo daily income
