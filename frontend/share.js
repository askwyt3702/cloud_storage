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
let _shareData = null;      // 描画データをグローバルに保持
let _shareErrorKey = null;  // エラーキーを保持

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
function showShareError(key) {
    document.getElementById("shareLoading").style.display = "none";
    document.getElementById("shareContent").style.display = "none";
    const err = document.getElementById("shareError");
    if (err) err.style.display = "block";
    _shareErrorKey = key;
    
    const msgEl = document.getElementById("shareErrorMsg");
    if (msgEl) msgEl.textContent = t(key);
}

// コンテンツをレンダリングする（言語切り替え時にも再利用）
function renderShareContent() {
    if (_shareErrorKey) {
        const msgEl = document.getElementById("shareErrorMsg");
        if (msgEl) msgEl.textContent = t(_shareErrorKey);
        return;
    }

    if (!_shareData) return;
    const data = _shareData;

    document.getElementById("shareLoading").style.display = "none";
    document.getElementById("shareContent").style.display = "block";

    const [icon, bg] = getShareIcon(data.filename);
    const iconEl = document.getElementById("shareIcon");
    if (iconEl) {
        iconEl.className = `file-icon ${bg}`;
        iconEl.style.width = "70px";
        iconEl.style.height = "70px";
        iconEl.style.fontSize = "32px";
        iconEl.innerHTML = `<i class="fa-solid ${icon}"></i>`;
    }

    const nameEl = document.getElementById("shareFileName");
    if (nameEl) nameEl.textContent = data.filename;

    const typeLabel = (data.file_type || "").toUpperCase().replace(".", "");
    const metaEl = document.getElementById("shareFileMeta");
    if (metaEl) {
        metaEl.textContent = `${typeLabel} ・ ${data.size} ・ ${t("shared_by", { owner: data.owner })}`;
    }

    // パスワード保護されている場合は入力欄を出す
    _protected = data.protected;
    const pwArea = document.getElementById("sharePasswordArea");
    if (pwArea) {
        pwArea.style.display = _protected ? "block" : "none";
    }

    // 有効期限の注記
    const noteEl = document.getElementById("shareNote");
    if (noteEl) {
        if (data.expires_at) {
            const d = new Date(data.expires_at);
            noteEl.textContent = t("expires_at", { time: d.toLocaleString() });
        } else {
            noteEl.textContent = "";
        }
    }
}

// 初期化：トークンの情報を取得
async function initSharePage() {
    _token = getToken();

    if (!_token) {
        showShareError("invalid_token");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/link/${encodeURIComponent(_token)}/info`);

        if (!res.ok) {
            if (res.status === 410) {
                showShareError("expired_link");
            } else if (res.status === 404) {
                showShareError("link_not_found");
            } else {
                showShareError("failed_get_info");
            }
            return;
        }

        _shareData = await res.json();
        _shareErrorKey = null;
        renderShareContent();

    } catch (e) {
        showShareError("cannot_connect_server");
    }
}

// ダウンロード実行
async function doShareDownload() {
    const btn = document.getElementById("shareDownloadBtn");
    const headers = {};

    if (_protected) {
        const pw = document.getElementById("sharePassword").value;
        if (!pw) {
            alert(t("input_password"));
            return;
        }
        headers["X-Link-Password"] = pw;
    }

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = t("downloading");

    try {
        const res = await fetch(
            `${API_BASE}/link/${encodeURIComponent(_token)}/download`,
            { headers }
        );

        if (!res.ok) {
            if (res.status === 401) {
                alert(t("wrong_password"));
            } else if (res.status === 410) {
                alert(t("expired_link"));
            } else {
                alert(t("download_failed"));
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
        alert(t("download_failed"));
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

window.addEventListener("load", initSharePage);
