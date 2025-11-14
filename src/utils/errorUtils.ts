// src/utils/errorUtils.ts

/**
 * Extrae un mensaje de error legible de un objeto de error, que comúnmente
 * proviene de una respuesta de API (Axios) o es un objeto Error estándar.
 *
 * @param error - El objeto de error capturado en un bloque catch. Puede ser de cualquier tipo.
 * @param fallbackMessage - Un mensaje predeterminado a devolver si no se puede extraer uno específico.
 * @returns Un string con el mensaje de error.
 */
export function extractErrorMessage(error: any, fallbackMessage: string): string {
    // 1. Errores de Axios con cuerpo de respuesta del backend (p.ej., { "message": "..." })
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    // 2. Errores de Axios donde `data` es un string (menos común, pero posible)
    if (typeof error?.response?.data === 'string' && error.response.data.trim() !== '') {
        return error.response.data;
    }

    // 3. Objetos Error estándar de JavaScript (new Error('...'))
    if (error instanceof Error) {
        return error.message;
    }

    // 4. Si el error es directamente un string
    if (typeof error === 'string' && error.trim() !== '') {
        return error;
    }

    // 5. Como último recurso, devolver el mensaje predeterminado.
    return fallbackMessage;
}
