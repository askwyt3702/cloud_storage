// =====================================
// APIのベースURL
// =====================================
const API_BASE = "http://127.0.0.1:8000";

// =====================================
// 多言語（日本語 / 英語）データ ＆ 切り替えロジック
// =====================================
const TRANSLATIONS = {
    ja: {
        brand_sub: "あなたのファイルをいつでもどこでも",
        logout_btn: "ログアウト",
        tab_my_files: "📊 マイファイル",
        tab_shared: "📂 共有",
        tab_links: "🔗 リンク",
        tab_trash: "🗑 ゴミ箱",
        storage_text: "使用容量を取得中...",
        stat_storage: "使用容量",
        stat_my_files: "マイファイル",
        stat_sharing: "あなたが共有中",
        unit_items: "件",
        btn_add_files: "📁 ファイルを追加",
        btn_upload: "⬆ アップロード",
        tray_selected: "選択中のファイル",
        tray_clear_all: "すべてクリア",
        tray_zip_mode: "チェックしたファイルを 1つのZIP にまとめる",
        drop_title: "ファイルをドラッグ＆ドロップ",
        drop_sub: "またはファイルを選択",
        search_placeholder: "ファイル名で絞り込み...",
        sort_name_asc: "名前順（A→Z）",
        sort_name_desc: "名前順（Z→A）",
        sort_date_desc: "新しい順",
        sort_date_asc: "古い順",
        sort_size_desc: "サイズ大きい順",
        sort_size_asc: "サイズ小さい順",
        view_tile: "タイル",
        view_list: "リスト",
        view_toggle_title: "表示切替",
        cat_all: "すべて",
        cat_image: "🖼 画像",
        cat_document: "📄 文書",
        cat_media: "🎬 メディア",
        cat_other: "📦 その他",
        cat_image_title: "画像ファイル",
        cat_document_title: "文書・書類",
        cat_media_title: "動画・音楽",
        cat_other_title: "その他・圧縮",
        btn_select_all: "☑ 全選択",
        btn_deselect_all: "☐ 全解除",
        btn_zip_download: "📦 ZIP取得",
        btn_share: "🔗 選択を共有",
        btn_delete: "🗑 選択削除",
        sort_trash_date_desc: "削除が新しい順",
        sort_trash_date_asc: "削除が古い順",
        btn_empty_trash: "ゴミ箱を空にする",
        sort_shared_date_desc: "共有が新しい順",
        sort_shared_date_asc: "共有が古い順",
        sort_owner_asc: "共有者順",
        shared_info_text: "みんなが共有したファイル",
        cat_title_text: "自動分類されたファイル一覧",
        links_info_text: "あなたが発行した共有リンク",
        
        // ログイン画面
        login_brand: "Cloud Storage",
        login_tagline: "あなたのファイルを、いつでも・どこでも・安全に",
        email_placeholder: "メールアドレス",
        password_placeholder: "パスワード",
        login_btn: "ログイン",
        mfa_instruction: "スマートフォン認証アプリに表示されている<br>6桁の認証コードを入力してください。",
        mfa_code_placeholder: "6桁の認証コード（例: 123456）",
        verify_btn: "認証してログイン",
        no_account_prompt: "アカウントをお持ちでない方は",
        create_account_link: "アカウントを作成",
        forgot_password_link: "パスワードをお忘れですか？",
        feature_mfa: "🔒 2段階認証",
        feature_share: "🔗 共有リンク",
        feature_trash: "🗑 ゴミ箱復元",
        
        // 新規登録画面
        register_title: "アカウント作成",
        username_placeholder: "ユーザー名",
        confirm_password_placeholder: "パスワード確認",
        register_btn: "アカウントを作成",
        already_have_account: "既にアカウントをお持ちの方は",
        login_link: "ログイン",
        
        // 動的な文言
        welcome_greeting: "おかえりなさい、{name} さん",
        storage_status: "使用容量: {used} / {total} ({pct}%)",
        unsupported_preview: "この形式はプレビューできません",
        download_btn_text: "↓ ダウンロード",
        preview_failed_pw: "プレビューできませんでした（パスワードが違います）",

        // ページタイトル
        title_login: "ログイン",
        title_register: "新規登録",
        title_reset: "パスワードの再設定",
        title_files: "マイファイル - Cloud Storage",
        title_settings: "設定 - Cloud Storage",
        title_share: "共有ファイル - Cloud Storage",
        copy_url_btn: "URLコピー",
        disable_btn: "無効化",
        qr_btn: "QR",
        restore: "復元",
        expires_none: "有効期限: なし（無期限）",
        expires_none_brief: "有効期限: なし",
        password_protected: "🔒 パスワード保護あり",
        password_none: "パスワード: なし",
        share_link_created: "🔗 共有リンクを作成しました",
        share_link_qr: "🔗 共有リンクのQRコード",
        qr_hint: "スマホのカメラで読み取ってアクセスできます",
        copy: "コピー",
        share_hint: "このURLを知っている人なら、ログインなしでダウンロードできます。",
        expired: "期限切れ",
        menu_preview: "プレビュー",
        menu_download: "ダウンロード",
        menu_unstar: "お気に入りを外す",
        menu_star: "お気に入りに追加",
        menu_rename: "名前を変更",
        menu_share: "共有する",
        menu_delete: "削除（ゴミ箱へ）",
        menu_restore: "復元する",
        menu_perm_delete: "完全に削除",
        menu_create_link: "リンク作成",
        menu_remove_share: "共有を解除",
        menu_copy_url: "URLをコピー",
        menu_qr: "QRコードを表示",
        menu_disable_link: "リンクを無効化",
        star_title: "お気に入り",
        wrong_password_or_required: "パスワードが違います（または必要です）",
        loading: "読み込み中...",
        delete: "削除",
        unsupported: "この形式はプレビューできません",

        // パスワードリセット画面
        reset_title: "パスワード再設定",
        reset_instruction: "登録メールアドレスと、認証アプリの6桁コードで本人確認します",
        reset_code_placeholder: "認証コード（6桁）",
        reset_new_password_placeholder: "新しいパスワード（8文字以上・大文字・数字・記号）",
        reset_new_password_confirm_placeholder: "新しいパスワード（確認）",
        reset_btn: "パスワードを変更",
        back_to_login: "← ログインに戻る",

        // 設定画面
        settings_header: "設定",
        settings_sub: "アカウント情報",
        back_to_files: "← ファイルに戻る",
        profile_section: "👤 プロフィール",
        label_username: "ユーザー名",
        label_role: "権限（ロール）",
        label_storage: "使用容量",
        security_section: "🔒 セキュリティ",
        label_change_password: "パスワード変更",
        sub_change_password: "パスワードを変更します",
        label_mfa: "2段階認証（MFA）",
        sub_mfa: "認証アプリでログインを保護",
        btn_preparing: "準備中",
        backup_section: "💾 自動バックアップ設定",
        label_backup: "自動バックアップ",
        sub_backup: "毎日指定した時刻に自動でバックアップを実行します",
        label_backup_time: "実行時刻 (24時間表記)",
        sub_backup_time: "自動バックアップを実行する時刻 (例: 00:00)",
        btn_save_settings: "💾 設定を保存",
        btn_run_backup: "⚡ 今すぐバックアップ",
        backup_history_title: "📁 バックアップ履歴",
        webhook_section: "🚀 外部サービス連携 (Webhook)",
        label_webhook_url: "Webhook URL",
        sub_webhook_url: "DiscordまたはSlackのWebhook URLを入力します",
        label_notify_events: "通知するイベント",
        sub_notify_events: "通知を送信する操作を選択してください",
        event_upload: "📥 ファイルのアップロード時",
        event_delete: "🗑️ ファイルの削除時（ゴミ箱移動・完全削除）",
        event_share: "🔗 共有リンクの作成時",
        btn_test_send: "🔔 テスト送信",

        // 共有受信画面 (share.html)
        share_title: "共有ファイル",
        share_loading: "読み込み中...",
        share_password_placeholder: "このファイルのパスワード",
        share_download_btn: "⬇ ダウンロード",
        share_error_header: "エラー",

        // 空画面表示 (empty state)
        no_files: "ファイルがありません",
        no_files_sub: "「ファイル選択」やドラッグ＆ドロップでアップロードしてみましょう",
        no_links: "発行したリンクはありません",
        no_links_sub: "共上一覧のファイルから「🔗 リンク作成」で発行できます",
        trash_empty: "ゴミ箱は空です",
        trash_empty_sub: "ここから削除したファイルを復元できます",
        no_shared_files: "共有ファイルはありません",
        no_shared_files_sub: "ファイル一覧の「🔗 共有」ボタンから共有できます",
        category_empty: "このカテゴリは空です",
        category_empty_sub: "該当するファイルがアップロードされていません。",
        backup_no_history: "バックアップ履歴はありません",
        backup_no_history_sub: "設定時刻になるか、「今すぐバックアップ」で作成できます",

        // トースト通知・アラート・確認・プロンプト用
        unstarred: "★を外しました",
        starred: "★お気に入りに追加しました",
        input_required: "入力してください",
        wrong_credentials: "ユーザー名またはパスワードが違います",
        cannot_connect: "サーバーに接続できません",
        input_mfa: "6桁の認証コードを入力してください",
        all_fields_required: "全て入力してください",
        passwords_mismatch: "パスワードが一致しません",
        account_created: "アカウントを作成しました！",
        error_prefix: "エラー: ",
        new_passwords_mismatch: "新しいパスワードが一致しません",
        mfa_code_6_digits: "認証コードは6桁です",
        password_changed: "パスワードを変更しました",
        select_file_download: "ダウンロードするファイルを選択してください",
        zip_download_success: "{count}件をZIPでダウンロードしました",
        zip_download_failed: "ZIPのダウンロードに失敗しました",
        select_file_delete: "削除するファイルを選択してください",
        trash_move_success: "{count}件をゴミ箱に移動しました。\n失敗: {failed}",
        delete_failed: "削除に失敗しました",
        select_file: "ファイルを選択してください",
        check_zip_files: "ZIPに入れるファイルにチェックを付けてください",
        upload_complete: "{okCount} / {totalCount} 件のアップロードが完了しました",
        zip_load_failed: "ZIP機能の読み込みに失敗しました（個別アップロードをお使いください）",
        zip_creation_failed: "ZIPの作成に失敗しました",
        zip_archive_success: "{count}個のファイルを {zipName} にまとめました",
        upload_success: "{name} をアップロードしました",
        upload_failed: "{name}: アップロードに失敗しました",
        download_failed: "ダウンロードに失敗しました",
        expire_positive_num: "有効期限は正の数で入力してください",
        link_creation_failed: "リンクの作成に失敗しました",
        link_copied: "リンクをコピーしました",
        copy_failed: "コピーに失敗しました",
        link_disabled: "リンクを無効化しました",
        disable_failed: "無効化に失敗しました",
        name_changed: "名前を変更しました",
        name_change_failed: "名前の変更に失敗しました",
        restore_failed: "復元に失敗しました",
        permanent_delete_failed: "完全削除に失敗しました",
        empty_trash_failed: "ゴミ箱を空にできませんでした",
        share_failed: "共有に失敗しました",
        select_file_share: "共有するファイルを選択してください",
        share_removed_failed: "共有の解除に失敗しました",
        added_to_selection: "{count}件を選択に追加しました",
        backup_get_settings_failed: "バックアップ設定の取得に失敗しました",
        backup_time_format_error: "実行時刻は '00:00' のような半角の形式で入力してください",
        backup_time_invalid: "実行時刻が正しくありません (00:00 〜 23:59)",
        backup_settings_saved: "バックアップ設定を保存しました",
        backup_save_failed: "保存失敗: {detail}",
        server_communication_failed: "サーバー通信に失敗しました",
        backup_created: "バックアップを作成しました: {filename}",
        backup_create_failed: "作成失敗: {detail}",
        backup_deleted: "バックアップを削除しました",
        backup_delete_failed: "削除失敗: {detail}",
        webhook_get_settings_failed: "Webhook設定の取得に失敗しました",
        webhook_url_invalid: "有効な URL を入力してください (http:// または https://)",
        webhook_settings_saved: "Webhook設定を保存しました",
        webhook_test_url_required: "テスト送信する Webhook URL を入力してください",
        webhook_test_sent: "テスト通知を送信しました。設定されたチャンネルを確認してください。",
        webhook_test_failed: "テスト送信失敗: {detail}",

        // 動的ダイアログ・ラベル用
        role_label: "権限: {role}",
        backup_history_get_failed: "バックアップ履歴の取得に失敗しました",
        backup_detail: "ZIP圧縮形式 ・ {size} ・ 作成: {date}",
        download: "ダウンロード",
        close: "閉じる",
        theme_toggle_title: "テーマ切替",

        // プロンプトと確認ダイアログ
        password_required: "「{name}」はパスワードで保護されています。\nパスワードを入力:",
        create_link_prompt: "「{name}」の共有リンクを作成します。\n\n有効期限（日数）を入力してください。\n空欄なら無期限です。",
        rename_prompt_with_ext: "新しい名前を入力してください\n（拡張子 {ext} はそのままです）",
        rename_prompt_no_ext: "新しい名前を入力してください",
        share_prompt: "「{name}」を共有します。\nパスワードを付ける場合は入力（不要なら空欄でOK）:",
        share_multiple_prompt: "選択した {count} 件を共有します。\n共通のパスワードを付ける場合は入力（不要なら空欄でOK）:",
        confirm_move_to_trash: "選択した {count} 件をゴミ箱に移動しますか？",
        confirm_delete_single: "「{name}」を削除しますか？",
        confirm_disable_link: "このリンクを無効化しますか？\nこのURLでのダウンロードができなくなります。",
        confirm_permanent_delete: "「{name}」を完全に削除しますか？\nこの操作は元に戻せません。",
        confirm_empty_trash: "ゴミ箱を空にしますか？\nすべてのファイルが完全に削除され、元に戻せません。",
        confirm_remove_share: "「{name}」の共有を解除しますか？\n（あなたの個人ファイルは残ります）",
        confirm_manual_backup: "手動バックアップを作成しますか？\n（ファイル数によっては数十秒かかる場合があります）",
        confirm_delete_backup: "バックアップ「{name}」を削除しますか？\nこの操作は元に戻せません。",

        // 共有リンク受信ページ用
        invalid_token: "無効なリンクです（トークンがありません）",
        expired_link: "このリンクは有効期限が切れています",
        link_not_found: "リンクが見つかりません（削除されたか、URLが間違っています）",
        failed_get_info: "ファイル情報の取得に失敗しました",
        cannot_connect_server: "サーバーに接続できません",
        input_password: "パスワードを入力してください",
        downloading: "ダウンロード中...",
        wrong_password: "パスワードが違います",
        shared_by: "提供者: {owner}",
        expires_at: "有効期限: {time}",
        preview_failed: "プレビューできませんでした"
    },
    en: {
        brand_sub: "Access your files anywhere, anytime",
        logout_btn: "Logout",
        tab_my_files: "📊 My Files",
        tab_shared: "📂 Shared",
        tab_links: "🔗 Links",
        tab_trash: "🗑 Trash",
        storage_text: "Retrieving storage space...",
        stat_storage: "Storage Space",
        stat_my_files: "My Files",
        stat_sharing: "You Are Sharing",
        unit_items: "files",
        btn_add_files: "📁 Add Files",
        btn_upload: "⬆ Upload",
        tray_selected: "Selected Files",
        tray_clear_all: "Clear All",
        tray_zip_mode: "Compress checked files into 1 ZIP",
        drop_title: "Drag & drop files here",
        drop_sub: "or click to select files",
        search_placeholder: "Filter by file name...",
        sort_name_asc: "Name (A to Z)",
        sort_name_desc: "Name (Z to A)",
        sort_date_desc: "Newest first",
        sort_date_asc: "Oldest first",
        sort_size_desc: "Size (Largest)",
        sort_size_asc: "Size (Smallest)",
        view_tile: "Grid",
        view_list: "List",
        view_toggle_title: "Toggle View Mode",
        cat_all: "All",
        cat_image: "🖼 Images",
        cat_document: "📄 Documents",
        cat_media: "🎬 Media",
        cat_other: "📦 Others",
        cat_image_title: "Image Files",
        cat_document_title: "Documents",
        cat_media_title: "Videos & Music",
        cat_other_title: "Others & ZIPs",
        btn_select_all: "☑ Select All",
        btn_deselect_all: "☐ Deselect All",
        btn_zip_download: "📦 Get ZIP",
        btn_share: "🔗 Share Selection",
        btn_delete: "🗑 Delete Selection",
        sort_trash_date_desc: "Date Deleted (Newest)",
        sort_trash_date_asc: "Date Deleted (Oldest)",
        btn_empty_trash: "Empty Trash",
        sort_shared_date_desc: "Date Shared (Newest)",
        sort_shared_date_asc: "Date Shared (Oldest)",
        sort_owner_asc: "Shared By",
        shared_info_text: "Files shared by other users",
        cat_title_text: "Auto-categorized file list",
        links_info_text: "Shared links issued by you",
        
        // Login Screen
        login_brand: "Cloud Storage",
        login_tagline: "Your files, safe and accessible anywhere, anytime",
        email_placeholder: "Email Address",
        password_placeholder: "Password",
        login_btn: "Log In",
        mfa_instruction: "Please enter the 6-digit authentication code<br>displayed in your authenticator app.",
        mfa_code_placeholder: "6-digit code (e.g. 123456)",
        verify_btn: "Verify & Log In",
        no_account_prompt: "Don't have an account?",
        create_account_link: "Create Account",
        forgot_password_link: "Forgot Password?",
        feature_mfa: "🔒 Two-Factor Auth",
        feature_share: "🔗 Shared Links",
        feature_trash: "🗑 Trash Restore",
        
        // Register Screen
        register_title: "Create Account",
        username_placeholder: "Username",
        confirm_password_placeholder: "Confirm Password",
        register_btn: "Create Account",
        already_have_account: "Already have an account?",
        login_link: "Log In",
        
        // Dynamic labels
        welcome_greeting: "Welcome back, {name}",
        storage_status: "Storage: {used} / {total} ({pct}%)",
        unsupported_preview: "This file format cannot be previewed",
        download_btn_text: "↓ Download",
        preview_failed_pw: "Could not preview (incorrect password)",

        // Page Titles
        title_login: "Log In",
        title_register: "Create Account",
        title_reset: "Reset Password",
        title_files: "My Files - Cloud Storage",
        title_settings: "Settings - Cloud Storage",
        title_share: "Shared File - Cloud Storage",
        copy_url_btn: "Copy URL",
        disable_btn: "Disable",
        qr_btn: "QR",
        restore: "Restore",
        expires_none: "Expires: None (Unlimited)",
        expires_none_brief: "Expires: None",
        password_protected: "🔒 Password Protected",
        password_none: "Password: None",
        share_link_created: "🔗 Shared Link Created",
        share_link_qr: "🔗 Shared Link QR Code",
        qr_hint: "Scan with smartphone camera to access",
        copy: "Copy",
        share_hint: "Anyone with this URL can download the file without logging in.",
        expired: "Expired",
        menu_preview: "Preview",
        menu_download: "Download",
        menu_unstar: "Remove Favorite",
        menu_star: "Add to Favorites",
        menu_rename: "Rename",
        menu_share: "Share",
        menu_delete: "Delete (Move to Trash)",
        menu_restore: "Restore",
        menu_perm_delete: "Permanently Delete",
        menu_create_link: "Create Link",
        menu_remove_share: "Stop Sharing",
        menu_copy_url: "Copy URL",
        menu_qr: "Show QR Code",
        menu_disable_link: "Disable Link",
        star_title: "Favorite",
        wrong_password_or_required: "Incorrect password (or required)",
        loading: "Loading...",
        delete: "Delete",
        unsupported: "This file format cannot be previewed",

        // Password Reset Screen
        reset_title: "Reset Password",
        reset_instruction: "Verify identity using your registered email address and the 6-digit code from your authenticator app.",
        reset_code_placeholder: "6-digit code",
        reset_new_password_placeholder: "New Password (8+ chars, upper, digit, symbol)",
        reset_new_password_confirm_placeholder: "Confirm New Password",
        reset_btn: "Reset Password",
        back_to_login: "← Back to Login",

        // Settings Screen
        settings_header: "Settings",
        settings_sub: "Account Info",
        back_to_files: "← Back to Files",
        profile_section: "👤 Profile",
        label_username: "Username",
        label_role: "Role",
        label_storage: "Storage Space",
        security_section: "🔒 Security",
        label_change_password: "Change Password",
        sub_change_password: "Change your password",
        label_mfa: "Two-Factor Auth (MFA)",
        sub_mfa: "Protect login with authenticator app",
        btn_preparing: "Coming Soon",
        backup_section: "💾 Auto-Backup Settings",
        label_backup: "Auto-Backup",
        sub_backup: "Automatically run backup daily at specified time",
        label_backup_time: "Execution Time (24h format)",
        sub_backup_time: "Time to run automatic backup (e.g. 00:00)",
        btn_save_settings: "💾 Save Settings",
        btn_run_backup: "⚡ Backup Now",
        backup_history_title: "📁 Backup History",
        webhook_section: "🚀 Webhook Integration",
        label_webhook_url: "Webhook URL",
        sub_webhook_url: "Enter Discord or Slack Webhook URL",
        label_notify_events: "Notification Events",
        sub_notify_events: "Select actions that trigger notifications",
        event_upload: "📥 On file upload",
        event_delete: "🗑️ On file deletion (trash/permanent)",
        event_share: "🔗 On sharing link creation",
        btn_test_send: "🔔 Test Send",

        // Share Page
        share_title: "Shared File",
        share_loading: "Loading...",
        share_password_placeholder: "Password for this file",
        share_download_btn: "⬇ Download",
        share_error_header: "Error",

        // Empty states
        no_files: "No files found",
        no_files_sub: "Try uploading files by clicking 'Add Files' or dragging them here",
        no_links: "No links have been created",
        no_links_sub: "You can create links from shared files by clicking '🔗 Create Link'",
        trash_empty: "Trash is empty",
        trash_empty_sub: "Deleted files will appear here and can be restored",
        no_shared_files: "No shared files found",
        no_shared_files_sub: "You can share files by clicking the '🔗 Share' button in My Files",
        category_empty: "This category is empty",
        category_empty_sub: "No files of this category have been uploaded yet.",
        backup_no_history: "No backup history available",
        backup_no_history_sub: "Backups will appear here once scheduled or when you click 'Backup Now'",

        // Toast Notifications & Alerts
        unstarred: "Removed from favorites",
        starred: "Added to favorites",
        input_required: "Please enter a value",
        wrong_credentials: "Incorrect username or password",
        cannot_connect: "Cannot connect to server",
        input_mfa: "Please enter the 6-digit authentication code",
        all_fields_required: "All fields are required",
        passwords_mismatch: "Passwords do not match",
        account_created: "Account created successfully!",
        error_prefix: "Error: ",
        new_passwords_mismatch: "New passwords do not match",
        mfa_code_6_digits: "Verification code must be 6 digits",
        password_changed: "Password changed successfully",
        select_file_download: "Please select a file to download",
        zip_download_success: "Downloaded {count} files as ZIP",
        zip_download_failed: "Failed to download ZIP",
        select_file_delete: "Please select a file to delete",
        trash_move_success: "Moved {count} items to trash.\nFailed: {failed}",
        delete_failed: "Failed to delete",
        select_file: "Please select a file",
        check_zip_files: "Please check files to include in the ZIP",
        upload_complete: "Upload complete: {okCount} / {totalCount} files",
        zip_load_failed: "Failed to load ZIP library (use individual upload)",
        zip_creation_failed: "Failed to create ZIP",
        zip_archive_success: "Compressed {count} files into {zipName}",
        upload_success: "Uploaded {name} successfully",
        upload_failed: "Failed to upload {name}",
        download_failed: "Download failed",
        expire_positive_num: "Expiration must be a positive number",
        link_creation_failed: "Failed to create link",
        link_copied: "Link copied to clipboard",
        copy_failed: "Failed to copy",
        link_disabled: "Link disabled successfully",
        disable_failed: "Failed to disable",
        name_changed: "Name changed successfully",
        name_change_failed: "Failed to change name",
        restore_failed: "Failed to restore",
        permanent_delete_failed: "Failed to permanently delete",
        empty_trash_failed: "Failed to empty trash",
        share_failed: "Sharing failed",
        select_file_share: "Please select a file to share",
        share_removed_failed: "Failed to remove share",
        added_to_selection: "Added {count} files to selection",
        backup_get_settings_failed: "Failed to get backup settings",
        backup_time_format_error: "Please enter execution time in '00:00' 24-hour format",
        backup_time_invalid: "Invalid execution time (00:00 to 23:59)",
        backup_settings_saved: "Backup settings saved successfully",
        backup_save_failed: "Save failed: {detail}",
        server_communication_failed: "Failed to communicate with server",
        backup_created: "Backup created: {filename}",
        backup_create_failed: "Failed to create backup: {detail}",
        backup_deleted: "Backup deleted successfully",
        backup_delete_failed: "Failed to delete backup: {detail}",
        webhook_get_settings_failed: "Failed to get Webhook settings",
        webhook_url_invalid: "Please enter a valid URL (starting with http:// or https://)",
        webhook_settings_saved: "Webhook settings saved successfully",
        webhook_test_url_required: "Please enter Webhook URL for testing",
        webhook_test_sent: "Test notification sent. Please check the configured channel.",
        webhook_test_failed: "Test send failed: {detail}",

        // Dynamic dialogs & labels
        role_label: "Role: {role}",
        backup_history_get_failed: "Failed to retrieve backup history",
        backup_detail: "ZIP Archive ・ {size} ・ Created: {date}",
        download: "Download",
        close: "Close",
        theme_toggle_title: "Toggle Theme",

        // Prompts & Confirms
        password_required: "「{name}」 is password protected.\nEnter password:",
        create_link_prompt: "Create shared link for \"{name}\".\n\nEnter expiration time in days.\nLeave blank for no expiration.",
        rename_prompt_with_ext: "Enter a new name\n(The extension {ext} will be kept)",
        rename_prompt_no_ext: "Enter a new name",
        share_prompt: "Share \"{name}\".\nEnter password if you want to protect it (leave blank for none):",
        share_multiple_prompt: "Share selected {count} items.\nEnter common password if you want to protect them (leave blank for none):",
        confirm_move_to_trash: "Do you want to move the selected {count} items to the trash?",
        confirm_delete_single: "Are you sure you want to delete \"{name}\"?",
        confirm_disable_link: "Do you want to disable this link?\nDownloading from this URL will no longer be possible.",
        confirm_permanent_delete: "Are you sure you want to permanently delete \"{name}\"?\nThis action cannot be undone.",
        confirm_empty_trash: "Are you sure you want to empty the trash?\nAll files will be permanently deleted and cannot be recovered.",
        confirm_remove_share: "Do you want to stop sharing \"{name}\"?\n(Your own personal file will remain intact)",
        confirm_manual_backup: "Do you want to create a manual backup?\n(This may take up to a few dozen seconds depending on the number of files)",
        confirm_delete_backup: "Are you sure you want to delete backup \"{name}\"?\nThis action cannot be undone.",

        // Shared link page
        invalid_token: "Invalid link (no token)",
        expired_link: "This link has expired",
        link_not_found: "Link not found (deleted or incorrect URL)",
        failed_get_info: "Failed to retrieve file information",
        cannot_connect_server: "Cannot connect to server",
        input_password: "Please enter password",
        downloading: "Downloading...",
        wrong_password: "Incorrect password",
        shared_by: "Shared by: {owner}",
        expires_at: "Expires at: {time}",
        preview_failed: "Could not load preview"
    }
    ,
    vi: {
        account_created: "Đã tạo tài khoản thành công!",
        added_to_selection: "Đã thêm {count} tệp vào danh sách chọn",
        all_fields_required: "Tất cả các trường đều bắt buộc",
        already_have_account: "Đã có tài khoản?",
        back_btn: "Quay lại",
        back_to_files: "← Quay lại tệp",
        back_to_login: "← Quay lại đăng nhập",
        backup_create_failed: "Tạo sao lưu thất bại: {detail}",
        backup_created: "Đã tạo sao lưu: {filename}",
        backup_delete_failed: "Xóa bản sao lưu thất bại: {detail}",
        backup_deleted: "Đã xóa bản sao lưu",
        backup_detail: "Định dạng ZIP ・ {size} ・ Đã tạo: {date}",
        backup_get_settings_failed: "Không thể tải cài đặt sao lưu",
        backup_history_get_failed: "Không thể tải lịch sử sao lưu",
        backup_history_title: "Lịch sử sao lưu",
        backup_no_history: "Không có lịch sử sao lưu",
        backup_no_history_sub: "Sao lưu sẽ xuất hiện ở đây khi chạy theo lịch hoặc thủ công.",
        backup_save_failed: "Lưu thất bại: {detail}",
        backup_section: "💾 Sao lưu hệ thống (Chỉ dành cho Admin)",
        backup_settings_saved: "Đã lưu cài đặt sao lưu",
        backup_time_format_error: "Thời gian thực hiện phải có định dạng HH:MM",
        backup_time_invalid: "Thời gian thực hiện không hợp lệ (00:00 - 23:59)",
        brand_sub: "Truy cập tệp của bạn mọi lúc, mọi nơi",
        btn_add_files: "📁 Thêm tệp",
        btn_change_password: "Đổi mật khẩu",
        btn_delete: "🗑 Xóa mục đã chọn",
        btn_deselect_all: "☐ Hủy chọn tất cả",
        btn_disable_mfa: "Tắt xác thực 2 yếu tố",
        btn_empty_trash: "Dọn sạch thùng rác",
        btn_enable_mfa: "Bật xác thực 2 yếu tố",
        btn_preparing: "Đang chuẩn bị",
        btn_run_backup: "Chạy sao lưu ngay",
        btn_save_settings: "Lưu cài đặt",
        btn_select_all: "☑ Chọn tất cả",
        btn_share: "🔗 Chia sẻ mục đã chọn",
        btn_test_send: "Gửi thông báo thử nghiệm",
        btn_upload: "⬆ Tải lên",
        btn_verify_mfa: "Xác thực và kích hoạt",
        btn_zip_download: "📦 Tải tệp ZIP",
        cannot_connect: "Không thể kết nối đến máy chủ",
        cannot_connect_server: "Không thể kết nối đến máy chủ",
        cat_all: "Tất cả",
        cat_document: "📄 Tài liệu",
        cat_document_title: "Văn bản & Tài liệu",
        cat_image: "🖼 Ảnh",
        cat_image_title: "Tệp hình ảnh",
        cat_media: "🎬 Đa phương tiện",
        cat_media_title: "Video & Nhạc",
        cat_other: "📦 Khác",
        cat_other_title: "Khác & Tệp nén",
        cat_title_text: "Danh sách tệp tự động phân loại",
        category_empty: "Danh mục này trống",
        category_empty_sub: "Không tìm thấy tệp nào trong danh mục này.",
        check_zip_files: "Vui lòng chọn các tệp để nén vào ZIP",
        close: "Đóng",
        confirm_delete_backup: "Xóa bản sao lưu \"{name}\"?\nThao tác này không thể hoàn tác.",
        confirm_delete_single: "Xóa \"{name}\"?",
        confirm_disable_link: "Vô hiệu hóa liên kết này?\nTải xuống sẽ không còn khả dụng.",
        confirm_empty_trash: "Dọn sạch Thùng rác?\nTài liệu sẽ bị xóa vĩnh viễn.",
        confirm_manual_backup: "Tạo sao lưu thủ công?\n(Có thể mất một chút thời gian)",
        confirm_move_to_trash: "Di chuyển {count} tệp vào Thùng rác?",
        confirm_password_placeholder: "Xác nhận mật khẩu",
        confirm_permanent_delete: "Xóa vĩnh viễn \"{name}\"?\nThao tác này không thể hoàn tác.",
        confirm_remove_share: "Hủy chia sẻ cho \"{name}\"?\n(Tệp gốc của bạn vẫn được giữ lại)",
        copy: "Sao chép",
        copy_failed: "Sao chép liên kết thất bại",
        copy_url_btn: "Sao chép URL",
        create_account_link: "Tạo tài khoản",
        create_link_prompt: "Tạo liên kết chia sẻ cho \"{name}\".\n\nNhập số ngày hết hạn (để trống nếu vô thời hạn):",
        delete: "Xóa",
        delete_failed: "Xóa thất bại",
        disable_btn: "Vô hiệu hóa",
        disable_failed: "Vô hiệu hóa liên kết thất bại",
        download: "Tải xuống",
        download_btn_text: "↓ Tải xuống",
        download_failed: "Tải xuống thất bại",
        downloading: "Đang tải xuống...",
        drop_sub: "hoặc nhấp để chọn tệp",
        drop_title: "Kéo và thả tệp vào đây",
        email_placeholder: "Địa chỉ email",
        empty_trash_failed: "Dọn sạch thùng rác thất bại",
        error_prefix: "Lỗi: ",
        event_delete: "Xóa tệp",
        event_share: "Tạo liên kết chia sẻ",
        event_upload: "Tải tệp lên",
        expire_positive_num: "Hạn dùng phải là một số dương",
        expired: "Đã hết hạn",
        expired_link: "Liên kết này đã hết hạn",
        expires_at: "Hết hạn lúc: {time}",
        expires_none: "Hạn dùng: Không có (Vô thời hạn)",
        expires_none_brief: "Hạn dùng: Không có",
        failed_get_info: "Không thể tải thông tin tệp",
        feature_mfa: "🔒 Xác thực 2 yếu tố",
        feature_share: "🔗 Liên kết chia sẻ",
        feature_trash: "🗑 Khôi phục thùng rác",
        forgot_password_link: "Quên mật khẩu?",
        input_mfa: "Vui lòng nhập mã xác thực gồm 6 chữ số",
        input_password: "Vui lòng nhập mật khẩu",
        input_required: "Trường này là bắt buộc",
        invalid_token: "Liên kết không hợp lệ (không có mã)",
        label_auto_backup: "Sao lưu tự động theo lịch",
        label_backup: "Sao lưu tự động",
        label_backup_time: "Thời gian thực hiện",
        label_change_password: "Đổi mật khẩu",
        label_confirm_password: "Xác nhận mật khẩu mới",
        label_current_password: "Mật khẩu hiện tại",
        label_joined: "Ngày tham gia",
        label_mfa: "Xác thực 2 yếu tố (MFA)",
        label_new_password: "Mật khẩu mới",
        label_notify_events: "Sự kiện thông báo",
        label_role: "Vai trò",
        label_storage: "Dung lượng sử dụng",
        label_username: "Tên người dùng",
        label_webhook_url: "URL Webhook",
        link_copied: "Đã sao chép liên kết vào bộ nhớ tạm",
        link_creation_failed: "Tạo liên kết thất bại",
        link_disabled: "Đã vô hiệu hóa liên kết",
        link_not_found: "Không tìm thấy liên kết",
        links_info_text: "Các liên kết chia sẻ do bạn tạo",
        loading: "Đang tải...",
        login_brand: "Lưu trữ Đám mây",
        login_btn: "Đăng nhập",
        login_link: "Đăng nhập",
        login_tagline: "Tệp của bạn, an toàn và truy cập mọi lúc, mọi nơi",
        logout_btn: "Đăng xuất",
        menu_copy_url: "Sao chép URL",
        menu_create_link: "Tạo liên kết",
        menu_delete: "Xóa (Vào thùng rác)",
        menu_disable_link: "Vô hiệu hóa liên kết",
        menu_download: "Tải xuống",
        menu_perm_delete: "Xóa vĩnh viễn",
        menu_preview: "Xem trước",
        menu_qr: "Hiển thị mã QR",
        menu_remove_share: "Hủy chia sẻ",
        menu_rename: "Đổi tên",
        menu_restore: "Khôi phục",
        menu_share: "Chia sẻ",
        menu_star: "Thêm vào yêu thích",
        menu_unstar: "Bỏ yêu thích",
        mfa_code_6_digits: "Mã xác thực phải gồm 6 chữ số",
        mfa_code_placeholder: "Mã 6 chữ số (Ví dụ: 123456)",
        mfa_disabled_status: "Trạng thái: Đã tắt",
        mfa_enabled_status: "Trạng thái: Đã bật",
        mfa_instruction: "Vui lòng nhập mã xác thực gồm 6 chữ số<br>được hiển thị trong ứng dụng xác thực của bạn.",
        mfa_section: "🔒 Xác thực 2 yếu tố (MFA)",
        mfa_setup_instruction: "1. Quét mã QR bên dưới bằng ứng dụng xác thực của bạn (Google Authenticator, v.v.).",
        mfa_setup_instruction_manual: "Hoặc nhập khóa bí mật theo cách thủ công:",
        mfa_setup_instruction_verify: "2. Nhập mã gồm 6 chữ số hiển thị trong ứng dụng để hoàn tất cài đặt.",
        mfa_setup_title: "Cài đặt xác thực 2 yếu tố",
        name_change_failed: "Đổi tên thất bại",
        name_changed: "Đã đổi tên thành công",
        new_passwords_mismatch: "Mật khẩu mới không khớp",
        no_account_prompt: "Chưa có tài khoản?",
        no_files: "Không tìm thấy tệp nào",
        no_files_sub: "Tải lên tệp bằng cách kéo thả vào đây hoặc nhấp Thêm tệp.",
        no_links: "Không tìm thấy liên kết chia sẻ nào",
        no_links_sub: "Bạn có thể tạo liên kết chia sẻ từ Danh sách tệp.",
        no_shared_files: "Không có tệp chia sẻ",
        no_shared_files_sub: "Các tệp được chia sẻ với bạn sẽ xuất hiện ở đây.",
        password_changed: "Đã đổi mật khẩu thành công",
        password_none: "Mật khẩu: Không có",
        password_placeholder: "Mật khẩu",
        password_protected: "🔒 Được bảo vệ bằng mật khẩu",
        password_required: "\"{name}\" được bảo vệ bằng mật khẩu.\nNhập mật khẩu:",
        password_section: "🔑 Đổi mật khẩu",
        passwords_mismatch: "Mật khẩu không khớp",
        permanent_delete_failed: "Xóa vĩnh viễn thất bại",
        preview_failed: "Không thể tải bản xem trước",
        preview_failed_pw: "Không thể xem trước (sai mật khẩu)",
        profile_section: "👤 Cài đặt cá nhân",
        qr_btn: "QR",
        qr_hint: "Quét bằng camera điện thoại để truy cập",
        register_btn: "Tạo tài khoản",
        register_title: "Tạo tài khoản",
        rename_prompt_no_ext: "Vui lòng nhập tên mới:",
        rename_prompt_with_ext: "Vui lòng nhập tên mới\n(đuôi tệp {ext} sẽ được giữ nguyên):",
        reset_btn: "Thay đổi mật khẩu",
        reset_code_placeholder: "Mã xác thực (6 chữ số)",
        reset_instruction: "Xác minh danh tính bằng địa chỉ email đã đăng ký và mã 6 chữ số từ ứng dụng xác thực",
        reset_new_password_confirm_placeholder: "Mật khẩu mới (Xác nhận)",
        reset_new_password_placeholder: "Mật khẩu mới (Ít nhất 8 ký tự, chữ hoa, số, ký tự đặc biệt)",
        reset_title: "Đặt lại mật khẩu",
        restore: "Khôi phục",
        restore_failed: "Khôi phục thất bại",
        role_label: "Vai trò: {role}",
        search_placeholder: "Lọc theo tên tệp...",
        security_section: "🔒 Bảo mật",
        select_file: "Vui lòng chọn một tệp",
        select_file_delete: "Vui lòng chọn tệp để xóa",
        select_file_download: "Vui lòng chọn một tệp để tải xuống",
        select_file_share: "Vui lòng chọn tệp để chia sẻ",
        server_communication_failed: "Giao tiếp máy chủ thất bại",
        settings_header: "Cài đặt",
        settings_sub: "Thông tin tài khoản",
        settings_title: "Cài đặt",
        share_download_btn: "Tải xuống",
        share_error_header: "Lỗi",
        share_failed: "Chia sẻ thất bại",
        share_hint: "Bất kỳ ai có URL này đều có thể tải xuống tệp mà không cần đăng nhập.",
        share_link_created: "🔗 Đã tạo liên kết chia sẻ",
        share_link_qr: "🔗 Mã QR liên kết chia sẻ",
        share_loading: "Đang tải...",
        share_multiple_prompt: "Chia sẻ {count} tệp đã chọn.\nNhập mật khẩu chung (tùy chọn):",
        share_password_placeholder: "Mật khẩu cho tệp này",
        share_prompt: "Chia sẻ \"{name}\".\nNhập mật khẩu (tùy chọn):",
        share_removed_failed: "Hủy chia sẻ thất bại",
        share_title: "Tệp đã chia sẻ",
        shared_by: "Người chia sẻ: {owner}",
        shared_info_text: "Tệp được chia sẻ bởi người khác",
        sort_date_asc: "Cũ nhất",
        sort_date_desc: "Mới nhất",
        sort_name_asc: "Tên (A-Z)",
        sort_name_desc: "Tên (Z-A)",
        sort_owner_asc: "Người chia sẻ",
        sort_shared_date_asc: "Ngày chia sẻ (Cũ nhất)",
        sort_shared_date_desc: "Ngày chia sẻ (Mới nhất)",
        sort_size_asc: "Kích thước nhỏ nhất",
        sort_size_desc: "Kích thước lớn nhất",
        sort_trash_date_asc: "Ngày xóa (Cũ nhất)",
        sort_trash_date_desc: "Ngày xóa (Mới nhất)",
        star_title: "Yêu thích",
        starred: "Đã thêm vào mục yêu thích",
        stat_my_files: "Tệp của tôi",
        stat_sharing: "Bạn đang chia sẻ",
        stat_storage: "Dung lượng",
        storage_status: "Dung lượng: {used} / {total} ({pct}%)",
        storage_text: "Đang tải dung lượng lưu trữ...",
        sub_backup: "Tự động thực hiện sao lưu hàng ngày vào thời gian đã chỉ định",
        sub_backup_time: "Thời gian thực hiện sao lưu tự động (Ví dụ: 00:00)",
        sub_change_password: "Thay đổi mật khẩu tài khoản của bạn",
        sub_mfa: "Tăng cường bảo mật tài khoản bằng ứng dụng xác thực (Google Authenticator, v.v.)",
        sub_notify_events: "Chọn các sự kiện để gửi thông báo",
        sub_webhook_url: "Nhập URL Webhook của Discord hoặc Slack",
        tab_links: "🔗 Liên kết",
        tab_my_files: "📊 Tệp của tôi",
        tab_shared: "📂 Đã chia sẻ",
        tab_trash: "🗑 Thùng rác",
        theme_toggle_title: "Chuyển giao diện",
        title_files: "Tệp của tôi - Cloud Storage",
        title_login: "Đăng nhập",
        title_register: "Tạo tài khoản",
        title_reset: "Đặt lại mật khẩu",
        title_settings: "Cài đặt - Cloud Storage",
        title_share: "Tệp đã chia sẻ - Cloud Storage",
        trash_empty: "Thùng rác trống",
        trash_empty_sub: "Các tệp đã xóa sẽ xuất hiện ở đây và có thể khôi phục.",
        trash_move_success: "Đã di chuyển {count} tệp vào Thùng rác (Thất bại: {failed})",
        tray_clear_all: "Xóa tất cả",
        tray_selected: "Tệp đã chọn",
        tray_zip_mode: "Nén các tệp đã chọn thành một tệp ZIP",
        unit_items: "tệp",
        unstarred: "Đã bỏ khỏi mục yêu thích",
        unsupported: "Không thể xem trước định dạng tệp này",
        unsupported_preview: "Không thể xem trước định dạng tệp này",
        upload_complete: "Tải lên thành công {okCount} trong số {totalCount} tệp",
        upload_failed: "Tải lên {name} thất bại",
        upload_success: "Tải lên thành công {name}",
        username_placeholder: "Tên người dùng",
        verify_btn: "Xác thực & Đăng nhập",
        view_list: "Danh sách",
        view_tile: "Lưới",
        view_toggle_title: "Chuyển chế độ xem",
        webhook_get_settings_failed: "Không thể tải cài đặt Webhook",
        webhook_section: "Tích hợp Webhook",
        webhook_settings_saved: "Đã lưu cài đặt Webhook",
        webhook_test_failed: "Kiểm tra thất bại: {detail}",
        webhook_test_sent: "Đã gửi thông báo kiểm tra",
        webhook_test_url_required: "Vui lòng nhập URL Webhook để kiểm tra",
        webhook_url_invalid: "Vui lòng nhập URL hợp lệ (http:// hoặc https://)",
        welcome_greeting: "Chào mừng trở lại, {name}",
        wrong_credentials: "Email hoặc mật khẩu không chính xác",
        wrong_password: "Mật khẩu không chính xác",
        wrong_password_or_required: "Mật khẩu không chính xác (hoặc bắt buộc)",
        zip_archive_success: "Đã nén {count} tệp vào {zipName}",
        zip_creation_failed: "Tạo tệp ZIP thất bại",
        zip_download_failed: "Tải xuống ZIP thất bại",
        zip_download_success: "Đã tải xuống {count} tệp dưới dạng ZIP",
        zip_load_failed: "Không thể tải tiện ích ZIP",
    }
};

