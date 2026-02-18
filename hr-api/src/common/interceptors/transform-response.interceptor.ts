/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  [x: string]: any;
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // If the response has already been formatted, restore it
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // For empty responses
        if (response.statusCode === 204) {
          response.statusCode = 200;
          return {
            success: true,
            data: null,
            message: this.getDefaultMessage(request.method, 204),
            timestamp: new Date().toISOString(),
          };
        }

        // for responses null || undifined
        if (data === null || data === undefined) {
          return {
            success: true,
            data: null,
            message: this.getDefaultMessage(
              request.method,
              response.statusCode,
            ),
            timestamp: new Date().toISOString(),
          };
        }

        // Standard format for successful responses
        return {
          success: true,
          data: data,
          message: this.getDefaultMessage(request.method, response.statusCode),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private getDefaultMessage(method: string, statusCode: number): string {
    const message: Record<string, Record<number, string>> = {
      GET: {
        200: 'Information received successfully',
      },
      POST: {
        201: 'Record created successfully',
      },
      PATCH: {
        200: 'Record updated successfully',
      },
      PUT: {
        200: 'Record updated successfully',
      },
      DELETE: {
        200: 'The record was successfully deleted',
        204: 'The record was successfully deleted',
      },
    };

    return message[method]?.[statusCode] || 'The operation was successful';
  }
}
