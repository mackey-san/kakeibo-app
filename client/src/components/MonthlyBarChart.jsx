import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// 月別の支出合計を棒グラフで表示する
export default function MonthlyBarChart({ expenses }) {
  const totals = expenses.reduce((acc, expense) => {
    const month = expense.date ? expense.date.slice(0, 7) : "不明";
    acc[month] = (acc[month] || 0) + expense.price;
    return acc;
  }, {});

  const months = Object.keys(totals).sort();

  if (months.length === 0) {
    return <p className="empty-message">データがありません</p>;
  }

  const data = {
    labels: months,
    datasets: [
      {
        label: "月別支出合計(円)",
        data: months.map((month) => totals[month]),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <Bar
      data={data}
      options={{ responsive: true, plugins: { legend: { display: false } } }}
    />
  );
}
