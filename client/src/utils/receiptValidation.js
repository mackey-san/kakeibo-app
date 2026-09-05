// レシートデータの妥当性をチェックするユーティリティ

// 金額が負の値になっている商品を抽出する(読み取りミスの可能性が高い)
export function findNegativePriceItems(items) {
  return items.filter((item) => item.price < 0);
}

// 同じ日付・合計金額のレシートが既に登録済みかどうかを調べる
export function isDuplicateReceipt(newItems, existingExpenses) {
  if (newItems.length === 0) return false;

  const newDate = newItems[0].date;
  const newTotal = newItems.reduce((sum, item) => sum + item.price, 0);

  // receiptId単位で合計金額を集計し、同じ日付・合計金額の組み合わせがあるか調べる
  const totalsByReceipt = new Map();
  for (const expense of existingExpenses) {
    const current = totalsByReceipt.get(expense.receiptId) ?? { date: expense.date, total: 0 };
    current.total += expense.price;
    totalsByReceipt.set(expense.receiptId, current);
  }

  return [...totalsByReceipt.values()].some(
    (receipt) => receipt.date === newDate && receipt.total === newTotal,
  );
}
