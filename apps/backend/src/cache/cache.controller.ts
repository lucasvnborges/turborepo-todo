import {
  Controller,
  Get,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { User } from '../entities/user.entity'
import { RedisService } from './redis.service'

@ApiTags('cache')
@Controller('todos/cache')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CacheController {
  constructor(private readonly redisService: RedisService) {}

  @Get('status')
  @ApiOperation({ 
    summary: 'Verificar status do cache do usuário',
    description: 'Retorna informações sobre o cache das tarefas do usuário logado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Status do cache retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
        cacheKey: { type: 'string', example: 'todos:user:1' },
        hasCachedData: { type: 'boolean', example: true },
        cachedItemsCount: { type: 'number', example: 5 },
        timestamp: { type: 'string', example: '2024-01-01T12:00:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getCacheStatus(@Request() req: { user: User }) {
    const cacheKey = `todos:user:${req.user.id}`
    const cachedData = await this.redisService.get(cacheKey)
    
    return {
      userId: req.user.id,
      cacheKey,
      hasCachedData: !!cachedData,
      cachedItemsCount: cachedData ? JSON.parse(cachedData).length : 0,
      timestamp: new Date().toISOString(),
    }
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Estatísticas do cache Redis',
    description: 'Retorna métricas de performance do cache (hits, misses, taxa de acerto)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estatísticas do cache retornadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        hits: { type: 'number', example: 45 },
        misses: { type: 'number', example: 15 },
        errors: { type: 'number', example: 0 },
        hitRate: { type: 'string', example: '75.00%' },
        total: { type: 'number', example: 60 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getCacheStats() {
    return this.redisService.getStats()
  }

  @Delete('clear')
  @ApiOperation({ 
    summary: 'Limpar cache do usuário',
    description: 'Remove os dados em cache das tarefas do usuário logado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cache limpo com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Cache limpo com sucesso' },
        userId: { type: 'number', example: 1 },
        timestamp: { type: 'string', example: '2024-01-01T12:00:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async clearCache(@Request() req: { user: User }) {
    const cacheKey = `todos:user:${req.user.id}`
    await this.redisService.del(cacheKey)
    
    return {
      message: 'Cache limpo com sucesso',
      userId: req.user.id,
      timestamp: new Date().toISOString(),
    }
  }
} 