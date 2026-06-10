// =====================================
// APIのベースURL
// =====================================
const API_BASE = "http://127.0.0.1:8000";


// =====================================
// テーマ（ライト / ダーク）の即時復元
// ※ 画面が出る前に適用してチラつきを防ぐ
// =====================================
(function _restoreThemeImmediately() {
    try {
        const saved = localStorage.getItem("theme");
        if (saved === "light") {
            document.documentElement.setAttribute("data-theme", "light");
        }
    } catch (_) { /* localStorage 不可な環境では何もしない */ }
})();

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (_) {}

    // ボタンのアイコンを「今のテーマ」に応じて切り替え
    const btn = document.querySelector(".theme-toggle");
    if (btn) btn.textContent = theme === "light" ? "🌙" : "☀";
}

function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") === "light"
        ? "light" : "dark";
    applyTheme(cur === "dark" ? "light" : "dark");
}


// =====================================
// 表示モード（リスト / グリッド）の切替
//   localStorage に保存して次回も維持する
// =====================================
function _getViewMode() {
    try { return localStorage.getItem("viewMode") || "list"; }
    catch (_) { return "list"; }
}

function applyViewMode() {
    const grid = _getViewMode() === "grid";

    // マイファイル一覧とカテゴリ別一覧の両方に適用
    ["fileList", "categoryFileList"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle("grid-view", grid);
    });

    // ボタンの表示を「次に切り替わるモード」に合わせる
    const btn = document.getElementById("viewToggleBtn");
    if (btn) {
        btn.innerHTML = grid
            ? '<i class="fa-solid fa-list"></i> リスト'
            : '<i class="fa-solid fa-table-cells"></i> タイル';
    }
}

function toggleViewMode() {
    const next = _getViewMode() === "grid" ? "list" : "grid";
    try { localStorage.setItem("viewMode", next); } catch (_) {}
    applyViewMode();
}


// =====================================
// ログイン成功演出（緑のチェックマークを出してから遷移）
//   onDone: アニメ後に実行するコールバック（画面遷移など）
// =====================================
function showSuccessAnimation(message, onDone) {
    const overlay = document.createElement("div");
    overlay.className = "success-overlay";
    overlay.innerHTML = `
        <div class="success-box">
            <div class="success-check">
                <svg viewBox="0 0 52 52">
                    <circle class="success-check-circle" cx="26" cy="26" r="24" fill="none"/>
                    <path class="success-check-mark" fill="none" d="M14 27 l8 8 l16 -18"/>
                </svg>
            </div>
            <p class="success-message">${message || "成功しました"}</p>
        </div>
    `;
    document.body.appendChild(overlay);

    // アニメ後にコールバック
    setTimeout(() => {
        if (typeof onDone === "function") onDone();
    }, 1100);
}


// =====================================
// トースト通知システム（alertの置き換え）
// 画面右上にスッと出て、自動で消える通知
// =====================================
function _ensureToastRoot() {
    let root = document.getElementById("toast-root");
    if (!root) {
        root = document.createElement("div");
        root.id = "toast-root";
        document.body.appendChild(root);
    }
    return root;
}

function notify(message, type, durationMs) {
    const s = String(message);

    // type が指定されない場合は、メッセージ内容から色を自動判定
    if (!type) {
        if (/失敗|エラー|違|接続できません|正しくありません|不正/.test(s)) type = "error";
        else if (/成功|完了|しました|アカウントを作成/.test(s))         type = "success";
        else if (/選択してください|入力してください|一致しません/.test(s)) type = "warning";
        else                                                            type = "info";
    }

    const root  = _ensureToastRoot();
    const toast = document.createElement("div");
    toast.className   = "toast toast-" + type;
    toast.textContent = s;
    root.appendChild(toast);

    // 入場アニメ（次フレームで .toast-show を付ける）
    requestAnimationFrame(() => toast.classList.add("toast-show"));

    // 自動で消える
    const ms = durationMs || 3500;
    setTimeout(() => {
        toast.classList.remove("toast-show");
        setTimeout(() => toast.remove(), 250);
    }, ms);
}


// =====================================
// 画像フルプレビュー モーダル
// =====================================
function _ensureImageModal() {
    if (document.getElementById("image-preview-modal")) return;

    const m = document.createElement("div");
    m.id = "image-preview-modal";
    m.className = "image-modal";
    m.hidden = true;
    m.innerHTML = `
        <div class="image-modal-backdrop" onclick="closeImagePreview()"></div>
        <img id="image-modal-img" src="" alt="">
        <button class="image-modal-close" onclick="closeImagePreview()" aria-label="閉じる">✕</button>
    `;
    document.body.appendChild(m);

    // Escキーで閉じる
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeImagePreview();
    });
}

function openImagePreview(src, alt) {
    _ensureImageModal();
    const m   = document.getElementById("image-preview-modal");
    const img = document.getElementById("image-modal-img");
    img.src = src;
    img.alt = alt || "";
    m.hidden = false;
}

function closeImagePreview() {
    const m = document.getElementById("image-preview-modal");
    if (m) m.hidden = true;
}


// =====================================
// ファイルプレビュー（画像・PDF・動画・音声・テキスト）
// =====================================
function _ensurePreviewModal() {
    if (document.getElementById("preview-modal")) return;
    const m = document.createElement("div");
    m.id = "preview-modal";
    m.className = "image-modal";
    m.hidden = true;
    m.innerHTML = `
        <div class="image-modal-backdrop" onclick="closePreview()"></div>
        <div class="preview-box">
            <div class="preview-head">
                <span class="preview-title" id="preview-title"></span>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button class="preview-download-btn" id="preview-dl-btn" style="background:#2563eb; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:bold; display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-download"></i>ダウンロード</button>
                    <button class="image-modal-close" onclick="closePreview()" aria-label="閉じる" style="position:static; padding:0; background:none;">✕</button>
                </div>
            </div>
            <div class="preview-body" id="preview-body"></div>
        </div>
    `;
    document.body.appendChild(m);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closePreview();
    });
}

function closePreview() {
    const m = document.getElementById("preview-modal");
    if (m) {
        const body = document.getElementById("preview-body");
        if (body) body.innerHTML = "";
        m.hidden = true;
    }
}

async function previewFile(filename) {
    const ext = (filename.split(".").pop() || "").toLowerCase();
    const url = `${API_BASE}/preview/${encodeURIComponent(filename)}`;

    _ensurePreviewModal();
    document.getElementById("preview-title").textContent = filename;
    
    const dlBtn = document.getElementById("preview-dl-btn");
    if (dlBtn) {
        dlBtn.onclick = () => downloadFile(filename);
    }
    
    const body = document.getElementById("preview-body");
    body.innerHTML = `<p style="color:#94a3b8;text-align:center;padding:20px">読み込み中...</p>`;

    if (["jpg","jpeg","jfif","png","gif","webp","bmp","tif","tiff"].includes(ext)) {
        body.innerHTML = `<img class="preview-image" src="${url}" alt="${escapeHtml(filename)}" style="max-width:100%; max-height:70vh; object-fit:contain; display:block; margin:0 auto;">`;
    } else if (ext === "pdf") {
        body.innerHTML = `<iframe class="preview-frame" src="${url}" style="width:100%; height:70vh; border:none;"></iframe>`;
    } else if (["mp4","webm","mov"].includes(ext)) {
        body.innerHTML = `<video class="preview-media" src="${url}" controls autoplay style="max-width:100%; max-height:70vh; display:block; margin:0 auto;"></video>`;
    } else if (["mp3","wav","m4a","aac"].includes(ext)) {
        body.innerHTML = `
            <div class="preview-audio-wrap" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; color:#3b82f6; font-size:48px; gap:20px;">
                <i class="fa-solid fa-music"></i>
                <audio src="${url}" controls autoplay style="width:100%; max-width:400px;"></audio>
            </div>`;
    } else if (["txt","csv","json","md","py","js","html","css"].includes(ext)) {
        try {
            const res = await fetch(url);
            const text = await res.text();
            const esc = text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
            body.innerHTML = `<pre class="preview-text" style="white-space:pre-wrap; word-break:break-all; font-family:monospace; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); padding:16px; border-radius:8px; max-height:70vh; overflow-y:auto; color:#e2e8f0; text-align:left;">${esc}</pre>`;
        } catch (e) {
            body.innerHTML = `<p style="color:#f87171;text-align:center;padding:20px">プレビューできませんでした</p>`;
        }
    } else {
        body.innerHTML = `
            <div class="preview-unsupported" style="text-align:center; padding:40px 20px; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:16px;">
                <i class="fa-solid fa-file-circle-question" style="font-size:48px; color:#64748b;"></i>
                <p>この形式はプレビューできません</p>
                <button class="download-btn" onclick="downloadFile(decodeURIComponent('${encodeURIComponent(filename)}'))" style="background:#2563eb; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">↓ ダウンロード</button>
            </div>`;
    }

    document.getElementById("preview-modal").hidden = false;
}

async function previewSharedFile(owner, filename, isProtected) {
    const ext = (filename.split(".").pop() || "").toLowerCase();
    
    let password = null;
    if (isProtected) {
        password = prompt(`「${filename}」はパスワードで保護されています。\nパスワードを入力:`);
        if (password === null) return;
    }

    _ensurePreviewModal();
    document.getElementById("preview-title").textContent = filename;

    const dlBtn = document.getElementById("preview-dl-btn");
    if (dlBtn) {
        dlBtn.onclick = () => downloadShared(owner, filename, isProtected);
    }

    const body = document.getElementById("preview-body");
    body.innerHTML = `<p style="color:#94a3b8;text-align:center;padding:20px">読み込み中...</p>`;

    const url = `${API_BASE}/shared/preview/${encodeURIComponent(owner)}/${encodeURIComponent(filename)}` + (password ? `?p=${encodeURIComponent(password)}` : "");

    if (["jpg","jpeg","jfif","png","gif","webp","bmp","tif","tiff"].includes(ext)) {
        body.innerHTML = `<img class="preview-image" src="${url}" alt="${escapeHtml(filename)}" style="max-width:100%; max-height:70vh; object-fit:contain; display:block; margin:0 auto;">`;
    } else if (ext === "pdf") {
        body.innerHTML = `<iframe class="preview-frame" src="${url}" style="width:100%; height:70vh; border:none;"></iframe>`;
    } else if (["mp4","webm","mov"].includes(ext)) {
        body.innerHTML = `<video class="preview-media" src="${url}" controls autoplay style="max-width:100%; max-height:70vh; display:block; margin:0 auto;"></video>`;
    } else if (["mp3","wav","m4a","aac"].includes(ext)) {
        body.innerHTML = `
            <div class="preview-audio-wrap" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; color:#3b82f6; font-size:48px; gap:20px;">
                <i class="fa-solid fa-music"></i>
                <audio src="${url}" controls autoplay style="width:100%; max-width:400px;"></audio>
            </div>`;
    } else if (["txt","csv","json","md","py","js","html","css"].includes(ext)) {
        const headers = {};
        if (password) {
            headers["X-Share-Password"] = password;
        }
        try {
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error("Fetch failed");
            const text = await res.text();
            const esc = text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
            body.innerHTML = `<pre class="preview-text" style="white-space:pre-wrap; word-break:break-all; font-family:monospace; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); padding:16px; border-radius:8px; max-height:70vh; overflow-y:auto; color:#e2e8f0; text-align:left;">${esc}</pre>`;
        } catch (e) {
            body.innerHTML = `<p style="color:#f87171;text-align:center;padding:20px">プレビューできませんでした（パスワードが違います）</p>`;
        }
    } else {
        body.innerHTML = `
            <div class="preview-unsupported" style="text-align:center; padding:40px 20px; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:16px;">
                <i class="fa-solid fa-file-circle-question" style="font-size:48px; color:#64748b;"></i>
                <p>この形式はプレビューできません</p>
                <button class="download-btn" onclick="downloadShared(decodeURIComponent('${encodeURIComponent(owner)}'), decodeURIComponent('${encodeURIComponent(filename)}'), ${isProtected})" style="background:#2563eb; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">↓ ダウンロード</button>
            </div>`;
    }

    document.getElementById("preview-modal").hidden = false;
}


