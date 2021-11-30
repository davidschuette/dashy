import { Pipe, PipeTransform } from '@angular/core'
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
 */
@Pipe({ name: 'time' })
export class TimePipe implements PipeTransform {
  transform(value: number): string {
    const hours = Math.floor(value / (60 * 60 * 1000))
    value = value % (60 * 60 * 1000)
    const minutes = Math.floor(value / (60 * 1000))
    value = value % (60 * 1000)
    const seconds = Math.floor(value / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }

    return ''
  }
}
