import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseDto } from '../../auth/dto/response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    
    // Crear una respuesta en el formato estándar
    const responseDto = new ResponseDto();
    responseDto.isSuccess = false;
    
    // Extraer el mensaje de error
    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      responseDto.message = Array.isArray(exceptionResponse['message']) 
        ? exceptionResponse['message'][0] 
        : exceptionResponse['message'];
    } else {
      responseDto.message = exception.message;
    }

    response
      .status(status)
      .json(responseDto);
  }
}