let _currentLang = "ja"; // デフォルト

function t(key, params = {}) {
    const lang = _currentLang || "ja";
    let text = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS["ja"] && TRANSLATIONS["ja"][key]) || key;
    for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`{${k}}`, "g"), v);
    }
    return text;
}

function applyLanguage(lang) {
    _currentLang = lang;
    try { localStorage.setItem("language", lang); } catch (_) {}

    // ボタンの表示更新
    const btn = document.getElementById("langBtn");
    if (btn) {
        if (lang === "ja") btn.textContent = "🌐 EN";
        else if (lang === "en") btn.textContent = "🌐 VI";
        else btn.textContent = "🌐 JP";
    }

    // 1) 一般タグの書き換え (data-i18n)
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            // HTML内のタグを保護するため、特定の要素にはinnerHTML、その他にはtextContentを使う
            if (["mfa_instruction", "tray_zip_mode"].includes(key)) {
                el.innerHTML = TRANSLATIONS[lang][key];
            } else {
                el.textContent = TRANSLATIONS[lang][key];
            }
        }
    });

    // 2) プレースホルダーの書き換え (data-i18n-placeholder)
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.setAttribute("placeholder", TRANSLATIONS[lang][key]);
        }
    });

    // 3) ツールチップ/title属性の書き換え (data-i18n-title)
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.setAttribute("title", TRANSLATIONS[lang][key]);
        }
    });

    // 4) 動的な要素（ダッシュボードのウェルカム文言）の更新
    const welcome = document.getElementById("welcomeGreeting");
    if (welcome) {
        const nameEl = document.getElementById("heroUserName");
        const name = nameEl ? nameEl.textContent : "ゲスト";
        const template = TRANSLATIONS[lang]["welcome_greeting"];
        welcome.innerHTML = template.replace("{name}", `<span id="heroUserName">${name}</span>`);
    }

    // 5) ページタイトルの翻訳
    let titleKey = null;
    if (document.getElementById("settingsUsername")) {
        titleKey = "title_settings";
        // 設定ページの動的表示更新
        const roleEl = document.getElementById("infoRole");
        const role = roleEl ? roleEl.textContent : "user";
        const settingsRoleEl = document.getElementById("settingsRole");
        if (settingsRoleEl && role !== "--" && role !== "") {
            settingsRoleEl.textContent = t("role_label", { role });
        }
        if (typeof loadBackupHistory === "function" && role === "admin") {
            loadBackupHistory();
        }
    } else if (document.getElementById("fileList")) {
        titleKey = "title_files";
        // Dynamic re-render for category grids and category list when language changes
        if (typeof renderCategoryGrid === "function" && document.getElementById("categoryGrid")) {
            renderCategoryGrid();
        }
        if (typeof renderCategoryFileList === "function" && document.getElementById("categoryFileList")) {
            renderCategoryFileList();
        }
    } else if (document.getElementById("email") && document.getElementById("password") && document.getElementById("login-fields")) {
        titleKey = "title_login";
    } else if (document.getElementById("register-email") && document.getElementById("confirm-password")) {
        titleKey = "title_register";
    } else if (document.getElementById("reset-email") && document.getElementById("reset-code")) {
        titleKey = "title_reset";
    } else if (document.getElementById("shareLoading")) {
        titleKey = "title_share";
        // 共有ページの動的表示更新
        if (typeof renderShareContent === "function") {
            renderShareContent();
        }
    }

    if (titleKey && TRANSLATIONS[lang][titleKey]) {
        document.title = TRANSLATIONS[lang][titleKey];
    }

    // Refresh view mode toggle button text in the new language
    if (typeof applyViewMode === "function") {
        applyViewMode();
    }
}

