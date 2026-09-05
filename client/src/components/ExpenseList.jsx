// 登録済みの支出を日付の新しい順に一覧表示するテーブル
export default function ExpenseList({ expenses, onRemove }) {
  if (expenses.length === 0) {
    return (
      <p className="empty-message">
        まだ登録された支出がありません。レシートをアップロードしてください。
      </p>
    );
  }

  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <table className="expense-table">
      <thead>
        <tr>
          <th>日付</th>
          <th>商品名</th>
          <th>金額</th>
          <th>カテゴリ</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((expense) => (
          <tr key={expense.id}>
            <td>{expense.date}</td>
            <td>{expense.name}</td>
            <td>¥{expense.price.toLocaleString()}</td>
            <td>{expense.category}</td>
            <td>
              <button className="delete-button" onClick={() => onRemove(expense.id)}>
                削除
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
