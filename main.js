/***********************
 GLOBAL DATA
************************/
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

/***********************
 HELPERS
************************/
function saveUsers(){
  localStorage.setItem("users", JSON.stringify(users));
}

function checkLogin(){
  if(!currentUser){
    window.location.href="login.html";
  }
}

function showBalance(){
  let u = users[currentUser];
  if(document.getElementById("balance")){
    document.getElementById("balance").innerText =
      "Balance: " + u.balance + " USDT";
  }
}

/***********************
 REGISTER
************************/
function register(){
  let email = regEmail.value;
  let pass  = regPass.value;
  let promo = promoCode.value;

  if(promo !== "PASIYA"){
    alert("Invalid promo code");
    return;
  }

  if(users[email]){
    alert("User already exists");
    return;
  }

  users[email] = {
    password: pass,
    balance: 1, // 🎁 bonus 1 USDT
    plans: []
  };

  saveUsers();
  alert("🎉 Congratulations! You won 1 USDT");
  window.location.href="login.html";
}

/***********************
 LOGIN
************************/
function login(){
  let email = loginEmail.value;
  let pass  = loginPass.value;

  if(!users[email] || users[email].password !== pass){
    alert("Invalid login details");
    return;
  }

  currentUser = email;
  localStorage.setItem("currentUser", email);
  window.location.href="home.html";
}

/***********************
 DEPOSIT (MIN 20)
************************/
function deposit(){
  let amt = parseFloat(depAmount.value);

  if(amt < 20){
    alert("Minimum deposit is 20 USDT");
    return;
  }

  document.getElementById("walletBox").style.display="block";
}

/***********************
 CONFIRM DEPOSIT (DEMO)
************************/
function confirmDeposit(){
  let amt = parseFloat(depAmount.value);
  let u = users[currentUser];

  u.balance += amt;
  saveUsers();
  showBalance();

  alert("Deposit submitted successfully!");
}

/***********************
 BUY PLAN
************************/
function buyPlan(price, income){
  let u = users[currentUser];

  if(u.balance < price){
    alert("Insufficient balance");
    return;
  }

  u.balance -= price;
  u.plans.push({
    income: income,
    days: 30
  });

  saveUsers();
  showBalance();
  alert("Plan Activated (30 Days)");
}

/***********************
 DAILY INCOME (DEMO TIMER)
************************/
setInterval(()=>{
  if(!currentUser) return;

  let u = users[currentUser];
  u.plans.forEach(p=>{
    if(p.days > 0){
      p.days--;
      u.balance += p.income;
    }
  });
  saveUsers();
}, 60000); // demo = 1 min = 1 day

/***********************
 WITHDRAW (MIN 5)
************************/
function checkWithdrawFields(){
  let addr = trc20.value;
  let amt  = wAmount.value;

  withdrawBtn.disabled = !(addr.length > 15 && amt >= 5);
}

function withdraw(){
  let amt = parseFloat(wAmount.value);
  let addr = trc20.value;
  let u = users[currentUser];

  if(amt < 5){
    alert("Minimum withdraw is 5 USDT");
    return;
  }

  if(u.balance < amt){
    alert("Insufficient balance");
    return;
  }

  u.balance -= amt;
  saveUsers();
  showBalance();

  alert("✅ Withdraw request submitted successfully!");
      }