// =====================================
// 表示用サイズ文字列（"1.2MB" など）を概算バイトに戻す（並び替え用）
// =====================================
function _sizeToBytes(sizeStr) {
    if (!sizeStr) return 0;
    const m = String(sizeStr).match(/([\d.]+)\s*([KMGT]?B)/i);
    if (!m) return 0;
    const num = parseFloat(m[1]);
    const unit = m[2].toUpperCase();
    const mult = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
    return num * (mult[unit] || 1);
}


// =====================================
// ファイル配列をソート（共有・ゴミ箱の共通処理）
//   sortValue: "name_asc" / "date_desc" / "size_asc" / "owner_asc" など
//   dateKey  : 日付として使うプロパティ名（"shared_at" / "deleted_at"）
// =====================================
function _sortFileArray(files, sortValue, dateKey) {
    const [by, order] = (sortValue || "name_asc").split("_");
    const reverse = (order === "desc") ? -1 : 1;

    const sorted = [...files];
    sorted.sort((a, b) => {
        let r = 0;
        if (by === "size") {
            r = _sizeToBytes(a.size) - _sizeToBytes(b.size);
        } else if (by === "date") {
            r = String(a[dateKey] || "").localeCompare(String(b[dateKey] || ""));
        } else if (by === "owner") {
            r = String(a.owner || "").localeCompare(String(b.owner || ""));
        } else {
            r = String(a.name || "").toLowerCase().localeCompare(String(b.name || "").toLowerCase());
        }
        return r * reverse;
    });
    return sorted;
}


// =====================================
// バイト数を「1.2MB」などの読みやすい形式に変換
// =====================================
function _formatFileSize(bytes) {
    if (bytes < 1024)              return bytes + "B";
    if (bytes < 1024 ** 2)         return (bytes / 1024).toFixed(1) + "KB";
    if (bytes < 1024 ** 3)         return (bytes / (1024 ** 2)).toFixed(1) + "MB";
    return (bytes / (1024 ** 3)).toFixed(2) + "GB";
}


// =====================================================
// アップロードトレイ（選択中ファイルのリスト管理）
//   _uploadQueue: 選択されたファイルを溜める配列
//   各要素: { file: File, zip: bool }  zip=ZIP化対象か
// =====================================================
let _uploadQueue = [];

// input から選ばれたファイルをキューに追加（重複は名前＋サイズで除外）
function addFilesToQueue(fileList) {
    const files = Array.from(fileList || []);
    for (const f of files) {
        const dup = _uploadQueue.some(
            item => item.file.name === f.name && item.file.size === f.size
        );
        if (!dup) {
            _uploadQueue.push({ file: f, zip: false });
        }
    }
    renderUploadTray();
}

// キューから1件削除
function removeFromQueue(index) {
    _uploadQueue.splice(index, 1);
    renderUploadTray();
}

// 1件のZIP対象チェックを切り替え
function toggleQueueZip(index, checked) {
    if (_uploadQueue[index]) _uploadQueue[index].zip = checked;
    renderUploadTray();
}

// すべてクリア
function clearAllSelected() {
    _uploadQueue = [];
    const input = document.getElementById("fileInput");
    if (input) input.value = "";
    renderUploadTray();
}

// トレイを描画
function renderUploadTray() {
    const tray    = document.getElementById("uploadTray");
    const list    = document.getElementById("uploadTrayList");
    const summary = document.getElementById("uploadTraySummary");
    const hint    = document.getElementById("zipHint");
    const zipMode = document.getElementById("zipModeToggle");
    if (!tray || !list) return;

    // 空ならトレイを隠す
    if (_uploadQueue.length === 0) {
        tray.hidden = true;
        list.innerHTML = "";
        if (zipMode) zipMode.checked = false;
        return;
    }
    tray.hidden = false;

    // ZIPモードかどうかで、チェックボックス列の出し方が変わる
    const zipOn = zipMode && zipMode.checked;

    // 合計サイズ
    let total = 0;
    for (const item of _uploadQueue) total += item.file.size;
    if (summary) {
        summary.textContent = `選択中のファイル（${_uploadQueue.length}件・合計 ${_formatFileSize(total)}）`;
    }

    // 各行を描画
    list.innerHTML = _uploadQueue.map((item, i) => {
        const f = item.file;
        const { icon, bg } = getFileIcon(f.name);

        // ZIPモードのときだけ、各行に「ZIPに入れる」チェックを出す
        const zipCheck = zipOn
            ? `<input type="checkbox" class="tray-zip-check" ${item.zip ? "checked" : ""}
                      onchange="toggleQueueZip(${i}, this.checked)" title="このファイルをZIPに入れる">`
            : "";

        return `
            <div class="tray-row">
                ${zipCheck}
                <div class="file-icon ${bg}" style="width:42px;height:42px;border-radius:12px;font-size:18px;">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div class="tray-row-meta">
                    <div class="tray-row-name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</div>
                    <div class="tray-row-size">${_formatFileSize(f.size)}</div>
                </div>
                <button class="tray-row-remove" onclick="removeFromQueue(${i})" title="この行を削除">✕</button>
            </div>
        `;
    }).join("");

    // ヒント文
    if (hint) {
        if (zipOn) {
            const zipCount = _uploadQueue.filter(it => it.zip).length;
            hint.textContent = zipCount > 0
                ? `→ チェックした ${zipCount}件をZIPに、残りは個別にアップロード`
                : `→ 上のリストでZIPに入れるファイルにチェックしてください`;
        } else {
            hint.textContent = "";
        }
    }
}


// =====================================
// アップロード進捗バーUI（必要なら自動で挿入）
// =====================================
function _ensureUploadProgressUI() {
    if (document.getElementById("uploadProgress")) return;

    const drop = document.querySelector(".drop-area");
    if (!drop) return;

    const bar = document.createElement("div");
    bar.id        = "uploadProgress";
    bar.className = "upload-progress";
    bar.style.display = "none";
    bar.innerHTML = `
        <div class="upload-progress-label" id="uploadProgressLabel">アップロード中...</div>
        <div class="upload-progress-bar">
            <div class="upload-progress-fill" id="uploadProgressFill"></div>
        </div>
    `;
    drop.parentElement.insertBefore(bar, drop.nextSibling);
}


// =====================================
// ローディングスケルトン（読み込み中のグレーのプレースホルダー）
// =====================================
function _skeletonHTML(count) {
    let out = "";
    for (let i = 0; i < count; i++) {
        out += `
            <div class="skeleton-card">
                <div class="skeleton-icon"></div>
                <div class="skeleton-lines">
                    <div class="skeleton-line skeleton-line-name"></div>
                    <div class="skeleton-line skeleton-line-detail"></div>
                </div>
            </div>`;
    }
    return out;
}


// =====================================
// 空っぽ状態のHTMLを返す（一覧が0件のとき表示）
// =====================================
function _emptyStateHTML(iconClass, title, sub) {
    return `
        <div class="empty-state">
            <i class="fa-solid ${iconClass}"></i>
            <p class="empty-title">${title}</p>
            ${sub ? `<p class="empty-sub">${sub}</p>` : ""}
        </div>
    `;
}


// =====================================
// ボタンのローディング状態（連打防止＋スピナー表示）
// 使い方:
//   setLoading(btn, true)  → 無効化＋スピナー
//   setLoading(btn, false) → 元に戻す
// =====================================
function setLoading(btn, on) {
    if (!btn) return;
    if (on) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '<span class="btn-spinner"></span>';
    } else {
        btn.disabled = false;
        if (btn.dataset.originalText !== undefined) {
            btn.innerHTML = btn.dataset.originalText;
            delete btn.dataset.originalText;
        }
    }
}

// イベントオブジェクトから「クリックされたボタン」を取り出す小道具
function _btnFromEvent(e) {
    if (!e) return null;
    return e.currentTarget || e.target || null;
}


// =====================================================
// お気に入り（スター）管理
//   ユーザーごとに localStorage に保存（favorites_{username}）
// =====================================================
function _favKey() {
    const user = sessionStorage.getItem("username") || "guest";
    return `favorites_${user}`;
}

function _getFavorites() {
    try {
        return JSON.parse(localStorage.getItem(_favKey()) || "[]");
    } catch (_) {
        return [];
    }
}

function isFavorite(filename) {
    return _getFavorites().includes(filename);
}

function toggleFavorite(filename) {
    let favs = _getFavorites();
    if (favs.includes(filename)) {
        favs = favs.filter(f => f !== filename);
        notify(`★を外しました`);
    } else {
        favs.push(filename);
        notify(`★お気に入りに追加しました`);
    }
    try { localStorage.setItem(_favKey(), JSON.stringify(favs)); } catch (_) {}

    // 表示中の一覧を更新（お気に入りは上部に来る）
    loadFiles();
    const cat = document.getElementById("uploadedListView");
    if (cat && cat.style.display === "block") loadUploadedList();
}


// =====================================
// HTMLエスケープ（XSS対策）
//   ファイル名などのユーザー由来の文字列を innerHTML に
//   埋め込む前に、HTMLとして解釈される文字を無害化する。
//   例: "<img onerror=...>" → "&lt;img onerror=...&gt;"
// =====================================
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


// =====================================
// ファイルの拡張子 → アイコン変換
// =====================================
function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    const iconMap = {
        "pdf":  { icon: "fa-file-pdf",        bg: "pdf-bg"   },
        // 画像
        "jpg":  { icon: "fa-file-image",       bg: "image-bg" },
        "jpeg": { icon: "fa-file-image",       bg: "image-bg" },
        "jfif": { icon: "fa-file-image",       bg: "image-bg" },
        "png":  { icon: "fa-file-image",       bg: "image-bg" },
        "gif":  { icon: "fa-file-image",       bg: "image-bg" },
        "webp": { icon: "fa-file-image",       bg: "image-bg" },
        "bmp":  { icon: "fa-file-image",       bg: "image-bg" },
        "tif":  { icon: "fa-file-image",       bg: "image-bg" },
        "tiff": { icon: "fa-file-image",       bg: "image-bg" },
        "heic": { icon: "fa-file-image",       bg: "image-bg" },
        "heif": { icon: "fa-file-image",       bg: "image-bg" },
        // 文書
        "doc":  { icon: "fa-file-word",        bg: "word-bg"  },
        "docx": { icon: "fa-file-word",        bg: "word-bg"  },
        "xls":  { icon: "fa-file-excel",       bg: "excel-bg" },
        "xlsx": { icon: "fa-file-excel",       bg: "excel-bg" },
        "ppt":  { icon: "fa-file-powerpoint",  bg: "ppt-bg"   },
        "pptx": { icon: "fa-file-powerpoint",  bg: "ppt-bg"   },
        "txt":  { icon: "fa-file-lines",       bg: "text-bg"  },
        "csv":  { icon: "fa-file-csv",         bg: "excel-bg" },
        "zip":  { icon: "fa-file-zipper",      bg: "zip-bg"   },
        // 動画
        "mp4":  { icon: "fa-file-video",       bg: "video-bg" },
        "mov":  { icon: "fa-file-video",       bg: "video-bg" },
        "webm": { icon: "fa-file-video",       bg: "video-bg" },
        // 音声
        "mp3":  { icon: "fa-file-audio",       bg: "audio-bg" },
        "wav":  { icon: "fa-file-audio",       bg: "audio-bg" },
        "m4a":  { icon: "fa-file-audio",       bg: "audio-bg" },
        "aac":  { icon: "fa-file-audio",       bg: "audio-bg" },
    };
    return iconMap[ext] || { icon: "fa-file", bg: "default-bg" };
}


