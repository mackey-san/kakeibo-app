import { useMemo } from "react";
import { useExpenses } from "./hooks/useExpenses";
import ReceiptUploader from "./components/ReceiptUploader";
import ExpenseList from "./components/ExpenseList";
import CategoryPieChart from "./components/CategoryPieChart";
import MonthlyBarChart from "./components/MonthlyBarChart";
import "./App.css";

function App() {
  const { expenses, addExpenses, removeExpense } = useExpenses();

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.price, 0),
    [expenses],
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>レシート読み込み家計簿</h1>
        <p className="total-amount">合計支出: ¥{total.toLocaleString()}</p>
      </header>

      <ReceiptUploader onExpensesExtracted={addExpenses} />

      <section className="charts">
        <div className="chart-card">
          <h2>カテゴリ別</h2>
          <CategoryPieChart expenses={expenses} />
        </div>
        <div className="chart-card">
          <h2>月別</h2>
          <MonthlyBarChart expenses={expenses} />
        </div>
      </section>

      <section className="list-section">
        <h2>支出一覧</h2>
        <ExpenseList expenses={expenses} onRemove={removeExpense} />
      </section>
    </div>
  );
}

export default App;
