import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { Repository } from 'typeorm'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { AuthService } from './auth.service'
import { User } from '../entities/user.entity'
import { RegisterDto, LoginDto } from '../dto/auth.dto'

describe('AuthService', () => {
  let authService: AuthService
  let userRepository: Repository<User>
  let jwtService: JwtService

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockJwtService = {
    sign: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    jwtService = module.get<JwtService>(JwtService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
      }

      mockUserRepository.findOne.mockResolvedValue(null)
      mockUserRepository.create.mockReturnValue(mockUser)
      mockUserRepository.save.mockResolvedValue(mockUser)
      mockJwtService.sign.mockReturnValue('jwt-token')

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never)

      const result = await authService.register(registerDto)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      })
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10)
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: 'hashedPassword',
        name: registerDto.name,
      })
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser)
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      })
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
      })
    })

    it('deve lançar ConflictException se o usuário já existir', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }

      mockUserRepository.findOne.mockResolvedValue({ id: 1 })

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      )
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      })
    })
  })

  describe('login', () => {
    it('deve fazer login do usuário com credenciais válidas', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
      }

      mockUserRepository.findOne.mockResolvedValue(mockUser)
      mockJwtService.sign.mockReturnValue('jwt-token')

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never)

      const result = await authService.login(loginDto)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      })
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      )
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      })
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
      })
    })

    it('deve lançar UnauthorizedException para credenciais inválidas', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      }

      mockUserRepository.findOne.mockResolvedValue(mockUser)
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never)

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  describe('validateUser', () => {
    it('deve retornar usuário sem senha', async () => {
      const userId = 1
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const result = await authService.validateUser(userId)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      })
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      })
      expect(result).not.toHaveProperty('password')
    })

    it('deve lançar UnauthorizedException se usuário não for encontrado', async () => {
      const userId = 999
      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(authService.validateUser(userId)).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })
})