// =====================================
// ログインAPI呼び出し（MFA対応版に強化）
// =====================================
async function login(e) {
    const btn = _btnFromEvent(e);

    const email    = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        notify("入力してください");
        return;
    }

    setLoading(btn, true);
    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username_or_email: email,
                password: password
            })
        });

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
            showSuccessAnimation("ログインしました", () => {
                location.href = "files.html";
            });
            return;

        } else {
            const err = await res.json();
            notify(err.detail || "ユーザー名またはパスワードが違います");
        }

    } catch (err) {
        notify("サーバーに接続できません");
    } finally {
        setLoading(btn, false);
    }
}


// =====================================
// 【新設】MFA認証コードの検証
// =====================================
async function verifyMFA(e) {
    const btn  = _btnFromEvent(e);
    const code = document.getElementById("mfa-code").value;

    if (!code || code.length !== 6) {
        notify("6桁の認証コードを入力してください");
        return;
    }

    setLoading(btn, true);
    try {
        // バックエンドの新設API（/login/mfa）にコードをJSONボディで送信
        const res = await fetch(`${API_BASE}/login/mfa`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code })
        });

        if (res.ok) {
            // 一時保存しておいたユーザー名を正式なセッションに引き継ぐ
            const username = sessionStorage.getItem("pending_username");
            sessionStorage.setItem("username", username);
            sessionStorage.removeItem("pending_username");

            showSuccessAnimation("2段階認証に成功しました", () => {
                location.href = "files.html"; // ログイン完了で一覧画面へ
            });
            return;
        } else {
            const err = await res.json();
            // detail は文字列のときと配列(検証エラー)のときがあるので整形
            const msg = typeof err.detail === "string"
                ? err.detail
                : "認証コードが正しくありません";
            notify(msg);
        }

    } catch (err) {
        notify("サーバーに接続できません");
    } finally {
        setLoading(btn, false);
    }
}


// =====================================
// 新規登録API呼び出し
// =====================================
async function register(e) {
    const btn = _btnFromEvent(e);

    const username        = document.getElementById("username").value;
    const email           = document.getElementById("register-email").value;
    const password        = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!username || !email || !password || !confirmPassword) {
        notify("全て入力してください");
        return;
    }

    if (password !== confirmPassword) {
        notify("パスワードが一致しません");
        return;
    }

    setLoading(btn, true);
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
            notify("アカウントを作成しました！");
            location.href = "login.html";
        } else {
            const err = await res.json();
            notify(`エラー: ${err.detail}`);
        }

    } catch (err) {
        notify("サーバーに接続できません");
    } finally {
        setLoading(btn, false);
    }
}


// =====================================
// パスワードリセット（パスワードを忘れた時）
// メール＋MFAコードで本人確認 → 新パスワード設定
// =====================================
async function resetPassword(e) {
    const btn = _btnFromEvent(e);

    const email     = document.getElementById("reset-email").value;
    const code      = document.getElementById("reset-code").value;
    const newPw      = document.getElementById("reset-new-password").value;
    const newPw2    = document.getElementById("reset-new-password2").value;

    if (!email || !code || !newPw || !newPw2) {
        notify("全て入力してください");
        return;
    }
    if (newPw !== newPw2) {
        notify("新しいパスワードが一致しません");
        return;
    }
    if (code.length !== 6) {
        notify("認証コードは6桁です");
        return;
    }

    setLoading(btn, true);
    try {
        const res = await fetch(`${API_BASE}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, new_password: newPw })
        });

        if (res.ok) {
            const data = await res.json();
            notify(data.message || "パスワードを変更しました");
            location.href = "login.html";
        } else {
            const err = await res.json();
            const msg = typeof err.detail === "string" ? err.detail : "変更に失敗しました";
            notify(msg);
        }
    } catch (err) {
        notify("サーバーに接続できません");
    } finally {
        setLoading(btn, false);
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
// 並び替え（sortSelect）の値に応じて取得する
// =====================================
async function loadFiles() {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = _skeletonHTML(4);

    // 並び替えの値を取得（例: "date_desc" → sort_by=date, order=desc）
    const sortSelect = document.getElementById("sortSelect");
    const sortValue  = sortSelect ? sortSelect.value : "name_asc";
    const [sortBy, order] = sortValue.split("_");

    try {
        const res = await fetch(`${API_BASE}/files?sort_by=${sortBy}&order=${order}`);

        if (!res.ok) {
            fileList.innerHTML = "<p style='color:#f87171'>ファイルの取得に失敗しました</p>";
            return;
        }

        const data = await res.json();

        // ダッシュボードの「マイファイル件数」を更新
        const fileCountEl = document.getElementById("heroFileCount");
        if (fileCountEl) fileCountEl.textContent = data.total;

        if (data.files.length === 0) {
            fileList.innerHTML = _emptyStateHTML(
                "fa-folder-open",
                "ファイルがありません",
                "「ファイル選択」やドラッグ＆ドロップでアップロードしてみましょう"
            );
            return;
        }

        // お気に入りを上部に固定（サーバーの並び順は各グループ内で維持）
        const favs = _getFavorites();
        const orderedFiles = [
            ...data.files.filter(f => favs.includes(f.name)),
            ...data.files.filter(f => !favs.includes(f.name)),
        ];

        fileList.innerHTML = orderedFiles.map(file => {
            const { icon, bg } = getFileIcon(file.name);
            const safeName = encodeURIComponent(file.name);   // onclick/URL用（安全）
            const dispName = escapeHtml(file.name);            // 画面表示用（XSS対策）
            const dispType = escapeHtml((file.file_type || "").toUpperCase().replace(".", ""));
            const starred = isFavorite(file.name);

            // 画像ファイルなら、色付きアイコンの代わりにサムネ表示
            //   - クリックでフルサイズプレビュー（モーダル）が開く
            //   - 画像が壊れていたら色付きアイコンにフォールバック
            const isImg = /\.(jpe?g|jfif|png|gif|webp|bmp|tiff?)$/i.test(file.name);
            const imgUrl = `${API_BASE}/preview/${safeName}`;
            const thumb = isImg
                ? `<img class="file-thumb" src="${imgUrl}" alt="${dispName}"
                        onclick="previewFile(decodeURIComponent('${safeName}')); event.stopPropagation();"
                        onerror="this.outerHTML='<div class=&quot;file-icon ${bg}&quot;><i class=&quot;fa-solid ${icon}&quot;></i></div>'">`
                : `<div class="file-icon ${bg}"><i class="fa-solid ${icon}"></i></div>`;

            const clickHandler = `previewFile(decodeURIComponent('${safeName}'))`;

            return `
            <div class="file-card ${starred ? 'is-favorite' : ''}" data-ctx="main" data-filename="${dispName}">
                <input type="checkbox" class="file-check" value="${dispName}" style="margin-right: 12px;">
                <button class="star-btn ${starred ? 'starred' : ''}" onclick="toggleFavorite(decodeURIComponent('${safeName}'))" title="お気に入り">${starred ? '★' : '☆'}</button>
                <div class="file-info-clickable" onclick="${clickHandler}">
                    ${thumb}
                    <div>
                        <div class="file-name" title="${dispName}">${dispName}</div>
                        <div class="file-detail">${dispType} ・ ${escapeHtml(file.size)} ・ ${escapeHtml(file.uploaded_at)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="downloadFile(decodeURIComponent('${safeName}'))">↓ ダウンロード</button>
                    <button class="preview-btn"  onclick="previewFile(decodeURIComponent('${safeName}'))" title="プレビュー"><i class="fa-solid fa-eye"></i></button>
                    <button class="rename-btn"   onclick="renameFile(decodeURIComponent('${safeName}'))" title="名前変更"><i class="fa-solid fa-pen"></i></button>
                    <button class="share-btn"    onclick="shareFile(decodeURIComponent('${safeName}'))" title="共有"><i class="fa-solid fa-share-nodes"></i></button>
                    <button class="delete-btn"   onclick="deleteFile(decodeURIComponent('${safeName}'))" title="削除"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
        }).join("");

        // 検索バーに入力があれば、再描画後も絞り込みを保つ
        filterFiles();

        // 自動分類ビューが表示されているなら、そちらも同期して再読込する
        const uploadedList = document.getElementById("uploadedListView");
        if (uploadedList && uploadedList.style.display === "block") {
            loadUploadedList();
        }

    } catch (e) {
        fileList.innerHTML = "<p style='color:#f87171'>サーバーに接続できません</p>";
    }
}
const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const keyword =
            this.value.toLowerCase();

        const files =
            document.querySelectorAll(".file-card");

        files.forEach(file => {

            const name =
                file.textContent.toLowerCase();

            file.style.display =
                name.includes(keyword)
                ? "flex"
                : "none";
        });
    });
}


// =====================================
// ファイル名で絞り込み（クライアント側フィルタ）
// =====================================
// カテゴリフィルタの状態（"all" / "image" / "document" / "media" / "other"）
let _categoryFilter = "all";

// カテゴリチップをクリックしたとき
function setCategoryFilter(cat, btn) {
    _categoryFilter = cat;
    document.querySelectorAll("#categoryChips .chip").forEach(c => {
        c.classList.toggle("active", c === btn);
    });
    filterFiles();
}

function filterFiles() {
    const input = document.getElementById("fileSearch");
    const clearBtn = document.getElementById("searchClear");
    if (!input) return;

    const q = input.value.trim().toLowerCase();
    if (clearBtn) clearBtn.style.display = q ? "block" : "none";

    const cards = document.querySelectorAll("#fileList .file-card");
    let shown = 0;

    cards.forEach(card => {
        const nameEl = card.querySelector(".file-name");
        const name = nameEl ? (nameEl.getAttribute("title") || nameEl.textContent).toLowerCase() : "";

        // 検索文字列とカテゴリの両方に一致したものだけ表示
        const matchText = name.includes(q);
        const matchCat  = (_categoryFilter === "all")
            || (getCategoryByFilename(name) === _categoryFilter);

        const match = matchText && matchCat;
        card.style.display = match ? "" : "none";
        if (match) shown++;
    });

    // 絞り込み結果が0件のときのメッセージ
    let noResult = document.getElementById("searchNoResult");
    const filtering = q || _categoryFilter !== "all";
    if (filtering && shown === 0 && cards.length > 0) {
        if (!noResult) {
            noResult = document.createElement("p");
            noResult.id = "searchNoResult";
            noResult.style.cssText = "color:#94a3b8;text-align:center;padding:30px";
            document.getElementById("fileList").appendChild(noResult);
        }
        noResult.textContent = q
            ? `「${input.value.trim()}」に一致するファイルがありません`
            : "このカテゴリのファイルはありません";
        noResult.style.display = "block";
    } else if (noResult) {
        noResult.style.display = "none";
    }
}

// 検索をクリア
function clearFileSearch() {
    const input = document.getElementById("fileSearch");
    if (input) input.value = "";
    filterFiles();
}


// =====================================================
// 右クリックメニュー（コンテキストメニュー）
//   file-card の data-ctx 属性を見て、その場に合った
//   メニューを表示する（main / trash / shared / link）
// =====================================================
function _ensureContextMenuEl() {
    let m = document.getElementById("context-menu");
    if (!m) {
        m = document.createElement("div");
        m.id = "context-menu";
        m.className = "context-menu";
        m.hidden = true;
        document.body.appendChild(m);
    }
    return m;
}

