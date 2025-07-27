export const setLocal = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocal = (key: string, fallback: any = null) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};
