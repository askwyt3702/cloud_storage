// =====================================
// APIのベースURL
// =====================================
const API_BASE = "http://127.0.0.1:8000";


// =====================================
// ファイルの拡張子 → アイコン変換
// =====================================
function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    const iconMap = {
        "pdf":  { icon: "fa-file-pdf",        bg: "pdf-bg"   },
        "jpg":  { icon: "fa-file-image",       bg: "image-bg" },
        "jpeg": { icon: "fa-file-image",       bg: "image-bg" },
        "png":  { icon: "fa-file-image",       bg: "image-bg" },
        "gif":  { icon: "fa-file-image",       bg: "image-bg" },
        "doc":  { icon: "fa-file-word",        bg: "word-bg"  },
        "docx": { icon: "fa-file-word",        bg: "word-bg"  },
        "xls":  { icon: "fa-file-excel",       bg: "excel-bg" },
        "xlsx": { icon: "fa-file-excel",       bg: "excel-bg" },
        "ppt":  { icon: "fa-file-powerpoint",  bg: "ppt-bg"   },
        "pptx": { icon: "fa-file-powerpoint",  bg: "ppt-bg"   },
        "txt":  { icon: "fa-file-lines",       bg: "text-bg"  },
        "zip":  { icon: "fa-file-zipper",      bg: "zip-bg"   },
        "mp4":  { icon: "fa-file-video",       bg: "video-bg" },
        "mp3":  { icon: "fa-file-audio",       bg: "audio-bg" },
    };
    return iconMap[ext] || { icon: "fa-file", bg: "default-bg" };
}


