import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ConflictException,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';

@Catch(MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception.code === 11000) {
      const keyValue = exception.keyValue;
      const key = Object.keys(keyValue)[0];
      const value = keyValue[key];

      response.status(409).json({
        statusCode: 409,
        message: `Duplicate key error: ${key} '${value}' already exists.`,
        error: 'Conflict',
      });
    } else {
      response.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }
}
