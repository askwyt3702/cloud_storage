async function login(){

    const email =
    document.getElementById("email").value;

    const password =
    document.getElementById("password").value;

    const response = await fetch(
        "http://127.0.0.1:8000/login",
        {
            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                email:email,
                password:password
            })
        }
    );

    const data = await response.json();

    console.log(data);

    if(response.ok){

        alert("ログイン成功");

        location.href = "files.html";

    }else{

        alert("ログイン失敗");
    }
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
function logout(){

    alert("ログアウトしました");

    location.href = "login.html";
}