function toggleLanguage() {
    const next = _currentLang === "ja" ? "en" : (_currentLang === "en" ? "vi" : "ja");
    applyLanguage(next);
}

// 画面表示時に即時に適用
(function _restoreLanguageImmediately() {
    try {
        const saved = localStorage.getItem("language");
        if (saved) {
            _currentLang = saved;
        }
    } catch (_) {}
    // DOM構築後またはスクリプトロード直後に実行
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => applyLanguage(_currentLang));
    } else {
        setTimeout(() => applyLanguage(_currentLang), 0);
    }
})();



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
            ? `<i class="fa-solid fa-list"></i> ${t("view_list")}`
            : `<i class="fa-solid fa-table-cells"></i> ${t("view_tile")}`;
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
    let s = String(message);
    const lang = _currentLang || "ja";
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][message]) {
        s = TRANSLATIONS[lang][message];
    }

    // type が指定されない場合は、メッセージ内容から色を自動判定
    if (!type) {
        if (/失敗|エラー|違|接続できません|正しくありません|不正|error|fail|incorrect|cannot connect/i.test(s)) type = "error";
        else if (/成功|完了|しました|アカウントを作成|success|completed|created/i.test(s))         type = "success";
        else if (/選択してください|入力してください|一致しません|select|enter|mismatch|required/i.test(s)) type = "warning";
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
                    <button class="preview-download-btn" id="preview-dl-btn" style="background:#2563eb; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:bold; display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-download"></i>${t("download")}</button>
                    <button class="image-modal-close" onclick="closePreview()" aria-label="${t('close')}" style="position:static; padding:0; background:none;">✕</button>
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
    body.innerHTML = `<p style="color:#94a3b8;text-align:center;padding:20px">${t("loading")}</p>`;

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
            body.innerHTML = `<p style="color:#f87171;text-align:center;padding:20px">${t("preview_failed")}</p>`;
        }
    } else {
        body.innerHTML = `
            <div class="preview-unsupported" style="text-align:center; padding:40px 20px; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:16px;">
                <i class="fa-solid fa-file-circle-question" style="font-size:48px; color:#64748b;"></i>
                <p>${t("unsupported")}</p>
                <button class="download-btn" onclick="downloadFile(decodeURIComponent('${encodeURIComponent(filename)}'))" style="background:#2563eb; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">${t("download_btn_text")}</button>
            </div>`;
    }

    document.getElementById("preview-modal").hidden = false;
}

