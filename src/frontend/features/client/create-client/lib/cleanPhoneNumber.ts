/*
 * @description Очищує маску для відправки на бекенд (+380XXXXXXXXX)
 */
export const cleanPhoneNumber = (value: string) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");

  // Якщо цифр мало, ймовірно це неповний номер, повертаємо порожньо
  if (digits.length < 9) return "";

  let result = "";
  if (digits.startsWith("380")) {
    result = digits;
  } else if (digits.startsWith("0")) {
    result = "38" + digits;
  } else {
    // Якщо введено без префіксів (напр. 671234567)
    result = "380" + digits;
  }

  return result.length === 12 ? `+${result}` : "";
};
