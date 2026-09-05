import { useEffect, useState } from "react";

const STORAGE_KEY = "kakeibo-expenses";

// ローカルストレージに保存されている支出データを読み込む
function loadExpenses() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 支出データをローカルストレージで永続化するフック(リロードしても消えない)
export function useExpenses() {
  const [expenses, setExpenses] = useState(loadExpenses);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpenses = (newItems) => {
    setExpenses((prev) => [...newItems, ...prev]);
  };

  const removeExpense = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  return { expenses, addExpenses, removeExpense };
}
