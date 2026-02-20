class AppError(Exception):
    """Base for all domain errors."""

    def __init__(self, message: str, code: str = "APP_ERROR"):
        self.message = message
        self.code = code
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, entity: str, identifier: str | int):
        super().__init__(f"{entity} not found: {identifier}", "NOT_FOUND")


class AlreadyExistsError(AppError):
    def __init__(self, entity: str, identifier: str | int):
        super().__init__(f"{entity} already exists: {identifier}", "ALREADY_EXISTS")


class InvalidCredentialsError(AppError):
    def __init__(self):
        super().__init__("Invalid credentials", "INVALID_CREDENTIALS")


class InactiveAccountError(AppError):
    def __init__(self):
        super().__init__("Account is inactive", "INACTIVE_ACCOUNT")


class PasswordResetRequiredError(AppError):
    def __init__(self):
        super().__init__("Password reset required", "PASSWORD_RESET_REQUIRED")


class PasswordResetNotRequiredError(AppError):
    def __init__(self):
        super().__init__("Password reset not required", "PASSWORD_RESET_NOT_REQUIRED")


class InvalidCurrentPasswordError(AppError):
    def __init__(self):
        super().__init__("Current password is incorrect", "INVALID_CURRENT_PASSWORD")


class AlreadyJoinedError(AppError):
    def __init__(self, session_id: int):
        super().__init__(f"Already joined session {session_id}", "ALREADY_JOINED")


class NotJoinedError(AppError):
    def __init__(self, session_id: int):
        super().__init__(f"Must join session {session_id} first", "NOT_JOINED")


class AlreadyPresentError(AppError):
    def __init__(self, session_id: int):
        super().__init__(
            f"Attendance already confirmed for session {session_id}", "ALREADY_PRESENT"
        )


class CodeWindowClosedError(AppError):
    def __init__(self, session_id: int):
        super().__init__(
            f"No active attendance code for session {session_id}", "CODE_WINDOW_CLOSED"
        )


class InvalidCodeError(AppError):
    def __init__(self):
        super().__init__("Invalid attendance code", "INVALID_CODE")


class CodeExpiredError(AppError):
    def __init__(self):
        super().__init__("Attendance code has expired", "CODE_EXPIRED")


class InvalidTokenError(AppError):
    def __init__(self, detail: str = "Invalid or expired token"):
        super().__init__(detail, "INVALID_TOKEN")


class PermissionDeniedError(AppError):
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(detail, "PERMISSION_DENIED")


class CSVImportError(AppError):
    def __init__(self, detail: str):
        super().__init__(detail, "CSV_IMPORT_ERROR")


class InvalidResetTokenError(AppError):
    def __init__(self):
        super().__init__("Invalid or expired reset token", "INVALID_RESET_TOKEN")