function hideContextMenu() {
    const m = document.getElementById("context-menu");
    if (m) m.hidden = true;
}

function showContextMenu(x, y, items) {
    const m = _ensureContextMenuEl();

    m.innerHTML = items.map((it, i) => {
        if (it.divider) return `<div class="context-menu-divider"></div>`;
        return `<button class="context-menu-item ${it.danger ? 'danger' : ''}" data-idx="${i}">
                    <span class="context-menu-icon">${it.icon || ""}</span>${escapeHtml(it.label)}
                </button>`;
    }).join("");

    // 項目クリックで対応するアクションを実行
    m.querySelectorAll(".context-menu-item").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            hideContextMenu();
            const item = items[parseInt(btn.dataset.idx, 10)];
            if (item && typeof item.action === "function") item.action();
        });
    });

    // 一旦表示してサイズを測り、画面からはみ出さない位置に調整
    m.hidden = false;
    const rect = m.getBoundingClientRect();
    let px = x, py = y;
    if (px + rect.width  > window.innerWidth)  px = window.innerWidth  - rect.width  - 8;
    if (py + rect.height > window.innerHeight) py = window.innerHeight - rect.height - 8;
    m.style.left = px + "px";
    m.style.top  = py + "px";
}

// file-card の右クリックを拾う（イベント委譲なので再描画されても効く）
function setupContextMenus() {
    document.addEventListener("contextmenu", (e) => {
        const card = e.target.closest(".file-card[data-ctx]");
        if (!card) { hideContextMenu(); return; }

        e.preventDefault();

        const ctx  = card.dataset.ctx;
        const name = card.dataset.filename;
        let items = [];

        if (ctx === "main") {
            const fav = isFavorite(name);
            items = [
                { icon: "👁", label: "プレビュー",            action: () => previewFile(name) },
                { icon: "⬇", label: "ダウンロード",          action: () => downloadFile(name) },
                { icon: fav ? "★" : "☆", label: fav ? "お気に入りを外す" : "お気に入りに追加", action: () => toggleFavorite(name) },
                { divider: true },
                { icon: "✏", label: "名前を変更",            action: () => renameFile(name) },
                { icon: "🔗", label: "共有する",              action: () => shareFile(name) },
                { divider: true },
                { icon: "🗑", label: "削除（ゴミ箱へ）",      action: () => deleteFile(name), danger: true },
            ];
        } else if (ctx === "trash") {
            items = [
                { icon: "↩", label: "復元する",              action: () => restoreFile(name) },
                { divider: true },
                { icon: "✕", label: "完全に削除",            action: () => permanentDelete(name), danger: true },
            ];
        } else if (ctx === "shared") {
            const owner = card.dataset.owner;
            const prot  = card.dataset.protected === "true";
            const me    = sessionStorage.getItem("username");
            items = [
                { icon: "👁", label: "プレビュー",            action: () => previewSharedFile(owner, name, prot) },
                { icon: "⬇", label: "ダウンロード",          action: () => downloadShared(owner, name, prot) },
            ];
            if (owner === me) {
                items.push({ divider: true });
                items.push({ icon: "🔗", label: "リンク作成",  action: () => createShareLink(name) });
                items.push({ icon: "✕", label: "共有を解除",  action: () => unshareFile(owner, name), danger: true });
            }
        } else if (ctx === "link") {
            const url   = card.dataset.url;
            const token = card.dataset.token;
            items = [
                { icon: "📋", label: "URLをコピー",           action: () => copyUrlText(url) },
                { icon: "📱", label: "QRコードを表示",        action: () => showLinkQR(url, name) },
                { divider: true },
                { icon: "✕", label: "リンクを無効化",        action: () => deleteLink(token), danger: true },
            ];
        }

        if (items.length) showContextMenu(e.clientX, e.clientY, items);
    });

    // どこかをクリック / Esc / スクロールで閉じる
    document.addEventListener("click", hideContextMenu);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideContextMenu(); });
    window.addEventListener("scroll", hideContextMenu, true);
}


// 現在表示中のファイルリストのID（マイファイル or カテゴリ別）を返す
function _activeListId() {
    const cat = document.getElementById("uploadedListView");
    if (cat && cat.style.display === "block") return "categoryFileList";
    return "fileList";
}

// 表示中（フィルタで隠れていない）カードのチェックボックスだけを取得
function _visibleChecks(id) {
    return Array.from(document.querySelectorAll(`#${id} .file-card`))
        .filter(card => card.style.display !== "none")
        .map(card => card.querySelector(".file-check"))
        .filter(Boolean);
}

// 表示中リストのチェック済みファイル名を取得
// （検索・カテゴリで非表示のものは、チェックされていても対象外にする）
function _activeCheckedNames() {
    const id = _activeListId();
    return _visibleChecks(id).filter(c => c.checked).map(c => c.value);
}


// =====================================
// 全選択 / 全解除の切り替え
// （絞り込み中は「表示されているものだけ」を対象にする）
// =====================================
function toggleSelectAll(btn) {
    const id = _activeListId();
    const checks = _visibleChecks(id);
    if (checks.length === 0) return;

    // 1つでも未チェックがあれば「全部チェック」、全部チェック済みなら「全解除」
    const allChecked = checks.every(c => c.checked);

    checks.forEach(c => c.checked = !allChecked);
    btn.textContent = allChecked ? "☑ 全選択" : "☐ 全解除";
}


// =====================================
// 選択したファイルをZIPでまとめてダウンロード
// =====================================
async function downloadSelectedZip(e) {
    const btn = _btnFromEvent(e);
    const filenames = _activeCheckedNames();

    if (filenames.length === 0) {
        notify("ダウンロードするファイルを選択してください");
        return;
    }

    setLoading(btn, true);
    try {
        const res = await fetch(`${API_BASE}/download-zip`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filenames })
        });

        if (!res.ok) {
            let msg = "ZIPの作成に失敗しました";
            try { const err = await res.json(); if (err.detail) msg = `エラー: ${err.detail}`; } catch (_) {}
            notify(msg);
            return;
        }

        // レスポンス（ZIP）をBlobとして受け取りダウンロード
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");

        // サーバーが付けたファイル名を取り出す（無ければ既定名）
        const disp = res.headers.get("Content-Disposition") || "";
        const m = disp.match(/filename="?([^"]+)"?/);
        a.href = url;
        a.download = m ? m[1] : "download.zip";
        a.click();

        URL.revokeObjectURL(url);
        notify(`${filenames.length}件をZIPでダウンロードしました`);
    } catch (err) {
        notify("ZIPのダウンロードに失敗しました");
    } finally {
        setLoading(btn, false);
    }
}


// =====================================
// 選択したファイルをまとめて削除（ゴミ箱へ）
// =====================================
async function deleteSelected(e) {
    const btn = _btnFromEvent(e);
    const filenames = _activeCheckedNames();

    if (filenames.length === 0) {
        notify("削除するファイルを選択してください");
        return;
    }

    if (!confirm(`選択した ${filenames.length} 件をゴミ箱に移動しますか？`)) return;

    setLoading(btn, true);
    try {
        const res = await fetch(`${API_BASE}/delete-multiple`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filenames })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.failed.length > 0) {
                notify(`${data.succeeded.length}件をゴミ箱に移動しました。\n失敗: ${data.failed.join(", ")}`);
            }
            await loadFiles();
            await loadStorage();
        } else {
            const err = await res.json();
            notify(`エラー: ${err.detail}`);
        }
    } catch (err) {
        notify("削除に失敗しました");
    } finally {
        setLoading(btn, false);
    }
}


// =====================================
// 使用容量を取得して表示
// =====================================
async function loadStorage() {
    try {
        const res  = await fetch(`${API_BASE}/storage`);
        const data = await res.json();

        // 上部テキスト（ヒーロー内）
        const storageText = document.getElementById("storageText");
        if (storageText) {
            storageText.textContent = `使用容量：${data.used} / ${data.max}`;
        }

        // ヒーローカードの数値・ゲージを反映
        const heroVal = document.getElementById("heroStorageText");
        if (heroVal) heroVal.textContent = data.used;

        const usedNum = parseFloat(data.used);
        const maxNum  = parseFloat(data.max);
        let pct = 0;
        if (maxNum > 0) pct = Math.min(100, Math.round((usedNum / maxNum) * 100));

        const fill = document.getElementById("heroStorageFill");
        if (fill) {
            fill.style.width = pct + "%";
            // 80%超えたら赤系にする
            fill.classList.toggle("warning", pct >= 80);
        }
        const pctEl = document.getElementById("heroStoragePct");
        if (pctEl) pctEl.textContent = `${pct}%（残り ${Math.max(0, maxNum - usedNum).toFixed(2)}GB）`;

    } catch (e) {
        // 取得失敗時は何もしない
    }
}


// =====================================
// ダッシュボードの統計（共有件数）を取得
// =====================================
async function loadDashboardStats() {
    const me = sessionStorage.getItem("username");

    try {
        const res = await fetch(`${API_BASE}/shared`);
        if (!res.ok) return;
        const data = await res.json();

        // 自分が共有したものをカウント
        const mineCount = data.files.filter(f => f.owner === me).length;
        const el = document.getElementById("heroSharedCount");
        if (el) el.textContent = mineCount;
    } catch (e) {
        // 失敗時は更新しない
    }
}


// =====================================
// ヘッダー（ユーザー名・アバター）を反映
// =====================================
function applyHeaderUser() {
    const name = sessionStorage.getItem("username") || "ゲスト";

    const nameEl = document.getElementById("userName");
    if (nameEl) nameEl.textContent = name;

    const heroEl = document.getElementById("heroUserName");
    if (heroEl) heroEl.textContent = name;

    // アバター：ユーザー名の頭文字（半角ASCII大文字）
    const avatar = document.getElementById("userAvatar");
    if (avatar) {
        const ch = name.trim().charAt(0).toUpperCase();
        avatar.textContent = ch || "?";
    }
}


// =====================================
// ファイル選択してアップロード
// =====================================
async function uploadSelectedFile(e) {
    const btn = _btnFromEvent(e);

    if (_uploadQueue.length === 0) {
        notify("ファイルを選択してください");
        return;
    }

    const zipMode = document.getElementById("zipModeToggle");
    const zipOn   = zipMode && zipMode.checked;

    // ZIP対象 / 個別対象 に振り分け
    const zipFiles = zipOn ? _uploadQueue.filter(it => it.zip).map(it => it.file) : [];
    const soloFiles = zipOn
        ? _uploadQueue.filter(it => !it.zip).map(it => it.file)
        : _uploadQueue.map(it => it.file);

    // ZIPモードなのにチェックが1つも無い → 警告
    if (zipOn && zipFiles.length === 0) {
        notify("ZIPに入れるファイルにチェックを付けてください");
        return;
    }

    setLoading(btn, true);
    try {
        let okCount = 0;
        let totalCount = soloFiles.length + (zipFiles.length > 0 ? 1 : 0);

        // ① ZIPにまとめる分（1ファイルでもZIP化する）
        if (zipFiles.length > 0) {
            const done = await _uploadAsZip(zipFiles);
            if (done) okCount++;
        }

        // ② 個別アップロード分
        for (let i = 0; i < soloFiles.length; i++) {
            const done = await uploadFileData(soloFiles[i], i + 1, soloFiles.length);
            if (done) okCount++;
        }

        if (totalCount > 1) {
            notify(`${okCount} / ${totalCount} 件のアップロードが完了しました`);
        }

        clearAllSelected();   // キューを空にしてトレイを閉じる
    } finally {
        setLoading(btn, false);
    }
}


