# kakeibo-app

家計簿(家計簿管理)アプリ。Web アプリとして React / Next.js での構築を予定している。

## 技術構成

- フロントエンド: React (Vite) — `client/`
- バックエンド: Node.js (Express) — `server/`。Claude API (`claude-haiku-4-5`) を呼び出してレシート画像を解析する
- データ永続化: ブラウザのローカルストレージ(サーバー側DBは未使用)
- グラフ描画: Chart.js (react-chartjs-2)
- Claude APIキーは `server/.env` で管理し、`.gitignore`で除外。フロントエンドから直接APIキーを使わない

## Git運用ルール

- **コードを変更したら、その都度GitHubにプッシュすること。** 変更を溜め込まず、意味のある単位(1機能・1修正など)ごとにコミット & プッシュする。
- リモートリポジトリ: `https://github.com/mackey-san/kakeibo-app.git` (origin)
- コミットメッセージは変更内容が分かるように簡潔に書く。
- 作業前に `git status` で状態を確認し、意図しない変更が混ざっていないかを確認してからコミットする。
- force push (`--force`)、`git reset --hard`、履歴の書き換えなど破壊的な操作は行わない。必要な場合は必ず事前に確認する。
- `.env` など秘密情報を含むファイルはコミットしない。
