/**
 * @description Форматує рядок цифр у маску +38 (0XX) XXX-XX-XX з урахуванням гнучкого введення префіксів
 */
export const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  // 1. Кейс: користувач вводить префікс поступово (3, 38, 0)
  // Ми повертаємо введене значення як є (з плюсом, якщо він був), щоб не заважати
  if (digits === "3" || digits === "38" || digits === "0") {
    return value.startsWith("+") ? `+${digits}` : digits;
  }

  // 2. Визначаємо "корисну" частину номера (після 380 або 0)
  let significantDigits = "";
  if (digits.startsWith("380")) {
    significantDigits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    significantDigits = digits.slice(1);
  } else {
    // Якщо введено цифри без 0 або 380 (наприклад, одразу 67)
    significantDigits = digits;
  }

  // Якщо ми ще не маємо достатньо цифр для ідентифікації UA номера (менше 2 цифр після префікса)
  // і користувач почав не з 380/0, просто повертаємо цифри
  if (
    significantDigits.length < 2 &&
    !digits.startsWith("380") &&
    !digits.startsWith("0")
  ) {
    return value.startsWith("+") ? `+${digits}` : digits;
  }

  // 3. Накладаємо маску UA стандарту
  const mainPart = significantDigits.slice(0, 9);
  let result = "+38 (0";

  if (mainPart.length > 0) {
    result += mainPart.slice(0, 2);
  }
  if (mainPart.length > 2) {
    result += ") " + mainPart.slice(2, 5);
  }
  if (mainPart.length > 5) {
    result += "-" + mainPart.slice(5, 7);
  }
  if (mainPart.length > 7) {
    result += "-" + mainPart.slice(7, 9);
  }

  return result;
};
