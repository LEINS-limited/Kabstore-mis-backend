import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class EnumValidationPipe<T> implements PipeTransform<string> {
  constructor(private readonly enumType: T) {}

  transform(value: string): string {
    const isValid = Object.values(this.enumType).includes(value);
    if (!isValid) {
      throw new BadRequestException(
        `Invalid value. Must be one of: ${Object.values(this.enumType).join(', ')}`
      );
    }
    return value;
  }
} 