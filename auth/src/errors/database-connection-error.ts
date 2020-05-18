import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
    statusCode = 500;
    reason = 'database error';
    constructor(){
        super('error connecting db');
        
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    } 

    serializeErrors(){
        return [{message: this.reason}];
    }
}