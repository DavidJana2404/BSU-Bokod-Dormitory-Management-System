# Password Validation Requirements

## Updated Password Requirements

The password validation has been **lightened** to remove the special character requirement. 

### Current Requirements:
✅ **Minimum 8 characters**
✅ **At least one lowercase letter (a-z)**
✅ **At least one uppercase letter (A-Z)**
✅ **At least one number (0-9)**
❌ ~~Special characters (removed)~~

### Example Valid Passwords:
- `Password123`
- `Test123abc`
- `MyPass1word`
- `Hello123World`
- `SimplePass123`

### Example Invalid Passwords:
- `password` (no uppercase or numbers)
- `PASSWORD` (no lowercase or numbers)
- `12345678` (no letters)
- `Pass123` (too short - less than 8 characters)
- `password123` (no uppercase)
- `PASSWORD123` (no lowercase)
- `PassWord` (no numbers)

## Files Updated:

### Backend Changes:
1. **`app/Providers/AppServiceProvider.php`** - Global password rule configuration
2. **`app/Http/Requests/StudentFormRequest.php`** - Student form password validation
3. **`resources/js/utils/validation.ts`** - Client-side password validation

### Controllers Using Updated Rules:
- `app/Http/Controllers/Auth/RegisteredUserController.php`
- `app/Http/Controllers/Auth/NewPasswordController.php`
- `app/Http/Controllers/Settings/PasswordController.php`
- `app/Http/Controllers/Student/Settings/PasswordController.php`

All password fields across the application now use these lighter requirements automatically.

## Testing:
Comprehensive tests have been added to verify the password validation works correctly:
- `tests/Feature/PasswordValidationTest.php`

All tests pass successfully! ✅