// =====================================
// 複数ファイルを1つのZIPにまとめてアップロード
// （ブラウザ上で JSZip を使って zip を生成）
// 戻り値: 成功なら true
// =====================================
async function _uploadAsZip(files) {
    // JSZip が読み込まれているか確認
    if (typeof JSZip === "undefined") {
        notify("ZIP機能の読み込みに失敗しました（個別アップロードをお使いください）");
        return false;
    }

    // ZIPファイル名は日時から自動生成
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "").replace(/-/g, "");
    const zipName = `upload_${stamp}.zip`;

    // 進捗バーの準備
    _ensureUploadProgressUI();
    const bar   = document.getElementById("uploadProgress");
    const fill  = document.getElementById("uploadProgressFill");
    const label = document.getElementById("uploadProgressLabel");

    // --- ZIPを生成 ---
    if (bar)   bar.style.display = "block";
    if (label) label.textContent = "ZIPを作成中...";
    if (fill)  fill.style.width  = "0%";

    const zip = new JSZip();
    for (const f of files) {
        zip.file(f.name, f);
    }

    let blob;
    try {
        blob = await zip.generateAsync(
            { type: "blob", compression: "DEFLATE" },
            (meta) => {
                // zip生成の進捗（0〜100）
                if (fill)  fill.style.width  = Math.round(meta.percent) + "%";
                if (label) label.textContent = `ZIPを作成中... ${Math.round(meta.percent)}%`;
            }
        );
    } catch (err) {
        if (bar) bar.style.display = "none";
        notify("ZIPの作成に失敗しました");
        return false;
    }

    // --- 生成したZIPをファイルとしてアップロード ---
    const zipFile = new File([blob], zipName, { type: "application/zip" });
    if (label) label.textContent = `${zipName} をアップロード中...`;

    const done = await uploadFileData(zipFile);
    if (done) {
        notify(`${files.length}個のファイルを ${zipName} にまとめました`);
    }
    return done;
}


// =====================================
// ファイルアップロード処理
// =====================================
// index / total を渡すと「(2/5) ファイル名 30%」のように表示する（複数アップロード用）
// 戻り値: アップロード成功なら true
function uploadFileData(file, index, total) {
    const formData = new FormData();
    formData.append("file", file);

    _ensureUploadProgressUI();
    const bar   = document.getElementById("uploadProgress");
    const fill  = document.getElementById("uploadProgressFill");
    const label = document.getElementById("uploadProgressLabel");

    // 複数のときだけ "(2/5)" の接頭辞を付ける
    const prefix = (total && total > 1) ? `(${index}/${total}) ` : "";

    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE}/upload`);

        // アップロード進捗イベント
        xhr.upload.addEventListener("progress", (e) => {
            if (!e.lengthComputable) return;
            const pct = Math.round((e.loaded / e.total) * 100);
            if (bar)   bar.style.display = "block";
            if (fill)  fill.style.width  = pct + "%";
            if (label) label.textContent = `${prefix}${file.name}  ${pct}%`;
        });

        // 完了
        xhr.addEventListener("load", async () => {
            if (bar)  bar.style.display = "none";
            if (fill) fill.style.width  = "0%";

            if (xhr.status >= 200 && xhr.status < 300) {
                // 単体アップロード時のみ個別トースト（複数時はまとめて出す）
                if (!total || total === 1) {
                    notify(`${file.name} をアップロードしました`);
                }
                await loadFiles();
                await loadStorage();
                resolve(true);
            } else {
                let msg = `${file.name}: アップロードに失敗しました`;
                try {
                    const err = JSON.parse(xhr.responseText);
                    if (err && err.detail) msg = `${file.name}: ${err.detail}`;
                } catch (_) {}
                notify(msg);
                resolve(false);
            }
        });

        // ネットワークエラー
        xhr.addEventListener("error", () => {
            if (bar) bar.style.display = "none";
            notify(`${file.name}: アップロードに失敗しました`);
            resolve(false);
        });

        xhr.send(formData);
    });
}


// =====================================
// ファイルダウンロード
// =====================================
async function downloadFile(filename) {
    try {
        const res = await fetch(`${API_BASE}/download/${encodeURIComponent(filename)}`);

        if (!res.ok) {
            notify("ダウンロードに失敗しました");
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
        notify("ダウンロードに失敗しました");
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
            notify(`エラー: ${err.detail}`);
        }
    } catch (e) {
        notify("削除に失敗しました");
    }
}


// =====================================
// ファイル名変更（リネーム）
// 拡張子は維持し、ベース名だけを編集できるようにする
// =====================================
// =====================================================
// 共有リンク（ギガファイル便方式）
// =====================================================

// リンク発行のモーダルを用意
function _ensureLinkModal() {
    if (document.getElementById("link-modal")) return;

    const m = document.createElement("div");
    m.id = "link-modal";
    m.className = "image-modal";   // 既存のモーダル背景スタイルを流用
    m.hidden = true;
    m.innerHTML = `
        <div class="image-modal-backdrop" onclick="closeLinkModal()"></div>
        <div class="link-modal-box">
            <button class="image-modal-close" onclick="closeLinkModal()" aria-label="閉じる">✕</button>
            <div id="link-modal-body"></div>
        </div>
    `;
    document.body.appendChild(m);
}

function closeLinkModal() {
    const m = document.getElementById("link-modal");
    if (m) m.hidden = true;
}

// リンク作成ボタン：有効期限だけ聞いてリンク発行
// （パスワードは共有時に設定したものをそのまま使う）
async function createShareLink(filename) {
    const daysInput = prompt(
        `「${filename}」の共有リンクを作成します。\n\n有効期限（日数）を入力してください。\n空欄なら無期限です。`,
        "7"
    );
    if (daysInput === null) return;   // キャンセル

    const expire_days = daysInput.trim() ? parseInt(daysInput.trim(), 10) : null;
    if (daysInput.trim() && (isNaN(expire_days) || expire_days <= 0)) {
        notify("有効期限は正の数で入力してください");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/create-link/${encodeURIComponent(filename)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expire_days: expire_days })
        });

        if (!res.ok) {
            const err = await res.json();
            notify(`エラー: ${err.detail}`);
            return;
        }

        const data = await res.json();
        showLinkModal(filename, data);

    } catch (e) {
        notify("リンクの作成に失敗しました");
    }
}

// 発行されたリンクをモーダルで表示
function showLinkModal(filename, data) {
    _ensureLinkModal();

    const expireText = data.expires_at
        ? `有効期限: ${new Date(data.expires_at).toLocaleString()}`
        : "有効期限: なし（無期限）";
    const pwText = data.protected ? "🔒 パスワード保護あり" : "パスワード: なし";

    document.getElementById("link-modal-body").innerHTML = `
        <h2 class="link-modal-title">🔗 共有リンクを作成しました</h2>
        <p class="link-modal-file">${escapeHtml(filename)}</p>

        <div class="link-qr" id="link-qr"></div>
        <p class="link-qr-hint">スマホのカメラで読み取ってアクセスできます</p>

        <div class="link-url-row">
            <input type="text" id="link-url-input" class="link-url-input" value="${data.url}" readonly>
            <button class="link-copy-btn" onclick="copyShareLink()">コピー</button>
        </div>

        <p class="link-modal-meta">${expireText}</p>
        <p class="link-modal-meta">${pwText}</p>

        <p class="link-modal-hint">
            このURLを知っている人なら、ログインなしでダウンロードできます。
        </p>
    `;

    // QRコードを生成
    const qrBox = document.getElementById("link-qr");
    if (qrBox && typeof QRCode !== "undefined") {
        qrBox.innerHTML = "";
        new QRCode(qrBox, {
            text: data.url,
            width: 160,
            height: 160,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
        });
    }

    document.getElementById("link-modal").hidden = false;
}

// URLをクリップボードにコピー
async function copyShareLink() {
    const input = document.getElementById("link-url-input");
    if (!input) return;

    try {
        await navigator.clipboard.writeText(input.value);
        notify("リンクをコピーしました");
    } catch (e) {
        // フォールバック：選択してコピー
        input.select();
        document.execCommand("copy");
        notify("リンクをコピーしました");
    }
}

// 任意のURL文字列をコピー（リンク管理画面用）
async function copyUrlText(url) {
    try {
        await navigator.clipboard.writeText(url);
        notify("リンクをコピーしました");
    } catch (e) {
        notify("コピーに失敗しました");
    }
}

// 既存リンクのQRコードをモーダル表示（リンク管理画面用）
function showLinkQR(url, filename) {
    _ensureLinkModal();

    document.getElementById("link-modal-body").innerHTML = `
        <h2 class="link-modal-title">🔗 共有リンクのQRコード</h2>
        <p class="link-modal-file">${escapeHtml(filename)}</p>

        <div class="link-qr" id="link-qr"></div>
        <p class="link-qr-hint">スマホのカメラで読み取ってアクセスできます</p>

        <div class="link-url-row">
            <input type="text" id="link-url-input" class="link-url-input" value="${url}" readonly>
            <button class="link-copy-btn" onclick="copyShareLink()">コピー</button>
        </div>
    `;

    const qrBox = document.getElementById("link-qr");
    if (qrBox && typeof QRCode !== "undefined") {
        qrBox.innerHTML = "";
        new QRCode(qrBox, {
            text: url,
            width: 160,
            height: 160,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
        });
    }

    document.getElementById("link-modal").hidden = false;
}


// =====================================
// リンク管理ビューを表示
// =====================================
function showLinks() {
    switchView("links");
    loadLinks();
}

// 発行済みリンク一覧を取得して表示
async function loadLinks() {
    const list = document.getElementById("linksList");
    list.innerHTML = _skeletonHTML(2);

    try {
        const res = await fetch(`${API_BASE}/my-links`);
        if (!res.ok) {
            list.innerHTML = "<p style='color:#f87171'>リンクの取得に失敗しました</p>";
            return;
        }

        const data = await res.json();

        if (data.links.length === 0) {
            list.innerHTML = _emptyStateHTML(
                "fa-link-slash",
                "発行したリンクはありません",
                "共有一覧のファイルから「🔗 リンク作成」で発行できます"
            );
            return;
        }

        list.innerHTML = data.links.map(link => {
            const { icon, bg } = getFileIcon(link.filename);
            const safeToken = encodeURIComponent(link.token);

            // 有効期限の表示
            let expireText = "有効期限: なし";
            let expired = false;
            if (link.expires_at) {
                const d = new Date(link.expires_at);
                expired = d < new Date();
                expireText = `有効期限: ${d.toLocaleString()}${expired ? "（期限切れ）" : ""}`;
            }

            // URLは onclick に渡すため一旦エンコードし、関数側でデコード
            const safeUrl = encodeURIComponent(link.url);

            return `
            <div class="file-card" data-ctx="link" data-filename="${escapeHtml(link.filename)}" data-url="${escapeHtml(link.url)}" data-token="${escapeHtml(link.token)}">
                <div class="file-info">
                    <div class="file-icon ${bg}">
                        <i class="fa-solid ${icon}"></i>
                    </div>
                    <div>
                        <div class="file-name" title="${escapeHtml(link.filename)}">${escapeHtml(link.filename)}</div>
                        <div class="file-detail" style="${expired ? 'color:#f87171' : ''}">${escapeHtml(expireText)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="copyUrlText(decodeURIComponent('${safeUrl}'))">📋 URLコピー</button>
                    <button class="link-btn"     onclick="showLinkQR(decodeURIComponent('${safeUrl}'), decodeURIComponent('${encodeURIComponent(link.filename)}'))">📱 QR</button>
                    <button class="delete-btn"   onclick="deleteLink(decodeURIComponent('${safeToken}'))">✕ 無効化</button>
                </div>
            </div>`;
        }).join("");

    } catch (e) {
        list.innerHTML = "<p style='color:#f87171'>サーバーに接続できません</p>";
    }
}

// リンクを無効化（削除）
async function deleteLink(token) {
    if (!confirm("このリンクを無効化しますか？\nこのURLでのダウンロードができなくなります。")) return;

    try {
        const res = await fetch(`${API_BASE}/link/${encodeURIComponent(token)}`, {
            method: "DELETE"
        });

        if (res.ok) {
            notify("リンクを無効化しました");
            await loadLinks();
        } else {
            const err = await res.json();
            notify(`エラー: ${err.detail}`);
        }
    } catch (e) {
        notify("無効化に失敗しました");
    }
}


async function renameFile(filename) {
    // 元の拡張子（".pdf" など）とベース名を分離
    const dotIdx = filename.lastIndexOf(".");
    const ext  = dotIdx > 0 ? filename.slice(dotIdx) : "";
    const base = dotIdx > 0 ? filename.slice(0, dotIdx) : filename;

    // 入力プロンプトはベース名だけを編集対象に
    const message = ext
        ? `新しい名前を入力してください\n（拡張子 ${ext} はそのままです）`
        : `新しい名前を入力してください`;

    const input = prompt(message, base);
    if (input === null) return;

    let newBase = input.trim();
    if (!newBase) return;

    // ユーザーが拡張子付きで入れてしまった場合は剥がす
    // 例: 元 .pdf で「report.pdf」と入れた → "report" に直す
    if (ext && newBase.toLowerCase().endsWith(ext.toLowerCase())) {
        newBase = newBase.slice(0, -ext.length);
    }

    const newName = newBase + ext;
    if (newName === filename) return;   // 同じ名前

    try {
        const res = await fetch(
            `${API_BASE}/rename/${encodeURIComponent(filename)}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ new_name: newName })
            }
        );

        if (res.ok) {
            const data = await res.json();
            notify(data.message || "名前を変更しました");
            await loadFiles();
        } else {
            const err = await res.json();
            notify(`エラー: ${err.detail}`);
        }
    } catch (e) {
        notify("名前の変更に失敗しました");
    }
}