async function previewSharedFile(owner, filename, isProtected) {
    const ext = (filename.split(".").pop() || "").toLowerCase();
    
    let password = null;
    if (isProtected) {
        password = prompt(t("password_required", { name: filename }));
        if (password === null) return;
    }

    _ensurePreviewModal();
    document.getElementById("preview-title").textContent = filename;

    const dlBtn = document.getElementById("preview-dl-btn");
    if (dlBtn) {
        dlBtn.onclick = () => downloadShared(owner, filename, isProtected);
    }

    const body = document.getElementById("preview-body");
    body.innerHTML = `<p style="color:#94a3b8;text-align:center;padding:20px">${t("loading")}</p>`;

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
            body.innerHTML = `<p style="color:#f87171;text-align:center;padding:20px">${t("preview_failed_pw")}</p>`;
        }
    } else {
        body.innerHTML = `
            <div class="preview-unsupported" style="text-align:center; padding:40px 20px; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:16px;">
                <i class="fa-solid fa-file-circle-question" style="font-size:48px; color:#64748b;"></i>
                <p>${t("unsupported")}</p>
                <button class="download-btn" onclick="downloadShared(decodeURIComponent('${encodeURIComponent(owner)}'), decodeURIComponent('${encodeURIComponent(filename)}'), ${isProtected})" style="background:#2563eb; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">${t("download_btn_text")}</button>
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
        notify("unstarred");
    } else {
        favs.push(filename);
        notify("starred");
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
        notify("input_required");
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
            notify(err.detail || "wrong_credentials");
        }

    } catch (err) {
        notify("cannot_connect");
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
        notify("input_mfa");
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
        notify("cannot_connect");
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
        notify("all_fields_required");
        return;
    }

    if (password !== confirmPassword) {
        notify("passwords_mismatch");
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
            notify("account_created");
            location.href = "login.html";
        } else {
            const err = await res.json();
            notify(t("error_prefix") + err.detail);
        }

    } catch (err) {
        notify("cannot_connect");
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
        notify("all_fields_required");
        return;
    }
    if (newPw !== newPw2) {
        notify("new_passwords_mismatch");
        return;
    }
    if (code.length !== 6) {
        notify("mfa_code_6_digits");
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
            notify(data.message || "password_changed");
            location.href = "login.html";
        } else {
            const err = await res.json();
            const msg = typeof err.detail === "string" ? err.detail : "変更に失敗しました";
            notify(msg);
        }
    } catch (err) {
        notify("cannot_connect");
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
            fileList.innerHTML = _emptyStateHTML("fa-folder-open", t("no_files"), t("no_files_sub"));
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
                <button class="star-btn ${starred ? 'starred' : ''}" onclick="toggleFavorite(decodeURIComponent('${safeName}'))" title="${t('star_title')}" data-i18n-title="star_title">${starred ? '★' : '☆'}</button>
                <div class="file-info-clickable" onclick="${clickHandler}">
                    ${thumb}
                    <div>
                        <div class="file-name" title="${dispName}">${dispName}</div>
                        <div class="file-detail">${dispType} ・ ${escapeHtml(file.size)} ・ ${escapeHtml(file.uploaded_at)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="downloadFile(decodeURIComponent('${safeName}'))" data-i18n="download_btn_text">${t("download_btn_text")}</button>
                    <button class="preview-btn"  onclick="previewFile(decodeURIComponent('${safeName}'))" title="${t("menu_preview")}" data-i18n-title="menu_preview"><i class="fa-solid fa-eye"></i></button>
                    <button class="rename-btn"   onclick="renameFile(decodeURIComponent('${safeName}'))" title="${t("menu_rename")}" data-i18n-title="menu_rename"><i class="fa-solid fa-pen"></i></button>
                    <button class="share-btn"    onclick="shareFile(decodeURIComponent('${safeName}'))" title="${t("menu_share")}" data-i18n-title="menu_share"><i class="fa-solid fa-share-nodes"></i></button>
                    <button class="delete-btn"   onclick="deleteFile(decodeURIComponent('${safeName}'))" title="${t("delete")}" data-i18n-title="delete"><i class="fa-solid fa-trash"></i></button>
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
                { icon: "👁", label: t("menu_preview"),            action: () => previewFile(name) },
                { icon: "⬇", label: t("menu_download"),          action: () => downloadFile(name) },
                { icon: fav ? "★" : "☆", label: fav ? t("menu_unstar") : t("menu_star"), action: () => toggleFavorite(name) },
                { divider: true },
                { icon: "✏", label: t("menu_rename"),            action: () => renameFile(name) },
                { icon: "🔗", label: t("menu_share"),              action: () => shareFile(name) },
                { divider: true },
                { icon: "🗑", label: t("menu_delete"),      action: () => deleteFile(name), danger: true },
            ];
        } else if (ctx === "trash") {
            items = [
                { icon: "↩", label: t("menu_restore"),              action: () => restoreFile(name) },
                { divider: true },
                { icon: "✕", label: t("menu_perm_delete"),            action: () => permanentDelete(name), danger: true },
            ];
        } else if (ctx === "shared") {
            const owner = card.dataset.owner;
            const prot  = card.dataset.protected === "true";
            const me    = sessionStorage.getItem("username");
            items = [
                { icon: "👁", label: t("menu_preview"),            action: () => previewSharedFile(owner, name, prot) },
                { icon: "⬇", label: t("menu_download"),          action: () => downloadShared(owner, name, prot) },
            ];
            if (owner === me) {
                items.push({ divider: true });
                items.push({ icon: "🔗", label: t("menu_create_link"),  action: () => createShareLink(name) });
                items.push({ icon: "✕", label: t("menu_remove_share"),  action: () => unshareFile(owner, name), danger: true });
            }
        } else if (ctx === "link") {
            const url   = card.dataset.url;
            const token = card.dataset.token;
            items = [
                { icon: "📋", label: t("menu_copy_url"),           action: () => copyUrlText(url) },
                { icon: "📱", label: t("menu_qr"),        action: () => showLinkQR(url, name) },
                { divider: true },
                { icon: "✕", label: t("menu_disable_link"),        action: () => deleteLink(token), danger: true },
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
    const nextKey = allChecked ? "btn_select_all" : "btn_deselect_all";
    btn.setAttribute("data-i18n", nextKey);
    btn.textContent = t(nextKey);
}


// =====================================
// 選択したファイルをZIPでまとめてダウンロード
// =====================================
async function downloadSelectedZip(e) {
    const btn = _btnFromEvent(e);
    const filenames = _activeCheckedNames();

    if (filenames.length === 0) {
        notify("select_file_download");
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
        notify(t("zip_download_success", { count: filenames.length }));
    } catch (err) {
        notify("zip_download_failed");
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
        notify("select_file_delete");
        return;
    }

    if (!confirm(t("confirm_move_to_trash", { count: filenames.length }))) return;

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
                notify(t("trash_move_success", { count: data.succeeded.length, failed: data.failed.join(", ") }));
            }
            await loadFiles();
            await loadStorage();
        } else {
            const err = await res.json();
            notify(t("error_prefix") + err.detail);
        }
    } catch (err) {
        notify("delete_failed");
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

        const usedNum = parseFloat(data.used);
        const maxNum  = parseFloat(data.max);
        let pct = 0;
        if (maxNum > 0) pct = Math.min(100, Math.round((usedNum / maxNum) * 100));

        // 上部テキスト（ヒーロー内）
        const storageText = document.getElementById("storageText");
        if (storageText) {
            const template = TRANSLATIONS[_currentLang]["storage_status"] || "使用容量: {used} / {total} ({pct}%)";
            storageText.textContent = template
                .replace("{used}", data.used)
                .replace("{total}", data.max)
                .replace("{pct}", pct);
        }

        // ヒーローカードの数値・ゲージを反映
        const heroVal = document.getElementById("heroStorageText");
        if (heroVal) heroVal.textContent = data.used;

        const fill = document.getElementById("heroStorageFill");
        if (fill) {
            fill.style.width = pct + "%";
            // 80%超えたら赤系にする
            fill.classList.toggle("warning", pct >= 80);
        }
        
        const remainingGB = Math.max(0, maxNum - usedNum).toFixed(2);
        const pctEl = document.getElementById("heroStoragePct");
        if (pctEl) {
            pctEl.textContent = _currentLang === "ja"
                ? `${pct}%（残り ${remainingGB}GB）`
                : `${pct}% (${remainingGB}GB remaining)`;
        }

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

    // 言語設定を適用してウェルカム文言などを更新
    applyLanguage(_currentLang);
}


// =====================================
// ファイル選択してアップロード
// =====================================
async function uploadSelectedFile(e) {
    const btn = _btnFromEvent(e);

    if (_uploadQueue.length === 0) {
        notify("select_file");
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
        notify("check_zip_files");
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
            notify(t("upload_complete", { okCount, totalCount }));
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
        notify("zip_load_failed");
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
        notify("zip_creation_failed");
        return false;
    }

    // --- 生成したZIPをファイルとしてアップロード ---
    const zipFile = new File([blob], zipName, { type: "application/zip" });
    if (label) label.textContent = `${zipName} をアップロード中...`;

    const done = await uploadFileData(zipFile);
    if (done) {
        notify(t("zip_archive_success", { count: files.length, zipName }));
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
                    notify(t("upload_success", { name: file.name }));
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
            notify(t("upload_failed", { name: file.name }));
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
            notify("download_failed");
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
        notify("download_failed");
    }
}


// =====================================
// ファイル削除
// =====================================
async function deleteFile(filename) {
    if (!confirm(t("confirm_delete_single", { name: filename }))) return;

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
            notify(t("error_prefix") + err.detail);
        }
    } catch (e) {
        notify("delete_failed");
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
    const daysInput = prompt(t("create_link_prompt", { name: filename }), "7");
    if (daysInput === null) return;   // キャンセル

    const expire_days = daysInput.trim() ? parseInt(daysInput.trim(), 10) : null;
    if (daysInput.trim() && (isNaN(expire_days) || expire_days <= 0)) {
        notify("expire_positive_num");
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
            notify(t("error_prefix") + err.detail);
            return;
        }

        const data = await res.json();
        showLinkModal(filename, data);

    } catch (e) {
        notify("link_creation_failed");
    }
}

// 発行されたリンクをモーダルで表示
function showLinkModal(filename, data) {
    _ensureLinkModal();

    const expireText = data.expires_at
        ? t("expires_at", { time: new Date(data.expires_at).toLocaleString() })
        : t("expires_none");
    const pwText = data.protected ? t("password_protected") : t("password_none");

    document.getElementById("link-modal-body").innerHTML = `
        <h2 class="link-modal-title">${t("share_link_created")}</h2>
        <p class="link-modal-file">${escapeHtml(filename)}</p>

        <div class="link-qr" id="link-qr"></div>
        <p class="link-qr-hint">${t("qr_hint")}</p>

        <div class="link-url-row">
            <input type="text" id="link-url-input" class="link-url-input" value="${data.url}" readonly>
            <button class="link-copy-btn" onclick="copyShareLink()">${t("copy")}</button>
        </div>

        <p class="link-modal-meta">${expireText}</p>
        <p class="link-modal-meta">${pwText}</p>

        <p class="link-modal-hint">
            ${t("share_hint")}
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
        notify("link_copied");
    } catch (e) {
        // フォールバック：選択してコピー
        input.select();
        document.execCommand("copy");
        notify("link_copied");
    }
}

