import { IsEmail, IsOptional, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(3)
    username!: string;

    @IsString()
    @MinLength(8)
    password!: string;

    @IsString()
    firstName!: string;

    @IsString()
    lastName!: string;

    @IsOptional()
    @IsString()
    phone?: string;
}

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    identifier!: string; // Can be email or username

    @IsString()
    @IsNotEmpty()
    password!: string;
}

export class TokenDto {
    @IsEmail()
    email!: string;

    @IsString()
    token!: string;
}

export class ForgotPasswordDto {
    @IsEmail()
    email!: string;
}

export class ResetPasswordDto extends TokenDto {
    @IsString()
    @MinLength(8)
    password!: string;
}
