import { useState, useEffect } from "react";

// Hook genérico para ler e escrever no localStorage
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // Lê o valor inicial do localStorage ou usa o valor padrão
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Salva o valor no localStorage sempre que ele mudar
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