// 任意のURL文字列をコピー（リンク管理画面用）
async function copyUrlText(url) {
    try {
        await navigator.clipboard.writeText(url);
        notify("link_copied");
    } catch (e) {
        notify("copy_failed");
    }
}

// 既存リンクのQRコードをモーダル表示（リンク管理画面用）
function showLinkQR(url, filename) {
    _ensureLinkModal();

    document.getElementById("link-modal-body").innerHTML = `
        <h2 class="link-modal-title">${t("share_link_qr")}</h2>
        <p class="link-modal-file">${escapeHtml(filename)}</p>

        <div class="link-qr" id="link-qr"></div>
        <p class="link-qr-hint">${t("qr_hint")}</p>

        <div class="link-url-row">
            <input type="text" id="link-url-input" class="link-url-input" value="${url}" readonly>
            <button class="link-copy-btn" onclick="copyShareLink()">${t("copy")}</button>
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
            list.innerHTML = _emptyStateHTML("fa-link-slash", t("no_links"), t("no_links_sub"));
            return;
        }

        list.innerHTML = data.links.map(link => {
            const { icon, bg } = getFileIcon(link.filename);
            const safeToken = encodeURIComponent(link.token);

            // 有効期限の表示
            let expireText = t("expires_none_brief");
            let expired = false;
            if (link.expires_at) {
                const d = new Date(link.expires_at);
                expired = d < new Date();
                expireText = t("expires_at", { time: d.toLocaleString() }) + (expired ? ` (${t("expired")})` : "");
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
                    <button class="download-btn" onclick="copyUrlText(decodeURIComponent('${safeUrl}'))">📋 <span data-i18n="copy_url_btn">${t("copy_url_btn")}</span></button>
                    <button class="link-btn"     onclick="showLinkQR(decodeURIComponent('${safeUrl}'), decodeURIComponent('${encodeURIComponent(link.filename)}'))">📱 <span data-i18n="qr_btn">${t("qr_btn")}</span></button>
                    <button class="delete-btn"   onclick="deleteLink(decodeURIComponent('${safeToken}'))">✕ <span data-i18n="disable_btn">${t("disable_btn")}</span></button>
                </div>
            </div>`;
        }).join("");

    } catch (e) {
        list.innerHTML = `<p style='color:#f87171'>${t("cannot_connect")}</p>`;
    }
}

