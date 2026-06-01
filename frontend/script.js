// =====================================
// APIのベースURL
// =====================================
const API_BASE = "http://127.0.0.1:8000";


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
        notify("入力してください");
        return;
    }

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
            location.href = "files.html";

        } else {
            const err = await res.json();
            notify(err.detail || "ユーザー名またはパスワードが違います");
        }

    } catch (e) {
        notify("サーバーに接続できません");
    }
}


// =====================================
// 【新設】MFA認証コードの検証
// =====================================
async function verifyMFA() {
    const code = document.getElementById("mfa-code").value;

    if (!code || code.length !== 6) {
        notify("6桁の認証コードを入力してください");
        return;
    }

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

            notify("2段階認証に成功しました！");
            location.href = "files.html"; // ログイン完了で一覧画面へ
        } else {
            const err = await res.json();
            // detail は文字列のときと配列(検証エラー)のときがあるので整形
            const msg = typeof err.detail === "string"
                ? err.detail
                : "認証コードが正しくありません";
            notify(msg);
        }

    } catch (e) {
        notify("サーバーに接続できません");
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
        notify("全て入力してください");
        return;
    }

    if (password !== confirmPassword) {
        notify("パスワードが一致しません");
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
            notify("アカウントを作成しました！");
            location.href = "login.html";
        } else {
            const err = await res.json();
            notify(`エラー: ${err.detail}`);
        }

    } catch (e) {
        notify("サーバーに接続できません");
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
    fileList.innerHTML = "<p style='color:#cbd5e1'>読み込み中...</p>";

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
            return `
            <div class="file-card">
                <div class="file-info">
                    <input type="checkbox" class="file-check" value="${file.name}">
                    <div class="file-icon ${bg}">
                        <i class="fa-solid ${icon}"></i>
                    </div>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-detail">${file.file_type.toUpperCase().replace(".", "")} ・ ${file.size} ・ ${file.uploaded_at}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="downloadFile(decodeURIComponent('${safeName}'))">↓ 取得</button>
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
// 選択したファイルをまとめて削除（ゴミ箱へ）
// =====================================
async function deleteSelected() {
    const checks = document.querySelectorAll("#fileList .file-check:checked");
    const filenames = Array.from(checks).map(c => c.value);

    if (filenames.length === 0) {
        notify("削除するファイルを選択してください");
        return;
    }

    if (!confirm(`選択した ${filenames.length} 件をゴミ箱に移動しますか？`)) return;

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
    } catch (e) {
        notify("削除に失敗しました");
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
        notify("ファイルを選択してください");
        return;
    }

    await uploadFileData(file);
    fileInput.value = "";
}


// =====================================
// ファイルアップロード処理
// =====================================
function uploadFileData(file) {
    const formData = new FormData();
    formData.append("file", file);

    _ensureUploadProgressUI();
    const bar   = document.getElementById("uploadProgress");
    const fill  = document.getElementById("uploadProgressFill");
    const label = document.getElementById("uploadProgressLabel");

    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE}/upload`);

        // アップロード進捗イベント
        xhr.upload.addEventListener("progress", (e) => {
            if (!e.lengthComputable) return;
            const pct = Math.round((e.loaded / e.total) * 100);
            if (bar)   bar.style.display = "block";
            if (fill)  fill.style.width  = pct + "%";
            if (label) label.textContent = `${file.name}  ${pct}%`;
        });

        // 完了
        xhr.addEventListener("load", async () => {
            if (bar)  bar.style.display = "none";
            if (fill) fill.style.width  = "0%";

            if (xhr.status >= 200 && xhr.status < 300) {
                notify(`${file.name} をアップロードしました`);
                await loadFiles();
                await loadStorage();
            } else {
                let msg = "アップロードに失敗しました";
                try {
                    const err = JSON.parse(xhr.responseText);
                    if (err && err.detail) msg = `エラー: ${err.detail}`;
                } catch (_) {}
                notify(msg);
            }
            resolve();
        });

        // ネットワークエラー
        xhr.addEventListener("error", () => {
            if (bar) bar.style.display = "none";
            notify("アップロードに失敗しました");
            resolve();
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


// =====================================================
// ここから下：ゴミ箱ビュー
// =====================================================


// =====================================
// 表示するビューを切り替える内部関数
// "main" / "trash" / "shared" のどれか1つだけ表示
// =====================================
function switchView(view) {
    document.getElementById("mainView").style.display   = (view === "main")   ? "block" : "none";
    document.getElementById("trashView").style.display  = (view === "trash")  ? "block" : "none";
    document.getElementById("sharedView").style.display = (view === "shared") ? "block" : "none";
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
    trashList.innerHTML = "<p style='color:#cbd5e1'>読み込み中...</p>";

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
                        <div class="file-name">${file.name}</div>
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
async function emptyTrash() {
    if (!confirm("ゴミ箱を空にしますか？\nすべてのファイルが完全に削除され、元に戻せません。")) return;

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
    } catch (e) {
        notify("ゴミ箱を空にできませんでした");
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
async function shareSelected() {
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
    } catch (e) {
        notify("共有に失敗しました");
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
    sharedList.innerHTML = "<p style='color:#cbd5e1'>読み込み中...</p>";

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
                        <div class="file-name">${file.name}${lock}</div>
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
    _ensureUploadProgressUI();
});