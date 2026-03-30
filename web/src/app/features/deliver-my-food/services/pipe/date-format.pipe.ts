import { Pipe, PipeTransform } from '@angular/core';

interface PhpDateTime {
  date: string;
  timezone_type: number;
  timezone: string;
}

@Pipe({ name: 'dateFormat' })
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | PhpDateTime): string {
    if (!value) return '';

    if (typeof value === 'object' && 'date' in value) {
      value = value.date;
    }
    const date = typeof value === 'string' ? new Date(value) : value;

    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