// =====================================================
// ここから下：ゴミ箱ビュー
// =====================================================


// =====================================
// 表示するビューを切り替える内部関数
// "main" / "trash" / "shared" のどれか1つだけ表示
//  + 表示するビューに入場アニメーションを毎回付け直す
// =====================================
function switchView(view) {
    const views = {
        main:          document.getElementById("mainView"),
        trash:         document.getElementById("trashView"),
        shared:        document.getElementById("sharedView"),
        links:         document.getElementById("linksView"),
        uploadedList:  document.getElementById("uploadedListView"),
    };

    for (const key in views) {
        if (views[key]) views[key].style.display = (key === view) ? "block" : "none";
    }

    // 表示中の要素にアニメーションクラスを付け直す（リフロー強制で再生）
    const visible = views[view];
    if (visible) {
        visible.classList.remove("view-enter");
        void visible.offsetWidth;
        visible.classList.add("view-enter");
    }

    // タブの見た目（active＋スライドする下線）を更新
    updateTabIndicator(view);
}


// =====================================
// タブを切り替える（ビュー表示＋データ読み込み）
// =====================================
function switchTab(view) {
    switchView(view);

    if (view === "main")              loadFiles();
    else if (view === "uploadedList") loadUploadedList();
    else if (view === "shared")       loadShared();
    else if (view === "links")        loadLinks();
    else if (view === "trash")        loadTrash();
}


// アクティブなタブに下線インジケーターをスライド移動
function updateTabIndicator(view) {
    const bar = document.getElementById("tabBar");
    const indicator = document.getElementById("tabIndicator");
    if (!bar || !indicator) return;

    // 全タブの active クラスを更新
    const tabs = bar.querySelectorAll(".tab");
    let activeTab = null;
    tabs.forEach(t => {
        const isActive = t.dataset.view === view;
        t.classList.toggle("active", isActive);
        if (isActive) activeTab = t;
    });

    if (!activeTab) return;

    // インジケーターをアクティブタブの位置・幅に合わせる
    indicator.style.width = activeTab.offsetWidth + "px";
    indicator.style.transform = `translateX(${activeTab.offsetLeft}px)`;

    // アクティブタブが見える位置までスクロール
    activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
}


// =====================================
// ゴミ箱ビューを表示
// =====================================
function showTrash() {
    switchView("trash");
    loadTrash();
}


// =====================================
// 通常のファイル一覧ビューに戻る
// =====================================
function showFiles() {
    switchView("main");
    loadFiles();
}


// =====================================
// ゴミ箱の中身を取得して表示
// =====================================
async function loadTrash() {
    const trashList = document.getElementById("trashList");
    trashList.innerHTML = _skeletonHTML(3);

    try {
        const res = await fetch(`${API_BASE}/trash`);

        if (!res.ok) {
            trashList.innerHTML = "<p style='color:#f87171'>ゴミ箱の取得に失敗しました</p>";
            return;
        }

        const data = await res.json();

        if (data.files.length === 0) {
            trashList.innerHTML = _emptyStateHTML(
                "fa-trash-can",
                "ゴミ箱は空です",
                "ここから削除したファイルを復元できます"
            );
            return;
        }

        // 並び替え（ゴミ箱は deleted_at で並べられる）
        const sortSel = document.getElementById("trashSort");
        const sortedFiles = _sortFileArray(data.files, sortSel ? sortSel.value : "name_asc", "deleted_at");

        trashList.innerHTML = sortedFiles.map(file => {
            const { icon, bg } = getFileIcon(file.name);
            const safeName = encodeURIComponent(file.name);
            const dispName = escapeHtml(file.name);
            const dispType = escapeHtml((file.file_type || "").toUpperCase().replace(".", ""));
            return `
            <div class="file-card" data-ctx="trash" data-filename="${dispName}">
                <div class="file-info">
                    <div class="file-icon ${bg}">
                        <i class="fa-solid ${icon}"></i>
                    </div>
                    <div>
                        <div class="file-name" title="${dispName}">${dispName}</div>
                        <div class="file-detail">${dispType} ・ ${escapeHtml(file.size)} ・ 削除: ${escapeHtml(file.deleted_at)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="restoreFile(decodeURIComponent('${safeName}'))">↩ 復元</button>
                    <button class="delete-btn"   onclick="permanentDelete(decodeURIComponent('${safeName}'))" title="完全削除"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>`;
        }).join("");

    } catch (e) {
        trashList.innerHTML = "<p style='color:#f87171'>サーバーに接続できません</p>";
    }
}


// =====================================
// ゴミ箱からファイルを復元
// =====================================
async function restoreFile(filename) {
    try {
        const res = await fetch(
            `${API_BASE}/restore/${encodeURIComponent(filename)}`,
            { method: "POST" }
        );

        if (res.ok) {
            await loadTrash();
            await loadStorage();
        } else {
            const err = await res.json();
            notify(`エラー: ${err.detail}`);
        }
    } catch (e) {
        notify("復元に失敗しました");
    }
}


// =====================================
// ゴミ箱内ファイルの完全削除（復元不可）
// =====================================
async function permanentDelete(filename) {
    if (!confirm(`「${filename}」を完全に削除しますか？\nこの操作は元に戻せません。`)) return;

    try {
        const res = await fetch(
            `${API_BASE}/trash/${encodeURIComponent(filename)}`,
            { method: "DELETE" }
        );

        if (res.ok) {
            await loadTrash();
        } else {
            const err = await res.json();
            notify(`エラー: ${err.detail}`);
        }
    } catch (e) {
        notify("完全削除に失敗しました");
    }
}


// =====================================
// ゴミ箱を空にする（全件完全削除）
// =====================================
async function emptyTrash(e) {
    const btn = _btnFromEvent(e);
    if (!confirm("ゴミ箱を空にしますか？\nすべてのファイルが完全に削除され、元に戻せません。")) return;

    setLoading(btn, true);
    try {
        const res = await fetch(`${API_BASE}/trash`, { method: "DELETE" });

        if (res.ok) {
            const data = await res.json();
            notify(data.message);
            await loadTrash();
        } else {
            const err = await res.json();
            notify(`エラー: ${err.detail}`);
        }
    } catch (err) {
        notify("ゴミ箱を空にできませんでした");
    } finally {
        setLoading(btn, false);
    }
}


// =====================================================
// ここから下：共有フォルダ
// =====================================================


