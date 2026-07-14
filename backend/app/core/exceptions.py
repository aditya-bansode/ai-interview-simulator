from fastapi import Request, status
from fastapi.responses import JSONResponse

class APIException(Exception):
    """Base exception class for application-level API errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, details: any = None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)

class UserAlreadyExistsException(APIException):
    def __init__(self, message: str = "A user with this email already exists."):
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)

class CredentialsException(APIException):
    def __init__(self, message: str = "Could not validate credentials."):
        super().__init__(message, status_code=status.HTTP_401_UNAUTHORIZED, details={"code": "INVALID_CREDENTIALS"})

class TokenExpiredException(APIException):
    def __init__(self, message: str = "Session token has expired."):
        super().__init__(message, status_code=status.HTTP_401_UNAUTHORIZED, details={"code": "TOKEN_EXPIRED"})

class NotFoundException(APIException):
    def __init__(self, message: str = "Resource not found."):
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND)

class ValidationException(APIException):
    def __init__(self, message: str = "Validation error.", details: any = None):
        super().__init__(message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, details=details)

async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
    """
    Global exception handler for custom APIException classes.
    """
    response_content = {"detail": exc.message}
    if exc.details:
        response_content.update(exc.details)
        
    return JSONResponse(
        status_code=exc.status_code,
        content=response_content
    )