// リンクを無効化（削除）
async function deleteLink(token) {
    if (!confirm(t("confirm_disable_link"))) return;

    try {
        const res = await fetch(`${API_BASE}/link/${encodeURIComponent(token)}`, {
            method: "DELETE"
        });

        if (res.ok) {
            notify("link_disabled");
            await loadLinks();
        } else {
            const err = await res.json();
            notify(t("error_prefix") + err.detail);
        }
    } catch (e) {
        notify("disable_failed");
    }
}


async function renameFile(filename) {
    // 元の拡張子（".pdf" など）とベース名を分離
    const dotIdx = filename.lastIndexOf(".");
    const ext  = dotIdx > 0 ? filename.slice(dotIdx) : "";
    const base = dotIdx > 0 ? filename.slice(0, dotIdx) : filename;

    // 入力プロンプトはベース名だけを編集対象に
    const message = ext ? t("rename_prompt_with_ext", { ext }) : t("rename_prompt_no_ext");

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
            notify(data.message || "name_changed");
            await loadFiles();
        } else {
            const err = await res.json();
            notify(t("error_prefix") + err.detail);
        }
    } catch (e) {
        notify("name_change_failed");
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
            trashList.innerHTML = _emptyStateHTML("fa-trash-can", t("trash_empty"), t("trash_empty_sub"));
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
                    <button class="download-btn" onclick="restoreFile(decodeURIComponent('${safeName}'))">↩ <span data-i18n="restore">${t("restore")}</span></button>
                    <button class="delete-btn"   onclick="permanentDelete(decodeURIComponent('${safeName}'))" title="${t("menu_perm_delete")}" data-i18n-title="menu_perm_delete"><i class="fa-solid fa-trash-can"></i></button>
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
            notify(t("error_prefix") + err.detail);
        }
    } catch (e) {
        notify("restore_failed");
    }
}


