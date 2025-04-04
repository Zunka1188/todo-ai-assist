
import { useState, useEffect } from 'react';

// Moved from useShoppingItems to avoid duplication
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return defaultValue;
    return JSON.parse(storedValue);
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return defaultValue;
  }
};

const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const defaultCategories = ["Groceries", "Household", "Electronics", "Clothing", "Other"];

export const useCategoriesManager = () => {
  const [categories, setCategories] = useState<string[]>(() => loadFromLocalStorage<string[]>('shoppingCategories', defaultCategories));
  const [newCategory, setNewCategory] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState('');
  const [categoryToEdit, setCategoryToEdit] = useState('');
  const [editedCategoryName, setEditedCategoryName] = useState('');

  useEffect(() => {
    saveToLocalStorage('shoppingCategories', categories);
  }, [categories]);

  const addCategory = (category: string) => {
    if (category.trim() === '' || categories.includes(category.trim())) {
      return false;
    }
    const updatedCategories = [...categories, category.trim()];
    setCategories(updatedCategories);
    return true;
  };

  const deleteCategory = (category: string) => {
    if (!category || category === 'All') return false;
    const updatedCategories = categories.filter(c => c !== category);
    setCategories(updatedCategories);
    return true;
  };

  const updateCategory = (oldCategory: string, newCategoryName: string) => {
    if (!oldCategory || oldCategory === 'All' || newCategoryName.trim() === '') return false;
    if (categories.includes(newCategoryName.trim()) && newCategoryName.trim() !== oldCategory) {
      return false;
    }
    const updatedCategories = categories.map(c => c === oldCategory ? newCategoryName.trim() : c);
    setCategories(updatedCategories);
    return true;
  };

  return {
    categories: ['All', ...categories],
    newCategory,
    categoryToDelete,
    categoryToEdit,
    editedCategoryName,
    setNewCategory,
    setCategoryToDelete,
    setCategoryToEdit,
    setEditedCategoryName,
    addCategory,
    deleteCategory,
    updateCategory,
  };
};
