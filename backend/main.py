from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()


@app.get("/", response_class=HTMLResponse)
def home():

    return """
    <h1>クラウドストレージ</h1>

    <form>

      <input placeholder="ユーザー名">

      <br><br>

      <input
      type="password"
      placeholder="パスワード"
      >

      <br><br>

      <button>

      ログイン

      </button>

    </form>
    """