// =====================================
// ログインAPI呼び出し（MFA対応版に強化）
// =====================================
async function login() {
    const email    = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("入力してください");
        return;
    }

    try {
        const res = await fetch(
            `${API_BASE}/login?username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
            { method: "POST" }
        );

        if (res.ok) {
            const data = await res.json();
            
            // 💡 バックエンドからMFA（2段階認証）が必要と言われた場合
            if (data.mfa_required) {
                // まずログイン完了後に使うユーザー名を一時保存しておく
                sessionStorage.setItem("pending_username", data.user);
                
                // 通常の入力欄を隠し、MFA入力エリアを表示する
                document.getElementById("login-fields").style.display = "none";
                document.getElementById("mfa-fields").style.display = "block";
                return;
            }

            // 💡 MFAが不要な場合は、そのままメイン画面（files.html）へ進む
            sessionStorage.setItem("username", data.user);
            location.href = "files.html";

        } else {
            const err = await res.json();
            alert(err.detail || "ユーザー名またはパスワードが違います");
        }

    } catch (e) {
        alert("サーバーに接続できません");
    }
}


// =====================================
// 【新設】MFA認証コードの検証
// =====================================
async function verifyMFA() {
    const code = document.getElementById("mfa-code").value;

    if (!code || code.length !== 6) {
        alert("6桁の認証コードを入力してください");
        return;
    }

    try {
        // バックエンドの新設API（/login/mfa）にコードを送信
        const res = await fetch(
            `${API_BASE}/login/mfa?code=${encodeURIComponent(code)}`,
            { method: "POST" }
        );

        if (res.ok) {
            // 一時保存しておいたユーザー名を正式なセッションに引き継ぐ
            const username = sessionStorage.getItem("pending_username");
            sessionStorage.setItem("username", username);
            sessionStorage.removeItem("pending_username");

            alert("2段階認証に成功しました！");
            location.href = "files.html"; // ログイン完了で一覧画面へ
        } else {
            const err = await res.json();
            alert(err.detail || "認証コードが正しくありません");
        }

    } catch (e) {
        alert("サーバーに接続できません");
    }
}


// =====================================
// 新規登録API呼び出し
// =====================================
async function register() {
    const username        = document.getElementById("username").value;
    const email           = document.getElementById("register-email").value;
    const password        = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!username || !email || !password || !confirmPassword) {
        alert("全て入力してください");
        return;
    }

    if (password !== confirmPassword) {
        alert("パスワードが一致しません");
        return;
    }

    try {
        const res = await fetch(
            `${API_BASE}/register`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            }
        );

        if (res.ok) {
            alert("アカウントを作成しました！");
            location.href = "login.html";
        } else {
            const err = await res.json();
            alert(`エラー: ${err.detail}`);
        }

    } catch (e) {
        alert("サーバーに接続できません");
    }
}


// =====================================
// ログアウトAPI呼び出し
// =====================================
async function logout() {
    try {
        await fetch(`${API_BASE}/logout`, { method: "POST" });
    } catch (e) {
        // エラーでもログアウト処理は続行
    }
    sessionStorage.removeItem("username");
    location.href = "login.html";
}


// =====================================
// ファイル一覧を取得して表示
// =====================================
async function loadFiles() {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = "<p style='color:#cbd5e1'>読み込み中...</p>";

    try {
        const res = await fetch(`${API_BASE}/files`);

        if (!res.ok) {
            fileList.innerHTML = "<p style='color:#f87171'>ファイルの取得に失敗しました</p>";
            return;
        }

        const data = await res.json();

        if (data.files.length === 0) {
            fileList.innerHTML = "<p style='color:#cbd5e1;text-align:center'>ファイルがありません</p>";
            return;
        }

        fileList.innerHTML = data.files.map(file => {
            const { icon, bg } = getFileIcon(file.name);
            return `
            <div class="file-card">
                <div class="file-info">
                    <div class="file-icon ${bg}">
                        <i class="fa-solid ${icon}"></i>
                    </div>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-detail">${file.file_type.toUpperCase().replace(".", "")} ・ ${file.size} ・ ${file.uploaded_at}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="downloadFile('${file.name}')">↓ 取得</button>
                    <button class="delete-btn"   onclick="deleteFile('${file.name}')">🗑 削除</button>
                </div>
            </div>`;
        }).join("");

    } catch (e) {
        fileList.innerHTML = "<p style='color:#f87171'>サーバーに接続できません</p>";
    }
}


// =====================================
// 使用容量を取得して表示
// =====================================
async function loadStorage() {
    try {
        const res  = await fetch(`${API_BASE}/storage`);
        const data = await res.json();

        const storageText = document.getElementById("storageText");
        if (storageText) {
            storageText.textContent = `使用容量：${data.used} / ${data.max}`;
        }
    } catch (e) {
        // 取得失敗時は何もしない
    }
}


// =====================================
// ファイル選択してアップロード
// =====================================
async function uploadSelectedFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("ファイルを選択してください");
        return;
    }

    await uploadFileData(file);
    fileInput.value = "";
}


// =====================================
// ファイルアップロード処理
// =====================================
async function uploadFileData(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch(`${API_BASE}/upload`, {
            method: "POST",
            body: formData
        });

        if (res.ok) {
            alert(`${file.name} をアップロードしました！`);
            await loadFiles();
            await loadStorage();
        } else {
            const err = await res.json();
            alert(`エラー: ${err.detail}`);
        }
    } catch (e) {
        alert("アップロードに失敗しました");
    }
}


// =====================================
// ファイルダウンロード
// =====================================
async function downloadFile(filename) {
    try {
        const res = await fetch(`${API_BASE}/download/${encodeURIComponent(filename)}`);

        if (!res.ok) {
            alert("ダウンロードに失敗しました");
            return;
        }

        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");

        a.href     = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
    } catch (e) {
        alert("ダウンロードに失敗しました");
    }
}


// =====================================
// ファイル削除
// =====================================
async function deleteFile(filename) {
    if (!confirm(`「${filename}」を削除しますか？`)) return;

    try {
        const res = await fetch(
            `${API_BASE}/delete/${encodeURIComponent(filename)}`,
            { method: "DELETE" }
        );

        if (res.ok) {
            await loadFiles();
            await loadStorage();
        } else {
            const err = await res.json();
            alert(`エラー: ${err.detail}`);
        }
    } catch (e) {
        alert("削除に失敗しました");
    }
}


// =====================================
// ドラッグ＆ドロップ設定
// =====================================
function setupDropArea() {
    const dropArea = document.querySelector(".drop-area");
    if (!dropArea) return;

    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.style.background = "rgba(96,165,250,0.15)";
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.style.background = "";
    });

    dropArea.addEventListener("drop", async (e) => {
        e.preventDefault();
        dropArea.style.background = "";

        const file = e.dataTransfer.files[0];
        if (file) await uploadFileData(file);
    });
}


// =====================================
// ファイル一覧ページの初期化
// =====================================
window.addEventListener("load", () => {
    if (!document.getElementById("fileList")) return;

    const username = sessionStorage.getItem("username");
    if (!username) {
        location.href = "login.html";
        return;
    }

    loadFiles();
    loadStorage();
    setupDropArea();
});