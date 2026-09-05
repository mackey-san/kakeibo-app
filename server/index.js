// レシート画像をClaude APIに送り、商品名・金額・日付・カテゴリを抽出するバックエンドサーバー
import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
const port = process.env.PORT || 3001;

// APIキーはブラウザに渡さず、サーバー側の環境変数からのみ読み込む
const anthropic = new Anthropic();

// レシート画像はディスクに保存せず、メモリ上でBase64に変換してすぐ破棄する
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MBまで
});

// 分類先のカテゴリ一覧(フロントエンドの表示・集計と一致させること)
const CATEGORIES = ["食費", "日用品", "外食", "交通費", "娯楽", "医療", "その他"];

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/receipts", upload.single("receipt"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "レシート画像が送信されていません" });
  }

  const allowedMediaTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedMediaTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: "対応していない画像形式です(jpeg/png/webp/gifのみ)" });
  }

  const base64Image = req.file.buffer.toString("base64");

  const prompt = `あなたはレシート画像を読み取る家計簿アプリのアシスタントです。
画像に写っているレシートから、以下の情報をJSON形式のみで出力してください。説明文やコードブロックの記号は一切付けないでください。

出力形式:
{
  "date": "YYYY-MM-DD形式の購入日。読み取れない場合はnull",
  "store": "店舗名。読み取れない場合はnull",
  "items": [
    { "name": "商品名", "price": 金額(円・整数), "category": "カテゴリ名" }
  ]
}

categoryは必ず次の中から最も適切なものを1つ選んでください: ${CATEGORIES.join(", ")}
判断が難しい場合は「その他」にしてください。`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: req.file.mimetype,
                data: base64Image,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock) {
      return res.status(502).json({ error: "Claude APIからテキスト応答が得られませんでした" });
    }

    // 万一コードブロック記号が付いた場合に備えて取り除いてからパースする
    const rawText = textBlock.text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return res.status(502).json({ error: "Claude APIの応答をJSONとして解析できませんでした", raw: rawText });
    }

    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const normalizedItems = items
      .filter((item) => item && typeof item.name === "string" && typeof item.price === "number")
      .map((item) => ({
        name: item.name,
        price: Math.round(item.price),
        category: CATEGORIES.includes(item.category) ? item.category : "その他",
      }));

    res.json({
      date: typeof parsed.date === "string" ? parsed.date : null,
      store: typeof parsed.store === "string" ? parsed.store : null,
      items: normalizedItems,
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic認証エラー:", error.message);
      res.status(500).json({ error: "サーバーのAPIキー設定に問題があります" });
    } else if (error instanceof Anthropic.RateLimitError) {
      console.error("Anthropicレート制限:", error.message);
      res.status(429).json({ error: "リクエストが集中しています。時間をおいて再試行してください" });
    } else if (error instanceof Anthropic.BadRequestError) {
      console.error("Anthropicリクエストエラー:", error.message);
      res.status(400).json({ error: "画像の解析に失敗しました" });
    } else if (error instanceof Anthropic.APIError) {
      console.error("Anthropic APIエラー:", error.message);
      res.status(502).json({ error: "Claude APIとの通信に失敗しました" });
    } else {
      console.error("予期しないエラー:", error);
      res.status(500).json({ error: "サーバー内部でエラーが発生しました" });
    }
  }
});

app.listen(port, () => {
  console.log(`家計簿サーバーが起動しました: http://localhost:${port}`);
});
