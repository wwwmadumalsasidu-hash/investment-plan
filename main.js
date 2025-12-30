let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

/* SAVE */
function save(){
  localStorage.setItem("users", JSON.stringify(users));
}

/* CHECK LOGIN */
function checkLogin(){
  if(!currentUser){
    window.location.href="index.html";
  }
}

/* SHOW BALANCE */
function showBalance(){
  let b = document.getElementById("balance");
  if(b){
    b.innerText = "Balance: " + users[currentUser].balance + " USDT";
  }
}

/* REGISTER */
function register(){
  let email = emailInput.value;
  let pass = passwordInput.value;
  let promo = promoInput.value;

  if(promo !== "PASIYA"){
    alert("Invalid promo code");
    return;
  }

  if(users[email]){
    alert("Account exists");
    return;
  }

  users[email] = {
    password: pass,
    balance: 1,
    plans: []
  };

  save();
  localStorage.setItem("currentUser", email);
  alert("🎉 Congratulations! You won 1 USDT");
  window.location.href="home.html";
}

/* LOGIN */
function login(){
  let email = emailInput.value;
  let pass = passwordInput.value;

  if(!users[email] || users[email].password !== pass){
    alert("Wrong login");
    return;
  }

  localStorage.setItem("currentUser", email);
  window.location.href="home.html";
}

/* DEPOSIT */
function deposit(){
  let amt = parseFloat(amount.value);
  if(amt < 50){
    alert("Minimum deposit is 50 USDT");
    return;
  }
  document.getElementById("depositBox").style.display="block";
}

/* BUY PLAN */
function buy(cost, income){
  let u = users[currentUser];
  if(u.balance < cost){
    alert("Insufficient balance");
    return;
  }

  u.balance -= cost;
  u.plans.push({income:income, days:30});
  save();
  showBalance();
  alert("Plan Activated – 30 Days");
}

/* WITHDRAW */
function withdraw(){
  let amt = parseFloat(wAmount.value);
  if(amt < 2){
    alert("Minimum withdraw is 2 USDT");
    return;
  }
  alert("Withdraw request successful");
}

/* DAILY INCOME (demo) */
setInterval(()=>{
  if(!currentUser) return;
  let u = users[currentUser];
  u.plans.forEach(p=>{
    if(p.days > 0){
      u.balance += p.income;
      p.days--;
    }
  });
  save();
  showBalance();
},10000);
