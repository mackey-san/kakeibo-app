# レシート読み込み家計簿アプリ

レシート画像をアップロードするとClaude APIが内容を自動解析し、商品名・金額・日付・カテゴリを記録する家計簿アプリ。

## 構成

- `client/` : React (Vite) フロントエンド
- `server/` : Node.js (Express) バックエンド。Claude API (Haiku) の呼び出しを担当

## セットアップ

### 1. バックエンド

```bash
cd server
cp .env.example .env   # ANTHROPIC_API_KEYを自分のキーに書き換える
npm install
npm run dev
```

`http://localhost:3001` で起動します。

### 2. フロントエンド

```bash
cd client
npm install
npm run dev
```

`http://localhost:5173` で起動します。ブラウザで開いてレシート画像をアップロードしてください。

## 機能

- レシート画像アップロード → Claude API (`claude-haiku-4-5`) が商品名・金額・日付を読み取り
- カテゴリ(食費・日用品・外食・交通費・娯楽・医療・その他)を自動分類
- Chart.jsによるカテゴリ別円グラフ・月別棒グラフ
- データはブラウザのローカルストレージに保存され、リロードしても消えない

## 注意

- Claude APIキーはサーバー側の `.env` でのみ管理し、フロントエンドやGitに含めないこと(`.gitignore`で除外済み)
