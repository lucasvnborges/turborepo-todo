import { Test, TestingModule } from '@nestjs/testing'
import { RedisService } from './redis.service'

// Mock do Redis
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  ping: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
  quit: jest.fn(),
}

// Mock da função createClient
jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedisClient),
}))

describe('RedisService', () => {
  let redisService: RedisService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile()

    redisService = module.get<RedisService>(RedisService)
    
    // Reset mocks
    jest.clearAllMocks()
  })

  describe('get', () => {
    it('deve retornar valor do cache quando a chave existe', async () => {
      const key = 'chave-teste'
      const value = 'valor-teste'
      
      mockRedisClient.get.mockResolvedValue(value)

      const result = await redisService.get(key)

      expect(mockRedisClient.get).toHaveBeenCalledWith(key)
      expect(result).toBe(value)
    })

    it('deve retornar null quando a chave não existe', async () => {
      const key = 'chave-inexistente'
      
      mockRedisClient.get.mockResolvedValue(null)

      const result = await redisService.get(key)

      expect(mockRedisClient.get).toHaveBeenCalledWith(key)
      expect(result).toBeNull()
    })
  })

  describe('del', () => {
    it('deve deletar chave com sucesso', async () => {
      const key = 'chave-teste'

      mockRedisClient.del.mockResolvedValue(1)

      await redisService.del(key)

      expect(mockRedisClient.del).toHaveBeenCalledWith(key)
    })
  })
})