// =====================================
// ゴミ箱内ファイルの完全削除（復元不可）
// =====================================
async function permanentDelete(filename) {
    if (!confirm(t("confirm_permanent_delete", { name: filename }))) return;

    try {
        const res = await fetch(
            `${API_BASE}/trash/${encodeURIComponent(filename)}`,
            { method: "DELETE" }
        );

        if (res.ok) {
            await loadTrash();
        } else {
            const err = await res.json();
            notify(t("error_prefix") + err.detail);
        }
    } catch (e) {
        notify("permanent_delete_failed");
    }
}


// =====================================
// ゴミ箱を空にする（全件完全削除）
// =====================================
async function emptyTrash(e) {
    const btn = _btnFromEvent(e);
    if (!confirm(t("confirm_empty_trash"))) return;

    setLoading(btn, true);
    try {
        const res = await fetch(`${API_BASE}/trash`, { method: "DELETE" });

        if (res.ok) {
            const data = await res.json();
            notify(data.message);
            await loadTrash();
        } else {
            const err = await res.json();
            notify(t("error_prefix") + err.detail);
        }
    } catch (err) {
        notify("empty_trash_failed");
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
    const password = prompt(t("share_prompt", { name: filename }), "");

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
            notify(t("error_prefix") + err.detail);
        }
    } catch (e) {
        notify("share_failed");
    }
}


