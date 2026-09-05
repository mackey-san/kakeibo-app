import { useRef, useState } from "react";
import { findNegativePriceItems, isDuplicateReceipt } from "../utils/receiptValidation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// レシート画像をバックエンドに送信し、Claude APIの解析結果を親コンポーネントに渡す
export default function ReceiptUploader({ expenses, onExpensesExtracted }) {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setWarnings([]);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const response = await fetch(`${API_BASE_URL}/api/receipts`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "レシートの解析に失敗しました");
      }

      const date = data.date || new Date().toISOString().slice(0, 10);
      const receiptId = crypto.randomUUID();
      const newExpenses = data.items.map((item) => ({
        id: crypto.randomUUID(),
        receiptId,
        date,
        store: data.store,
        name: item.name,
        price: item.price,
        category: item.category,
      }));

      if (newExpenses.length === 0) {
        setError("レシートから商品情報を読み取れませんでした");
      } else {
        const newWarnings = [];

        const negativeItems = findNegativePriceItems(newExpenses);
        if (negativeItems.length > 0) {
          const detail = negativeItems.map((item) => `${item.name}(¥${item.price.toLocaleString()})`).join("、");
          newWarnings.push(`金額がマイナスになっている商品があります: ${detail}`);
        }

        if (isDuplicateReceipt(newExpenses, expenses)) {
          newWarnings.push("同じ日付・合計金額のレシートが既に登録されています。重複登録の可能性があります");
        }

        setWarnings(newWarnings);
        onExpensesExtracted(newExpenses);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="receipt-uploader">
      <label className="upload-button">
        {isLoading ? "解析中..." : "レシート画像をアップロード"}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
          onChange={handleFileChange}
          disabled={isLoading}
          hidden
        />
      </label>
      {error && <p className="error-message">{error}</p>}
      {warnings.length > 0 && (
        <ul className="warning-list">
          {warnings.map((message, index) => (
            <li key={index} className="warning-message">
              ⚠️ {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