// =====================================
// 自分のファイルを共有する（パスワード任意）
// =====================================
async function shareFile(filename) {
    // パスワードを尋ねる（空欄ならパスワードなし）
    const password = prompt(
        `「${filename}」を共有します。\nパスワードを付ける場合は入力（不要なら空欄でOK）:`,
        ""
    );

    // prompt でキャンセルした場合は中止
    if (password === null) return;

    try {
        const res = await fetch(
            `${API_BASE}/share/${encodeURIComponent(filename)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: password || null })
            }
        );

        if (res.ok) {
            const data = await res.json();
            notify(data.message);
        } else {
            const err = await res.json();
            notify(`エラー: ${err.detail}`);
        }
    } catch (e) {
        notify("共有に失敗しました");
    }
}


// =====================================
// 選択したファイルをまとめて共有（同じパスワード）
// =====================================
async function shareSelected(e) {
    const btn = _btnFromEvent(e);
    const filenames = _activeCheckedNames();

    if (filenames.length === 0) {
        notify("共有するファイルを選択してください");
        return;
    }

    const password = prompt(
        `選択した ${filenames.length} 件を共有します。\n共通のパスワードを付ける場合は入力（不要なら空欄でOK）:`,
        ""
    );

    if (password === null) return;

    setLoading(btn, true);
    try {
        const res = await fetch(`${API_BASE}/share-multiple`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filenames, password: password || null })
        });

        if (res.ok) {
            const data = await res.json();
            let msg = data.message;
            if (data.failed.length > 0) {
                msg += `\n共有できなかったもの: ${data.failed.join(", ")}`;
            }
            notify(msg);
        } else {
            const err = await res.json();
            notify(`エラー: ${err.detail}`);
        }
    } catch (err) {
        notify("共有に失敗しました");
    } finally {
        setLoading(btn, false);
    }
}


// =====================================
// 共有ビューを表示
// =====================================
function showShared() {
    switchView("shared");
    loadShared();
}


// =====================================
// 共有ファイル一覧を取得して表示
// =====================================
async function loadShared() {
    const sharedList = document.getElementById("sharedList");
    sharedList.innerHTML = _skeletonHTML(3);

    // 自分のユーザー名（自分が共有したものだけ「解除」ボタンを出すため）
    const me = sessionStorage.getItem("username");

    try {
        const res = await fetch(`${API_BASE}/shared`);

        if (!res.ok) {
            sharedList.innerHTML = "<p style='color:#f87171'>共有ファイルの取得に失敗しました</p>";
            return;
        }

        const data = await res.json();

        if (data.files.length === 0) {
            sharedList.innerHTML = _emptyStateHTML(
                "fa-share-nodes",
                "共有ファイルはありません",
                "ファイル一覧の「🔗 共有」ボタンから共有できます"
            );
            return;
        }

        // 並び替え（共有はsorted_at／所有者でも並べられる）
        const sortSel = document.getElementById("sharedSort");
        const sortedFiles = _sortFileArray(data.files, sortSel ? sortSel.value : "name_asc", "shared_at");

        sharedList.innerHTML = sortedFiles.map(file => {
            const { icon, bg } = getFileIcon(file.name);
            const safeOwner = encodeURIComponent(file.owner);
            const safeName  = encodeURIComponent(file.name);
            const dispName  = escapeHtml(file.name);    // 画面表示用（XSS対策）
            const dispOwner = escapeHtml(file.owner);

            // パスワード保護されているファイルには鍵マークを付ける
            const lock = file.protected ? " 🔒" : "";

            // 自分が共有したファイルだけ「共有解除」ボタンを表示
            // 自分が共有したファイルだけ「リンク作成」「共有解除」を表示
            const ownerBtns = (file.owner === me)
                ? `<button class="link-btn" onclick="createShareLink(decodeURIComponent('${safeName}'))" title="リンク作成"><i class="fa-solid fa-link"></i></button>
                   <button class="delete-btn" onclick="unshareFile(decodeURIComponent('${safeOwner}'), decodeURIComponent('${safeName}'))" title="共有解除"><i class="fa-solid fa-link-slash"></i></button>`
                : "";

            const clickHandler = `previewSharedFile(decodeURIComponent('${safeOwner}'), decodeURIComponent('${safeName}'), ${file.protected})`;
            const dlHandler = `downloadShared(decodeURIComponent('${safeOwner}'), decodeURIComponent('${safeName}'), ${file.protected})`;

            // 共有ファイルのサムネイル表示
            const isImg = /\.(jpe?g|jfif|png|gif|webp|bmp|tiff?)$/i.test(file.name);
            const imgUrl = `${API_BASE}/shared/preview/${safeOwner}/${safeName}`;
            const thumb = (isImg && !file.protected)
                ? `<img class="file-thumb" src="${imgUrl}" alt="${dispName}"
                        onclick="previewSharedFile(decodeURIComponent('${safeOwner}'), decodeURIComponent('${safeName}'), ${file.protected}); event.stopPropagation();"
                        onerror="this.outerHTML='<div class=&quot;file-icon ${bg}&quot;><i class=&quot;fa-solid ${icon}&quot;></i></div>'">`
                : `<div class="file-icon ${bg}"><i class="fa-solid ${icon}"></i></div>`;

            return `
            <div class="file-card" data-ctx="shared" data-filename="${dispName}" data-owner="${dispOwner}" data-protected="${file.protected}">
                <div class="file-info-clickable" onclick="${clickHandler}">
                    ${thumb}
                    <div>
                        <div class="file-name" title="${dispName}">${dispName}${lock}</div>
                        <div class="file-detail">共有者: ${dispOwner} ・ ${escapeHtml(file.size)} ・ ${escapeHtml(file.shared_at)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="${dlHandler}">↓ ダウンロード</button>
                    <button class="preview-btn"  onclick="${clickHandler}" title="プレビュー"><i class="fa-solid fa-eye"></i></button>
                    ${ownerBtns}
                </div>
            </div>`;
        }).join("");

    } catch (e) {
        sharedList.innerHTML = "<p style='color:#f87171'>サーバーに接続できません</p>";
    }
}


// =====================================
// 共有ファイルをダウンロード
// 保護されている場合はパスワードを尋ねてヘッダーで送る
// =====================================
async function downloadShared(owner, filename, isProtected) {
    const headers = {};

    // パスワード保護ありなら入力を求める
    if (isProtected) {
        const password = prompt(`「${filename}」はパスワードで保護されています。\nパスワードを入力:`);
        if (password === null) return;  // キャンセル
        headers["X-Share-Password"] = password;
    }

    try {
        const res = await fetch(
            `${API_BASE}/shared/download/${encodeURIComponent(owner)}/${encodeURIComponent(filename)}`,
            { headers }
        );

        if (!res.ok) {
            if (res.status === 401) {
                notify("パスワードが違います（または必要です）");
            } else {
                notify("ダウンロードに失敗しました");
            }
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
        notify("ダウンロードに失敗しました");
    }
}


// =====================================
// 共有を解除（自分が共有したものだけ）
// =====================================
async function unshareFile(owner, filename) {
    if (!confirm(`「${filename}」の共有を解除しますか？\n（あなたの個人ファイルは残ります）`)) return;

    try {
        const res = await fetch(
            `${API_BASE}/shared/${encodeURIComponent(owner)}/${encodeURIComponent(filename)}`,
            { method: "DELETE" }
        );

        if (res.ok) {
            await loadShared();
        } else {
            const err = await res.json();
            notify(`エラー: ${err.detail}`);
        }
    } catch (e) {
        notify("共有の解除に失敗しました");
    }
}


// =====================================
// ドラッグ＆ドロップ設定
// =====================================
function setupDropArea() {
    // ドロップされたファイルは選択トレイに追加するだけ
    // （実際のアップロードは「アップロード」ボタンで実行）
    function handleDroppedFiles(fileList) {
        const files = Array.from(fileList || []);
        if (files.length === 0) return;
        addFilesToQueue(files);
        notify(`${files.length}件を選択に追加しました`);
    }

    // --- 画面全体のドラッグ&ドロップ（どこに落としてもOK） ---
    const overlay = _ensureDropOverlay();
    let dragDepth = 0;   // dragenter/leave のネスト対策カウンタ

    window.addEventListener("dragenter", (e) => {
        if (!e.dataTransfer || !Array.from(e.dataTransfer.types).includes("Files")) return;
        e.preventDefault();
        dragDepth++;
        overlay.classList.add("show");
    });

    window.addEventListener("dragover", (e) => {
        if (e.dataTransfer && Array.from(e.dataTransfer.types).includes("Files")) {
            e.preventDefault();
        }
    });

    window.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) overlay.classList.remove("show");
    });

    window.addEventListener("drop", async (e) => {
        e.preventDefault();
        dragDepth = 0;
        overlay.classList.remove("show");

        // ファイル一覧ページでのみ受け付ける
        if (!document.getElementById("fileList")) return;
        await handleDroppedFiles(e.dataTransfer.files);
    });
}

// 全画面ドロップ用のオーバーレイを用意
function _ensureDropOverlay() {
    let ov = document.getElementById("drop-overlay");
    if (!ov) {
        ov = document.createElement("div");
        ov.id = "drop-overlay";
        ov.className = "drop-overlay";
        ov.innerHTML = `
            <div class="drop-overlay-inner">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <p>ここにドロップしてアップロード</p>
            </div>
        `;
        document.body.appendChild(ov);
    }
    return ov;
}


// =====================================
// ファイル一覧ページの初期化
// =====================================
// =====================================
// 設定ページの初期化
// =====================================
async function initSettingsPage() {
    const username = sessionStorage.getItem("username");
    if (!username) {
        location.href = "login.html";
        return;
    }

    // テーマアイコン
    applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

    // アバター（頭文字）
    const ch = username.trim().charAt(0).toUpperCase() || "?";
    const avatar = document.getElementById("settingsAvatar");
    if (avatar) avatar.textContent = ch;

    document.getElementById("settingsUsername").textContent = username;
    document.getElementById("infoUsername").textContent = username;

    // /me からロールを取得
    try {
        const res = await fetch(`${API_BASE}/me`);
        if (res.ok) {
            const data = await res.json();
            const role = data.role || "user";
            document.getElementById("settingsRole").textContent = `権限: ${role}`;
            document.getElementById("infoRole").textContent = role;

            // 管理者の場合はバックアップ設定とWebhook設定を表示
            if (role === "admin") {
                const bSec = document.getElementById("backupSettingsSection");
                if (bSec) {
                    bSec.style.display = "block";
                    loadBackupSettings();
                    loadBackupHistory();
                }
                const wSec = document.getElementById("webhookSettingsSection");
                if (wSec) {
                    wSec.style.display = "block";
                    loadWebhookSettings();
                }
            }
        }
    } catch (_) {}

    // 容量
    try {
        const res = await fetch(`${API_BASE}/storage`);
        if (res.ok) {
            const data = await res.json();
            document.getElementById("infoStorage").textContent = `${data.used} / ${data.max}`;
        }
    } catch (_) {}
}


window.addEventListener("load", () => {
    // 設定ページなら専用初期化
    if (document.getElementById("settingsUsername")) {
        initSettingsPage();
        return;
    }

    if (!document.getElementById("fileList")) return;

    const username = sessionStorage.getItem("username");
    if (!username) {
        location.href = "login.html";
        return;
    }

    applyHeaderUser();
    // 現在のテーマアイコンに合わせて切替ボタンを更新
    applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

    // 前回の表示モード（リスト/グリッド）を復元
    applyViewMode();

    // タブの下線インジケーターを初期位置（マイファイル）に合わせる
    updateTabIndicator("main");
    // ウィンドウ幅が変わったら位置を再計算
    window.addEventListener("resize", () => {
        const active = document.querySelector(".tab.active");
        if (active) updateTabIndicator(active.dataset.view);
    });

    loadFiles();
    loadStorage();
    loadDashboardStats();
    setupDropArea();
    _ensureUploadProgressUI();
    setupContextMenus();   // ファイルカードの右クリックメニュー

    // ファイル選択直後にトレイへ追加（複数回の選択も累積できる）
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.addEventListener("change", () => {
            addFilesToQueue(fileInput.files);
            fileInput.value = "";   // 同じファイルを再選択できるようにクリア
        });
    }
});


// =====================================================
// ここから下：自動分類「アップロードしたファイル一覧」表示処理
// =====================================================
let _allUploadedFiles = [];
let _currentCategory = "image";

function showUploadedList() {
    switchView("uploadedList");
    loadUploadedList();
}

function getCategoryByFilename(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    const images = ["jpg", "jpeg", "jfif", "png", "gif", "webp", "bmp", "tif", "tiff", "heic", "heif"];
    const documents = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"];
    const media = ["mp4", "mov", "webm", "mp3", "wav", "m4a", "aac"];
    
    if (images.includes(ext)) return "image";
    if (documents.includes(ext)) return "document";
    if (media.includes(ext)) return "media";
    return "other";
}

async function loadUploadedList() {
    const grid = document.getElementById("categoryGrid");
    const list = document.getElementById("categoryFileList");
    if (!grid || !list) return;

    grid.innerHTML = _skeletonHTML(4);
    list.innerHTML = _skeletonHTML(3);

    try {
        const res = await fetch(`${API_BASE}/files?sort_by=name&order=asc`);
        if (!res.ok) {
            grid.innerHTML = "<p style='color:#f87171'>ファイルの取得に失敗しました</p>";
            list.innerHTML = "";
            return;
        }

        const data = await res.json();
        _allUploadedFiles = data.files || [];

        renderCategoryGrid();
        renderCategoryFileList();

    } catch (e) {
        grid.innerHTML = "<p style='color:#f87171'>サーバーに接続できません</p>";
        list.innerHTML = "";
    }
}

function renderCategoryGrid() {
    const grid = document.getElementById("categoryGrid");
    if (!grid) return;

    const categories = {
        image:    { title: "画像ファイル", icon: "fa-file-image", count: 0, bytes: 0 },
        document: { title: "文書・書類",   icon: "fa-file-word",  count: 0, bytes: 0 },
        media:    { title: "動画・音楽",   icon: "fa-file-video", count: 0, bytes: 0 },
        other:    { title: "その他・圧縮", icon: "fa-file-zipper", count: 0, bytes: 0 },
    };

    _allUploadedFiles.forEach(file => {
        const cat = getCategoryByFilename(file.name);
        categories[cat].count++;
        
        let bytes = 0;
        const match = file.size.match(/^([\d.]+)\s*([A-Za-z]+)$/);
        if (match) {
            const val = parseFloat(match[1]);
            const unit = match[2].toUpperCase();
            if (unit === "B") bytes = val;
            else if (unit === "KB") bytes = val * 1024;
            else if (unit === "MB") bytes = val * 1024 * 1024;
            else if (unit === "GB") bytes = val * 1024 * 1024 * 1024;
        }
        categories[cat].bytes += bytes;
    });

    grid.innerHTML = Object.keys(categories).map(key => {
        const cat = categories[key];
        const activeClass = (key === _currentCategory) ? "active" : "";
        const formattedSize = _formatFileSize(cat.bytes);

        return `
        <div class="category-card ${activeClass}" data-cat="${key}" onclick="selectCategory('${key}')">
            <div class="category-icon">
                <i class="fa-solid ${cat.icon}"></i>
            </div>
            <div class="category-title">${cat.title}</div>
            <div class="category-info">
                <span class="category-count">${cat.count}<span style="font-size:13px; font-weight:normal; margin-left:2px; opacity:0.7">件</span></span>
                <span class="category-size">${formattedSize}</span>
            </div>
        </div>`;
    }).join("");
}

function renderCategoryFileList() {
    const list = document.getElementById("categoryFileList");
    if (!list) return;

    const filtered = _allUploadedFiles.filter(file => getCategoryByFilename(file.name) === _currentCategory);

    if (filtered.length === 0) {
        list.innerHTML = _emptyStateHTML(
            "fa-folder-open",
            "このカテゴリは空です",
            "該当するファイルがアップロードされていません。"
        );
        return;
    }

    list.innerHTML = filtered.map(file => {
        const { icon, bg } = getFileIcon(file.name);
        const safeName = encodeURIComponent(file.name);
        const dispName = escapeHtml(file.name);
        const dispType = escapeHtml((file.file_type || "").toUpperCase().replace(".", ""));

        const isImg = /\.(jpe?g|jfif|png|gif|webp|bmp|tiff?)$/i.test(file.name);
        const imgUrl = `${API_BASE}/preview/${safeName}`;
        const thumb = isImg
            ? `<img class="file-thumb" src="${imgUrl}" alt="${dispName}"
                    onclick="previewFile(decodeURIComponent('${safeName}')); event.stopPropagation();"
                    onerror="this.outerHTML='<div class=&quot;file-icon ${bg}&quot;><i class=&quot;fa-solid ${icon}&quot;></i></div>'">`
            : `<div class="file-icon ${bg}"><i class="fa-solid ${icon}"></i></div>`;

        const clickHandler = `previewFile(decodeURIComponent('${safeName}'))`;

        const starred = isFavorite(file.name);

        return `
        <div class="file-card" data-ctx="main" data-filename="${dispName}">
            <div class="file-info" style="display:flex; align-items:center; width:100%;">
                <input type="checkbox" class="file-check" value="${dispName}" style="margin-right:12px;">
                <button class="star-btn ${starred ? 'starred' : ''}" onclick="toggleFavorite(decodeURIComponent('${safeName}'))" title="お気に入り" style="margin-right:12px;">${starred ? '★' : '☆'}</button>
                <div class="file-info-clickable" onclick="${clickHandler}" style="display:flex; align-items:center; gap:12px; cursor:pointer; flex:1;">
                    ${thumb}
                    <div>
                        <div class="file-name" title="${dispName}">${dispName}</div>
                        <div class="file-detail">${dispType} ・ ${escapeHtml(file.size)} ・ ${escapeHtml(file.uploaded_at)}</div>
                    </div>
                </div>
            </div>
            <div class="file-actions">
                <button class="download-btn" onclick="downloadFile(decodeURIComponent('${safeName}'))">↓ ダウンロード</button>
                <button class="preview-btn"  onclick="previewFile(decodeURIComponent('${safeName}'))" title="プレビュー"><i class="fa-solid fa-eye"></i></button>
                <button class="rename-btn"   onclick="renameFile(decodeURIComponent('${safeName}'))" title="名前変更"><i class="fa-solid fa-pen"></i></button>
                <button class="share-btn"    onclick="shareFile(decodeURIComponent('${safeName}'))" title="共有"><i class="fa-solid fa-share-nodes"></i></button>
                <button class="delete-btn"   onclick="deleteFile(decodeURIComponent('${safeName}'))" title="削除"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`;
    }).join("");
}

function selectCategory(category) {
    _currentCategory = category;
    renderCategoryGrid();
    renderCategoryFileList();
}


// =====================================================
// バックアップ管理処理（設定、手動実行、履歴取得、削除）
// =====================================================
async function loadBackupSettings() {
    try {
        const res = await fetch(`${API_BASE}/backup/settings`);
        if (res.ok) {
            const data = await res.json();
            const toggle = document.getElementById("backupToggle");
            const timeInput = document.getElementById("backupTime");
            if (toggle) toggle.checked = !!data.enabled;
            if (timeInput) timeInput.value = data.time || "00:00";
        }
    } catch (e) {
        notify("バックアップ設定の取得に失敗しました");
    }
}

async function saveBackupSettings(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById("saveBackupBtn");
    const toggle = document.getElementById("backupToggle");
    const timeInput = document.getElementById("backupTime");

    const enabled = toggle ? toggle.checked : false;
    const timeVal = timeInput ? timeInput.value.trim() : "00:00";

    // 簡単な時刻バリデーション (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(timeVal)) {
        notify("実行時刻は '00:00' のような半角の形式で入力してください");
        return;
    }
    const [h, m] = timeVal.split(":").map(Number);
    if (h < 0 || h > 23 || m < 0 || m > 59) {
        notify("実行時刻が正しくありません (00:00 〜 23:59)");
        return;
    }

    setLoading(btn, true);
    try {
        const res = await fetch(`${API_BASE}/backup/settings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled, time: timeVal })
        });
        if (res.ok) {
            notify("バックアップ設定を保存しました");
        } else {
            const err = await res.json();
            notify(`保存失敗: ${err.detail}`);
        }
    } catch (err) {
        notify("サーバー通信に失敗しました");
    } finally {
        setLoading(btn, false);
    }
}