// =====================================
// 選択したファイルをまとめて共有（同じパスワード）
// =====================================
async function shareSelected(e) {
    const btn = _btnFromEvent(e);
    const filenames = _activeCheckedNames();

    if (filenames.length === 0) {
        notify("select_file_share");
        return;
    }

    const password = prompt(t("share_multiple_prompt", { count: filenames.length }), "");

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
            notify(t("error_prefix") + err.detail);
        }
    } catch (err) {
        notify("share_failed");
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
            sharedList.innerHTML = _emptyStateHTML("fa-share-nodes", t("no_shared_files"), t("no_shared_files_sub"));
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
                ? `<button class="link-btn" onclick="createShareLink(decodeURIComponent('${safeName}'))" title="${t('menu_create_link')}" data-i18n-title="menu_create_link"><i class="fa-solid fa-link"></i></button>
                   <button class="delete-btn" onclick="unshareFile(decodeURIComponent('${safeOwner}'), decodeURIComponent('${safeName}'))" title="${t('menu_remove_share')}" data-i18n-title="menu_remove_share"><i class="fa-solid fa-link-slash"></i></button>`
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
                        <div class="file-detail">${t("shared_by", { owner: dispOwner })} ・ ${escapeHtml(file.size)} ・ ${escapeHtml(file.shared_at)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="${dlHandler}" data-i18n="download_btn_text">${t("download_btn_text")}</button>
                    <button class="preview-btn"  onclick="${clickHandler}" title="${t('menu_preview')}" data-i18n-title="menu_preview"><i class="fa-solid fa-eye"></i></button>
                    ${ownerBtns}
                </div>
            </div>`;
        }).join("");

    } catch (e) {
        sharedList.innerHTML = `<p style='color:#f87171'>${t("cannot_connect")}</p>`;
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
        const password = prompt(t("password_required", { name: filename }));
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
                notify("wrong_password_or_required");
            } else {
                notify("download_failed");
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
        notify("download_failed");
    }
}


// =====================================
// 共有を解除（自分が共有したものだけ）
// =====================================
async function unshareFile(owner, filename) {
    if (!confirm(t("confirm_remove_share", { name: filename }))) return;

    try {
        const res = await fetch(
            `${API_BASE}/shared/${encodeURIComponent(owner)}/${encodeURIComponent(filename)}`,
            { method: "DELETE" }
        );

        if (res.ok) {
            await loadShared();
        } else {
            const err = await res.json();
            notify(t("error_prefix") + err.detail);
        }
    } catch (e) {
        notify("share_removed_failed");
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
        notify(t("added_to_selection", { count: files.length }));
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
            document.getElementById("settingsRole").textContent = t("role_label", { role });
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
        image:    { title: t("cat_image_title"), icon: "fa-file-image", count: 0, bytes: 0 },
        document: { title: t("cat_document_title"),   icon: "fa-file-word",  count: 0, bytes: 0 },
        media:    { title: t("cat_media_title"),   icon: "fa-file-video", count: 0, bytes: 0 },
        other:    { title: t("cat_other_title"), icon: "fa-file-zipper", count: 0, bytes: 0 },
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
        list.innerHTML = _emptyStateHTML("fa-folder-open", t("category_empty"), t("category_empty_sub"));
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
                <button class="star-btn ${starred ? 'starred' : ''}" onclick="toggleFavorite(decodeURIComponent('${safeName}'))" title="${t('star_title')}" data-i18n-title="star_title" style="margin-right:12px;">${starred ? '★' : '☆'}</button>
                <div class="file-info-clickable" onclick="${clickHandler}" style="display:flex; align-items:center; gap:12px; cursor:pointer; flex:1;">
                    ${thumb}
                    <div>
                        <div class="file-name" title="${dispName}">${dispName}</div>
                        <div class="file-detail">${dispType} ・ ${escapeHtml(file.size)} ・ ${escapeHtml(file.uploaded_at)}</div>
                    </div>
                </div>
            </div>
            <div class="file-actions">
                <button class="download-btn" onclick="downloadFile(decodeURIComponent('${safeName}'))" data-i18n="download_btn_text">${t("download_btn_text")}</button>
                <button class="preview-btn"  onclick="previewFile(decodeURIComponent('${safeName}'))" title="${t("menu_preview")}" data-i18n-title="menu_preview"><i class="fa-solid fa-eye"></i></button>
                <button class="rename-btn"   onclick="renameFile(decodeURIComponent('${safeName}'))" title="${t("menu_rename")}" data-i18n-title="menu_rename"><i class="fa-solid fa-pen"></i></button>
                <button class="share-btn"    onclick="shareFile(decodeURIComponent('${safeName}'))" title="${t("menu_share")}" data-i18n-title="menu_share"><i class="fa-solid fa-share-nodes"></i></button>
                <button class="delete-btn"   onclick="deleteFile(decodeURIComponent('${safeName}'))" title="${t("delete")}" data-i18n-title="delete"><i class="fa-solid fa-trash"></i></button>
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
        notify("backup_get_settings_failed");
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
        notify("backup_time_format_error");
        return;
    }
    const [h, m] = timeVal.split(":").map(Number);
    if (h < 0 || h > 23 || m < 0 || m > 59) {
        notify("backup_time_invalid");
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
            notify("backup_settings_saved");
        } else {
            const err = await res.json();
            notify(t("backup_save_failed", { detail: err.detail }));
        }
    } catch (err) {
        notify("server_communication_failed");
    } finally {
        setLoading(btn, false);
    }
}

async function runManualBackup(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById("runBackupBtn");
    if (!confirm(t("confirm_manual_backup"))) return;

    setLoading(btn, true);
    try {
        const res = await fetch(`${API_BASE}/backup/run`, {
            method: "POST"
        });
        if (res.ok) {
            const data = await res.json();
            notify(t("backup_created", { filename: data.filename }));
            await loadBackupHistory();
        } else {
            const err = await res.json();
            notify(t("backup_create_failed", { detail: err.detail }));
        }
    } catch (err) {
        notify("server_communication_failed");
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
            list.innerHTML = `<p style='color:#f87171'>${t("backup_history_get_failed")}</p>`;
            return;
        }

        const backups = await res.json();

        if (backups.length === 0) {
            list.innerHTML = _emptyStateHTML(
                "fa-file-zipper",
                t("backup_no_history"),
                t("backup_no_history_sub")
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
                        <div class="file-detail">${t("backup_detail", { size: file.size, date: file.created_at })}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="download-btn" onclick="window.open('${downloadUrl}', '_blank')" title="${t("download")}" data-i18n-title="download" data-i18n="download_btn_text">${t("download_btn_text")}</button>
                    <button class="delete-btn"   onclick="deleteBackup('${file.filename}')" title="${t("delete")}" data-i18n-title="delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
        }).join("");

    } catch (e) {
        list.innerHTML = `<p style='color:#f87171'>${t("cannot_connect")}</p>`;
    }
}

async function deleteBackup(filename) {
    if (!confirm(t("confirm_delete_backup", { name: filename }))) return;

    try {
        const res = await fetch(`${API_BASE}/backup/${encodeURIComponent(filename)}`, {
            method: "DELETE"
        });

        if (res.ok) {
            notify("backup_deleted");
            await loadBackupHistory();
        } else {
            const err = await res.json();
            notify(t("backup_delete_failed", { detail: err.detail }));
        }
    } catch (e) {
        notify("delete_failed");
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
        notify("webhook_get_settings_failed");
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
        notify("webhook_url_invalid");
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
            notify("webhook_settings_saved");
        } else {
            const err = await res.json();
            notify(t("backup_save_failed", { detail: err.detail }));
        }
    } catch (err) {
        notify("server_communication_failed");
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
        notify("webhook_test_url_required");
        return;
    }

    if (!/^https?:\/\/.+/.test(webhook_url)) {
        notify("webhook_url_invalid");
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
            notify("webhook_test_sent");
        } else {
            const err = await res.json();
            notify(t("webhook_test_failed", { detail: err.detail }));
        }
    } catch (err) {
        notify("server_communication_failed");
    } finally {
        setLoading(btn, false);
    }
}