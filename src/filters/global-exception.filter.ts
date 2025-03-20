import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
@Injectable()
export class AppExceptionFilter implements ExceptionFilter {
  constructor() {}
  //fix
  async catch(exception: any, host: ArgumentsHost) {
    console.log('Handling exception...', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const lang = ctx.getRequest().lang || 'en';
    console.log(lang);
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception.status;

    let errorMessage = 'Something went wrong😢! Contact Support';
    let errorDetails = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse.hasOwnProperty('message')
      ) {
        errorMessage = exceptionResponse['message'];
        errorDetails = exceptionResponse;
      }

      // Handle validation errors specifically
      if (status === HttpStatus.BAD_REQUEST && Array.isArray(errorMessage)) {
        errorMessage = errorMessage.join(', '); // Join multiple validation messages
      }

      switch (status) {
        case HttpStatus.BAD_REQUEST:
          errorMessage = errorMessage || 'Bad request';
          break;
        case HttpStatus.UNAUTHORIZED:
          errorMessage = errorMessage || 'Unauthorized access';
          break;
        case HttpStatus.FORBIDDEN:
          errorMessage = errorMessage || 'Forbidden';
          break;
        case HttpStatus.NOT_FOUND:
          errorMessage = errorMessage || 'Resource not found';
          break;
        case HttpStatus.CONFLICT:
          errorMessage = errorMessage || 'Conflict occurred';
          break;
        default:
          errorMessage = errorMessage || 'An error occurred';
          break;
      }
    }

    // rollbar.error(exception, {
    //   custom: {
    //     project: 'kwik-ride',
    //     environment: process.env.NODE_ENV || 'development',
    //     statusCode: status,
    //     errorDetails,
    //     errorMessage,
    //   },
    // });
    response.status(status ?? 500).json({
      success: false,
      message: errorMessage,
    });
  }
}