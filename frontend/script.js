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
// バイト数を「1.2MB」などの読みやすい形式に変換
// =====================================
function _formatFileSize(bytes) {
    if (bytes < 1024)              return bytes + "B";
    if (bytes < 1024 ** 2)         return (bytes / 1024).toFixed(1) + "KB";
    if (bytes < 1024 ** 3)         return (bytes / (1024 ** 2)).toFixed(1) + "MB";
    return (bytes / (1024 ** 3)).toFixed(2) + "GB";
}


// =====================================
// 「選択中のファイル」表示エリアを更新
// ・1ファイル：サムネ＋名前＋サイズ
// ・複数ファイル：件数と合計サイズのサマリ
// =====================================
function _updateSelectedFileDisplay() {
    const input = document.getElementById("fileInput");
    const info  = document.getElementById("selectedFileInfo");
    if (!info) return;

    const files = input ? input.files : null;
    if (!files || files.length === 0) {
        info.hidden = true;
        info.innerHTML = "";
        return;
    }

    // ---- 複数選択 ----
    if (files.length > 1) {
        let total = 0;
        for (const f of files) total += f.size;

        info.innerHTML = `
            <div class="file-icon default-bg" style="width:50px;height:50px;border-radius:14px;font-size:22px;">
                <i class="fa-solid fa-layer-group"></i>
            </div>
            <div class="selected-file-meta">
                <div class="selected-file-name">${files.length} 個のファイルを選択中</div>
                <div class="selected-file-size">合計 ${_formatFileSize(total)}</div>
            </div>
            <button class="selected-file-clear" onclick="clearSelectedFile()" aria-label="選択解除" title="選択解除">✕</button>
        `;
        info.hidden = false;
        return;
    }

    // ---- 1ファイル ----
    const file = files[0];
    const { icon, bg } = getFileIcon(file.name);
    const isImg = /\.(jpe?g|jfif|png|gif|webp|bmp|tiff?)$/i.test(file.name);

    const thumb = isImg
        ? `<img class="selected-thumb" src="${URL.createObjectURL(file)}" alt="">`
        : `<div class="file-icon ${bg}" style="width:50px;height:50px;border-radius:14px;font-size:22px;"><i class="fa-solid ${icon}"></i></div>`;

    info.innerHTML = `
        ${thumb}
        <div class="selected-file-meta">
            <div class="selected-file-name">${file.name}</div>
            <div class="selected-file-size">${_formatFileSize(file.size)}</div>
        </div>
        <button class="selected-file-clear" onclick="clearSelectedFile()" aria-label="選択解除" title="選択解除">✕</button>
    `;
    info.hidden = false;
}

// ✕ボタン：ファイル選択をクリア
function clearSelectedFile() {
    const input = document.getElementById("fileInput");
    if (input) input.value = "";
    _updateSelectedFileDisplay();
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

        fileList.innerHTML = data.files.map(file => {
            const { icon, bg } = getFileIcon(file.name);
            const safeName = encodeURIComponent(file.name);

            // 画像ファイルなら、色付きアイコンの代わりにサムネ表示
            //   - クリックでフルサイズプレビュー（モーダル）が開く
            //   - 画像が壊れていたら色付きアイコンにフォールバック
            const isImg = /\.(jpe?g|jfif|png|gif|webp|bmp|tiff?)$/i.test(file.name);
            const imgUrl = `${API_BASE}/download/${safeName}`;
            const thumb = isImg
                ? `<img class="file-thumb" src="${imgUrl}" alt="${file.name}"
                        onclick="openImagePreview('${imgUrl}', decodeURIComponent('${safeName}'))"
                        onerror="this.outerHTML='<div class=&quot;file-icon ${bg}&quot;><i class=&quot;fa-solid ${icon}&quot;></i></div>'">`
                : `<div class="file-icon ${bg}"><i class="fa-solid ${icon}"></i></div>`;

            return `
            <div class="file-card">
                <div class="file-info">
                    <input type="checkbox" class="file-check" value="${file.name}">
                    ${thumb}
                    <div>
                        <div class="file-name" title="${file.name}">${file.name}</div>
                        <div class="file-detail">${file.file_type.toUpperCase().replace(".", "")} ・ ${file.size} ・ ${file.uploaded_at}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="downloadFile(decodeURIComponent('${safeName}'))">↓ 取得</button>
                    <button class="rename-btn"   onclick="renameFile(decodeURIComponent('${safeName}'))">✏️ 名前変更</button>
                    <button class="share-btn"    onclick="shareFile(decodeURIComponent('${safeName}'))">🔗 共有</button>
                    <button class="delete-btn"   onclick="deleteFile(decodeURIComponent('${safeName}'))">🗑 削除</button>
                </div>
            </div>`;
        }).join("");

    } catch (e) {
        fileList.innerHTML = "<p style='color:#f87171'>サーバーに接続できません</p>";
    }
}


