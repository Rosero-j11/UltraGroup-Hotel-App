import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe que formatea un número como moneda colombiana (COP) sin decimales.
 *
 * Usa la API nativa `Intl.NumberFormat` con locale `es-CO` para garantizar
 * el formato correcto: separador de miles con punto, sin centavos.
 *
 * @example
 * // En template
 * {{ 250000 | copCurrency }}
 * // Resultado: "$ 250.000"
 *
 * // Valores nulos o undefined
 * {{ null | copCurrency }}
 * // Resultado: "—" (guion largo, no lanza error)
 */
@Pipe({ name: 'copCurrency', standalone: true })
export class CopCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