async function runManualBackup(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById("runBackupBtn");
    if (!confirm("手動バックアップを作成しますか？\n（ファイル数によっては数十秒かかる場合があります）")) return;

    setLoading(btn, true);
    try {
        const res = await fetch(`${API_BASE}/backup/run`, {
            method: "POST"
        });
        if (res.ok) {
            const data = await res.json();
            notify(`バックアップを作成しました: ${data.filename}`);
            await loadBackupHistory();
        } else {
            const err = await res.json();
            notify(`作成失敗: ${err.detail}`);
        }
    } catch (err) {
        notify("サーバー通信に失敗しました");
    } finally {
        setLoading(btn, false);
    }
}

async function loadBackupHistory() {
    const list = document.getElementById("backupList");
    if (!list) return;

    list.innerHTML = _skeletonHTML(2);

    try {
        const res = await fetch(`${API_BASE}/backup/list`);
        if (!res.ok) {
            list.innerHTML = "<p style='color:#f87171'>バックアップ履歴の取得に失敗しました</p>";
            return;
        }

        const backups = await res.json();

        if (backups.length === 0) {
            list.innerHTML = _emptyStateHTML(
                "fa-file-zipper",
                "バックアップ履歴はありません",
                "設定時刻になるか、「今すぐバックアップ」で作成できます"
            );
            return;
        }

        list.innerHTML = backups.map(file => {
            const safeName = encodeURIComponent(file.filename);
            const downloadUrl = `${API_BASE}/backup/download/${safeName}`;

            return `
            <div class="file-card">
                <div class="file-info">
                    <div class="file-icon zip-bg">
                        <i class="fa-solid fa-file-zipper"></i>
                    </div>
                    <div>
                        <div class="file-name" title="${file.filename}">${file.filename}</div>
                        <div class="file-detail">ZIP圧縮形式 ・ ${file.size} ・ 作成: ${file.created_at}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="window.open('${downloadUrl}', '_blank')" title="ダウンロード">↓ ダウンロード</button>
                    <button class="delete-btn"   onclick="deleteBackup('${file.filename}')" title="削除"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
        }).join("");

    } catch (e) {
        list.innerHTML = "<p style='color:#f87171'>サーバーに接続できません</p>";
    }
}

async function deleteBackup(filename) {
    if (!confirm(`バックアップ「${filename}」を削除しますか？\nこの操作は元に戻せません。`)) return;

    try {
        const res = await fetch(`${API_BASE}/backup/${encodeURIComponent(filename)}`, {
            method: "DELETE"
        });

        if (res.ok) {
            notify("バックアップを削除しました");
            await loadBackupHistory();
        } else {
            const err = await res.json();
            notify(`削除失敗: ${err.detail}`);
        }
    } catch (e) {
        notify("削除に失敗しました");
    }
}

// =====================================================
// 外部サービス連携 (Webhook) 管理処理（設定取得、保存、テスト）
// =====================================================
async function loadWebhookSettings() {
    try {
        const res = await fetch(`${API_BASE}/settings/webhook`);
        if (res.ok) {
            const data = await res.json();
            const urlInput = document.getElementById("webhookUrl");
            const uploadToggle = document.getElementById("notifyUpload");
            const deleteToggle = document.getElementById("notifyDelete");
            const shareToggle = document.getElementById("notifyShare");

            if (urlInput) urlInput.value = data.webhook_url || "";
            if (uploadToggle) uploadToggle.checked = data.notify_upload !== false;
            if (deleteToggle) deleteToggle.checked = data.notify_delete !== false;
            if (shareToggle) shareToggle.checked = data.notify_share !== false;
        }
    } catch (e) {
        notify("Webhook設定の取得に失敗しました");
    }
}

async function saveWebhookSettings(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById("saveWebhookBtn");
    const urlInput = document.getElementById("webhookUrl");
    const uploadToggle = document.getElementById("notifyUpload");
    const deleteToggle = document.getElementById("notifyDelete");
    const shareToggle = document.getElementById("notifyShare");

    const webhook_url = urlInput ? urlInput.value.trim() : "";
    const notify_upload = uploadToggle ? uploadToggle.checked : false;
    const notify_delete = deleteToggle ? deleteToggle.checked : false;
    const notify_share = shareToggle ? shareToggle.checked : false;

    if (webhook_url && !/^https?:\/\/.+/.test(webhook_url)) {
        notify("有効な URL を入力してください (http:// または https://)");
        return;
    }

    setLoading(btn, true);
    try {
        const res = await fetch(`${API_BASE}/settings/webhook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                webhook_url,
                notify_upload,
                notify_delete,
                notify_share
            })
        });
        if (res.ok) {
            notify("Webhook設定を保存しました");
        } else {
            const err = await res.json();
            notify(`保存失敗: ${err.detail}`);
        }
    } catch (err) {
        notify("サーバー通信に失敗しました");
    } finally {
        setLoading(btn, false);
    }
}

async function testWebhookSettings(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById("testWebhookBtn");
    const urlInput = document.getElementById("webhookUrl");
    const webhook_url = urlInput ? urlInput.value.trim() : "";

    if (!webhook_url) {
        notify("テスト送信する Webhook URL を入力してください");
        return;
    }

    if (!/^https?:\/\/.+/.test(webhook_url)) {
        notify("有効な URL を入力してください (http:// または https://)");
        return;
    }

    setLoading(btn, true);
    try {
        const res = await fetch(`${API_BASE}/settings/webhook/test`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ webhook_url })
        });
        if (res.ok) {
            notify("テスト通知を送信しました。設定されたチャンネルを確認してください。");
        } else {
            const err = await res.json();
            notify(`テスト送信失敗: ${err.detail}`);
        }
    } catch (err) {
        notify("サーバー通信に失敗しました");
    } finally {
        setLoading(btn, false);
    }
}