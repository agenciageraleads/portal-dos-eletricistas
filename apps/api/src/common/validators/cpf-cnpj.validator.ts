/**
 * CPF/CNPJ Validation Helpers
 * Implements Brazilian document validation algorithms
 */

/**
 * Validates CPF (11 digits)
 * @param cpf - CPF string (only numbers)
 * @returns true if valid, false otherwise
 */
export function isValidCPF(cpf: string): boolean {
    // Remove non-numeric characters
    cpf = cpf.replace(/\D/g, '');

    // Must have exactly 11 digits
    if (cpf.length !== 11) return false;

    // Known invalid CPFs (all same digit)
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cpf.charAt(9))) return false;

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cpf.charAt(10))) return false;

    return true;
}

/**
 * Validates CNPJ (14 digits)
 * @param cnpj - CNPJ string (only numbers)
 * @returns true if valid, false otherwise
 */
export function isValidCNPJ(cnpj: string): boolean {
    // Remove non-numeric characters
    cnpj = cnpj.replace(/\D/g, '');

    // Must have exactly 14 digits
    if (cnpj.length !== 14) return false;

    // Known invalid CNPJs (all same digit)
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    // Validate first check digit
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    // Validate second check digit
    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
}

/**
 * Validates CPF or CNPJ based on length
 * @param document - CPF or CNPJ string
 * @returns true if valid, false otherwise
 */
export function isValidCpfCnpj(document: string): boolean {
    const cleaned = document.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return isValidCPF(cleaned);
    } else if (cleaned.length === 14) {
        return isValidCNPJ(cleaned);
    }

    return false;
}
