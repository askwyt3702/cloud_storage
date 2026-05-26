function login(){

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(email === "" || password === ""){
        alert("入力してください");
        return;
    }

    alert("ログイン成功");

    location.href = "files.html";
}
function register(){

    const username = document.getElementById("username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if(username === "" || email === "" || password === "" || confirmPassword === ""){
        alert("全て入力してください");
        return;
    }

    if(password !== confirmPassword){
        alert("パスワードが一致しません");
        return;
    }

    alert("アカウント作成成功");

    location.href = "login.html";
}