// =====================================
// 全選択 / 全解除の切り替え
// =====================================
function toggleSelectAll(btn) {
    const checks = document.querySelectorAll("#fileList .file-check");
    // 1つでも未チェックがあれば「全部チェック」、全部チェック済みなら「全解除」
    const allChecked = Array.from(checks).every(c => c.checked);

    checks.forEach(c => c.checked = !allChecked);
    btn.textContent = allChecked ? "☑ 全選択" : "☐ 全解除";
}


// =====================================
// 選択したファイルをZIPでまとめてダウンロード
// =====================================
async function downloadSelectedZip(e) {
    const btn = _btnFromEvent(e);
    const checks = document.querySelectorAll("#fileList .file-check:checked");
    const filenames = Array.from(checks).map(c => c.value);

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
    const checks = document.querySelectorAll("#fileList .file-check:checked");
    const filenames = Array.from(checks).map(c => c.value);

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
    const fileInput = document.getElementById("fileInput");
    const files = Array.from(fileInput.files);

    if (files.length === 0) {
        notify("ファイルを選択してください");
        return;
    }

    // 複数ファイルのときは「ZIPにまとめるか / 個別か」を確認
    //   OK   → ZIP1個にまとめてアップロード
    //   キャンセル → 個別アップロード（従来通り）
    let asZip = false;
    if (files.length > 1) {
        asZip = confirm(
            `${files.length} 個のファイルを選択しています。\n\n` +
            `「OK」… 1つのZIPにまとめてアップロード\n` +
            `「キャンセル」… 個別にアップロード`
        );
    }

    setLoading(btn, true);
    try {
        if (asZip) {
            await _uploadAsZip(files);
        } else {
            // 個別アップロード
            let ok = 0;
            for (let i = 0; i < files.length; i++) {
                const done = await uploadFileData(files[i], i + 1, files.length);
                if (done) ok++;
            }
            if (files.length > 1) {
                notify(`${ok} / ${files.length} 件のアップロードが完了しました`);
            }
        }

        fileInput.value = "";
        _updateSelectedFileDisplay();   // ← 選択中チップを消す
    } finally {
        setLoading(btn, false);
    }
}


