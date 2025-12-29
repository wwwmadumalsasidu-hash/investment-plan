// Load or init user
let user = JSON.parse(localStorage.getItem("user"));
if(!user){
    user={email:"",balance:0,plans:[null,null,null]};
    localStorage.setItem("user",JSON.stringify(user));
}

// Save user
function save(){
    localStorage.setItem("user",JSON.stringify(user));
    showBalance();
}

// Show messages
function showMessage(txt){
    alert(txt);
}

// Show balance
function showBalance(){
    const b = document.getElementById("balance");
    if(b) b.innerText = "Balance: "+user.balance+" USDT";
}

// Admin hidden button
function admin(){
    let pass = prompt("Enter admin code");
    if(pass!=="ADMIN123"){ alert("Access denied"); return;}
    let amt = prompt("New balance");
    user.balance=parseFloat(amt);
    save();
    showMessage("Balance updated by admin!");
}

// Check login
function checkLogin(){
    if(!user.email){
        alert("Please register / login first");
        window.location.href="index.html";
    }
}

// Daily income simulation (demo 10 sec per day)
setInterval(()=>{
    user.plans.forEach(plan=>{
        if(plan && plan.days>0){
            user.balance+=plan.income;
            plan.days--;
        }
    });
    save();
},10000);
