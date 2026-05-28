# =====================================
# ログ保存関数
#
# action
# ↓
# 実行内容
# =====================================
def save_log(
    action
):

    # 今は画面表示だけ
    print(

        f"LOG: {action}"

    )
    save_log(
    "login"
)# ログ記録
def save_log(
    action
):

    print(
        f"LOG: {action}"
    )


save_log(
    "login"
)