// =====================================
// 共有ファイル受け取りページ（share.html）専用
// URL の ?t=トークン を読んで、ファイル情報を表示する
// ログイン不要
// =====================================

const API_BASE = "http://127.0.0.1:8000";

// テーマを復元（一覧画面と共通）
(function () {
    try {
        if (localStorage.getItem("theme") === "light") {
            document.documentElement.setAttribute("data-theme", "light");
        }
    } catch (_) {}
})();

// URL からトークンを取得
function getToken() {
    const params = new URLSearchParams(location.search);
    return params.get("t");
}

let _token = null;
let _protected = false;

// 拡張子 → アイコン
function getShareIcon(filename) {
    const ext = (filename.split(".").pop() || "").toLowerCase();
    const map = {
        pdf:["fa-file-pdf","pdf-bg"],
        jpg:["fa-file-image","image-bg"], jpeg:["fa-file-image","image-bg"],
        jfif:["fa-file-image","image-bg"], png:["fa-file-image","image-bg"],
        gif:["fa-file-image","image-bg"], webp:["fa-file-image","image-bg"],
        bmp:["fa-file-image","image-bg"], tif:["fa-file-image","image-bg"], tiff:["fa-file-image","image-bg"],
        doc:["fa-file-word","word-bg"], docx:["fa-file-word","word-bg"],
        xls:["fa-file-excel","excel-bg"], xlsx:["fa-file-excel","excel-bg"], csv:["fa-file-csv","excel-bg"],
        ppt:["fa-file-powerpoint","ppt-bg"], pptx:["fa-file-powerpoint","ppt-bg"],
        txt:["fa-file-lines","text-bg"], zip:["fa-file-zipper","zip-bg"],
        mp4:["fa-file-video","video-bg"], mov:["fa-file-video","video-bg"], webm:["fa-file-video","video-bg"],
        mp3:["fa-file-audio","audio-bg"], wav:["fa-file-audio","audio-bg"], m4a:["fa-file-audio","audio-bg"], aac:["fa-file-audio","audio-bg"],
    };
    return map[ext] || ["fa-file","default-bg"];
}

// エラー表示
function showShareError(msg) {
    document.getElementById("shareLoading").style.display = "none";
    document.getElementById("shareContent").style.display = "none";
    const err = document.getElementById("shareError");
    err.style.display = "block";
    document.getElementById("shareErrorMsg").textContent = msg;
}

// 初期化：トークンの情報を取得
async function initSharePage() {
    _token = getToken();

    if (!_token) {
        showShareError("無効なリンクです（トークンがありません）");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/link/${encodeURIComponent(_token)}/info`);

        if (!res.ok) {
            if (res.status === 410) {
                showShareError("このリンクは有効期限が切れています");
            } else if (res.status === 404) {
                showShareError("リンクが見つかりません（削除されたか、URLが間違っています）");
            } else {
                showShareError("ファイル情報の取得に失敗しました");
            }
            return;
        }

        const data = await res.json();

        // 表示を組み立て
        document.getElementById("shareLoading").style.display = "none";
        document.getElementById("shareContent").style.display = "block";

        const [icon, bg] = getShareIcon(data.filename);
        const iconEl = document.getElementById("shareIcon");
        iconEl.className = `file-icon ${bg}`;
        iconEl.style.width = "70px";
        iconEl.style.height = "70px";
        iconEl.style.fontSize = "32px";
        iconEl.innerHTML = `<i class="fa-solid ${icon}"></i>`;

        document.getElementById("shareFileName").textContent = data.filename;

        const typeLabel = (data.file_type || "").toUpperCase().replace(".", "");
        document.getElementById("shareFileMeta").textContent =
            `${typeLabel} ・ ${data.size} ・ 提供者: ${data.owner}`;

        // パスワード保護されている場合は入力欄を出す
        _protected = data.protected;
        if (_protected) {
            document.getElementById("sharePasswordArea").style.display = "block";
        }

        // 有効期限の注記
        if (data.expires_at) {
            const d = new Date(data.expires_at);
            document.getElementById("shareNote").textContent =
                `有効期限: ${d.toLocaleString()}`;
        }

    } catch (e) {
        showShareError("サーバーに接続できません");
    }
}

// ダウンロード実行
async function doShareDownload() {
    const btn = document.getElementById("shareDownloadBtn");
    const headers = {};

    if (_protected) {
        const pw = document.getElementById("sharePassword").value;
        if (!pw) {
            alert("パスワードを入力してください");
            return;
        }
        headers["X-Link-Password"] = pw;
    }

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "ダウンロード中...";

    try {
        const res = await fetch(
            `${API_BASE}/link/${encodeURIComponent(_token)}/download`,
            { headers }
        );

        if (!res.ok) {
            if (res.status === 401) {
                alert("パスワードが違います");
            } else if (res.status === 410) {
                alert("このリンクは有効期限が切れています");
            } else {
                alert("ダウンロードに失敗しました");
            }
            return;
        }

        // ファイル名をヘッダーから取り出す
        const disp = res.headers.get("Content-Disposition") || "";
        const m = disp.match(/filename="?([^"]+)"?/);
        const filename = m ? m[1] : "download";

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

    } catch (e) {
        alert("ダウンロードに失敗しました");
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

window.addEventListener("load", initSharePage);