// =====================================
// 複数ファイルを1つのZIPにまとめてアップロード
// （ブラウザ上で JSZip を使って zip を生成）
// =====================================
async function _uploadAsZip(files) {
    // JSZip が読み込まれているか確認
    if (typeof JSZip === "undefined") {
        notify("ZIP機能の読み込みに失敗しました（個別アップロードをお使いください）");
        return;
    }

    // ZIPファイル名を入力（既定は日時入り）
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "").replace(/-/g, "");
    const input = prompt("ZIPファイルの名前を入力してください（.zip は不要）", `upload_${stamp}`);
    if (input === null) return;          // キャンセル
    let base = input.trim() || `upload_${stamp}`;
    if (base.toLowerCase().endsWith(".zip")) base = base.slice(0, -4);
    const zipName = base + ".zip";

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
        return;
    }

    // --- 生成したZIPをファイルとしてアップロード ---
    const zipFile = new File([blob], zipName, { type: "application/zip" });
    if (label) label.textContent = `${zipName} をアップロード中...`;

    const done = await uploadFileData(zipFile);
    if (done) {
        notify(`${files.length}個のファイルを ${zipName} にまとめてアップロードしました`);
    }
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
    const main   = document.getElementById("mainView");
    const trash  = document.getElementById("trashView");
    const shared = document.getElementById("sharedView");

    main.style.display   = (view === "main")   ? "block" : "none";
    trash.style.display  = (view === "trash")  ? "block" : "none";
    shared.style.display = (view === "shared") ? "block" : "none";

    // 表示中の要素にアニメーションクラスを付け直す
    // （リフロー強制で同じクラスでも再生される）
    const visible =
        view === "main"  ? main  :
        view === "trash" ? trash :
                           shared;

    visible.classList.remove("view-enter");
    void visible.offsetWidth;          // ← リフローを強制してアニメ再起動
    visible.classList.add("view-enter");
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

        trashList.innerHTML = data.files.map(file => {
            const { icon, bg } = getFileIcon(file.name);
            const safeName = encodeURIComponent(file.name);
            return `
            <div class="file-card">
                <div class="file-info">
                    <div class="file-icon ${bg}">
                        <i class="fa-solid ${icon}"></i>
                    </div>
                    <div>
                        <div class="file-name" title="${file.name}">${file.name}</div>
                        <div class="file-detail">${file.file_type.toUpperCase().replace(".", "")} ・ ${file.size} ・ 削除: ${file.deleted_at}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="restoreFile(decodeURIComponent('${safeName}'))">↩ 復元</button>
                    <button class="delete-btn"   onclick="permanentDelete(decodeURIComponent('${safeName}'))">✕ 完全削除</button>
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
    const checks = document.querySelectorAll("#fileList .file-check:checked");
    const filenames = Array.from(checks).map(c => c.value);

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

        sharedList.innerHTML = data.files.map(file => {
            const { icon, bg } = getFileIcon(file.name);
            const safeOwner = encodeURIComponent(file.owner);
            const safeName  = encodeURIComponent(file.name);

            // パスワード保護されているファイルには鍵マークを付ける
            const lock = file.protected ? " 🔒" : "";

            // 自分が共有したファイルだけ「共有解除」ボタンを表示
            const unshareBtn = (file.owner === me)
                ? `<button class="delete-btn" onclick="unshareFile(decodeURIComponent('${safeOwner}'), decodeURIComponent('${safeName}'))">✕ 共有解除</button>`
                : "";

            return `
            <div class="file-card">
                <div class="file-info">
                    <div class="file-icon ${bg}">
                        <i class="fa-solid ${icon}"></i>
                    </div>
                    <div>
                        <div class="file-name" title="${file.name}">${file.name}${lock}</div>
                        <div class="file-detail">共有者: ${file.owner} ・ ${file.size} ・ ${file.shared_at}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="downloadShared(decodeURIComponent('${safeOwner}'), decodeURIComponent('${safeName}'), ${file.protected})">↓ 取得</button>
                    ${unshareBtn}
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
    // ドロップされたファイル群をアップロードする共通処理
    // 複数なら「ZIPにまとめるか / 個別か」を確認
    async function handleDroppedFiles(fileList) {
        const files = Array.from(fileList || []);
        if (files.length === 0) return;

        if (files.length > 1) {
            const asZip = confirm(
                `${files.length} 個のファイルをドロップしました。\n\n` +
                `「OK」… 1つのZIPにまとめてアップロード\n` +
                `「キャンセル」… 個別にアップロード`
            );
            if (asZip) {
                await _uploadAsZip(files);
                return;
            }
        }

        // 個別アップロード
        let ok = 0;
        for (let i = 0; i < files.length; i++) {
            const done = await uploadFileData(files[i], i + 1, files.length);
            if (done) ok++;
        }
        if (files.length > 1) {
            notify(`${ok} / ${files.length} 件のアップロードが完了しました`);
        }
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
window.addEventListener("load", () => {
    if (!document.getElementById("fileList")) return;

    const username = sessionStorage.getItem("username");
    if (!username) {
        location.href = "login.html";
        return;
    }

    applyHeaderUser();
    // 現在のテーマアイコンに合わせて切替ボタンを更新
    applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

    loadFiles();
    loadStorage();
    loadDashboardStats();
    setupDropArea();
    _ensureUploadProgressUI();

    // ファイル選択直後にプレビュー表示を更新
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.addEventListener("change", _updateSelectedFileDisplay);
});