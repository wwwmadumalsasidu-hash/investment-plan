// Load or init user
let user = JSON.parse(localStorage.getItem("user"));
if(!user){
    user={email:"",balance:0,plans:[null,null,null]};
    localStorage.setItem("user",JSON.stringify(user));
}

// Save user to localStorage
function save(){
    localStorage.setItem("user",JSON.stringify(user));
}

// Admin hidden
function admin(){
    let pass = prompt("Enter admin code");
    if(pass!=="ADMIN123"){ alert("Access denied"); return;}
    let amt = prompt("New balance");
    user.balance=parseFloat(amt);
    save();
    alert("Balance updated");
}

// Check if logged in
function checkLogin(){
    if(!user.email){
        alert("Please register / login first");
        window.location.href="index.html";
    }
}

// Display balance in header
function showBalance(){
    let b = document.getElementById("balance");
    if(b) b.innerText = "Balance: "+user.balance+" USDT";
}

// Daily income simulation
setInterval(()=>{
    user.plans.forEach(plan=>{
        if(plan && plan.days>0){
            user.balance+=plan.income;
            plan.days--;
        }
    });
    save();
    showBalance();
},1000*10); // demo: 10 sec per day
