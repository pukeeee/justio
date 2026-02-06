import { InvalidPassportError } from '../errors/invalid-data.error';

/**
 * Дані паспорта (серія, номер, ким виданий, дата видачі).
 */
export interface PassportDetailsProps {
  series: string | null;
  number: string;
  issuedBy: string;
  issuedDate: Date;
}

/**
 * Value Object для паспортних даних.
 */
export class PassportDetails {
  private constructor(private readonly props: PassportDetailsProps) {}

  /**
   * Створює об'єкт паспортних даних з валідацією.
   */
  static create(props: PassportDetailsProps): PassportDetails {
    if (!props.number?.trim()) {
      throw new InvalidPassportError('номер не може бути порожнім');
    }

    if (!props.issuedBy?.trim()) {
      throw new InvalidPassportError('поле "ким виданий" не може бути порожнім');
    }

    if (props.issuedDate > new Date()) {
      throw new InvalidPassportError('дата видачі не може бути в майбутньому');
    }

    return new PassportDetails({
      series: props.series?.trim() || null,
      number: props.number.trim(),
      issuedBy: props.issuedBy.trim(),
      issuedDate: props.issuedDate,
    });
  }

  get series(): string | null { return this.props.series; }
  get number(): string { return this.props.number; }
  get issuedBy(): string { return this.props.issuedBy; }
  get issuedDate(): Date { return this.props.issuedDate; }

  /**
   * Повертає строкове представлення паспорта.
   */
  toString(): string {
    const seriesStr = this.props.series ? `${this.props.series} ` : '';
    return `${seriesStr}${this.props.number}`;
  }

  equals(other: PassportDetails): boolean {
    return (
      this.props.series === other.series &&
      this.props.number === other.number &&
      this.props.issuedBy === other.issuedBy &&
      this.props.issuedDate.getTime() === other.issuedDate.getTime()
    );
  }
}
