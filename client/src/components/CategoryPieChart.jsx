import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { CATEGORY_COLORS } from "../constants/categories";

ChartJS.register(ArcElement, Tooltip, Legend);

// カテゴリ別の支出合計を円グラフで表示する
export default function CategoryPieChart({ expenses }) {
  const totals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.price;
    return acc;
  }, {});

  const labels = Object.keys(totals);

  if (labels.length === 0) {
    return <p className="empty-message">データがありません</p>;
  }

  const data = {
    labels,
    datasets: [
      {
        data: labels.map((label) => totals[label]),
        backgroundColor: labels.map((label) => CATEGORY_COLORS[label] || "#9ca3af"),
      },
    ],
  };

  return <Pie data={data} />;
}
