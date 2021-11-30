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
@Pipe({ name: 'timeDiff' })
export class TimeDiffPipe implements PipeTransform {
  transform(value: number): string {
    if (value < 24 * 60 * 60 * 1000) {
      if (value < 60 * 60 * 1000) {
        if (value < 60 * 1000) {
          return `a few seconds`
        }

        const minutes = Math.floor(value / (60 * 1000))
        return `${minutes} minute${minutes === 1 ? '' : 's'}`
      }

      const hours = Math.floor(value / (60 * 60 * 1000))
      return `${hours} hour${hours === 1 ? '' : 's'}`
    } else {
      const days = Math.floor(value / (24 * 60 * 60 * 1000))
      return `${days} day${days === 1 ? '' : 's'}`
    }
  }
}
