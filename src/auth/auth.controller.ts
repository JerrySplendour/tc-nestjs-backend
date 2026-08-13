import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto, TokenDto } from './auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto);
    }

    @Post('verify-email')
    verify(@Body() dto: TokenDto) {
        return this.auth.verify(dto);
    }

    @Post('forgot-password')
    forgot(@Body() dto: ForgotPasswordDto) {
        return this.auth.forgot(dto);
    }

    @Post('reset-password')
    reset(@Body() dto: ResetPasswordDto) {
        return this.auth.reset(dto);
    }
}
