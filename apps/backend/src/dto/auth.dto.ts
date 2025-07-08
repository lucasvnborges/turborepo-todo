import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @ApiProperty({ example: 'lucas@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'Lucas Borg' })
  @IsString()
  name: string

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string
}

export class LoginDto {
  @ApiProperty({ example: 'lucas@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string
}

export class AuthResponseDto {
  @ApiProperty()
  access_token: string

  @ApiProperty()
  user: {
    id: number
    email: string
    name: string
  }
}
