// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: 'connected' | 'disconnected' | 'slow';
    cache: 'connected' | 'disconnected' | 'slow';
    external_apis: 'operational' | 'degraded' | 'down';
    file_storage: 'available' | 'unavailable' | 'limited';
  };
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  errors: string[];
  warnings: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const startTime = process.hrtime();
    
    // Simulate health checks
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Mock system metrics
    const memoryUsage = process.memoryUsage();
    const systemMemory = {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
    };

    // Simulate service checks
    const services = {
      database: 'connected' as const,
      cache: 'connected' as const,
      external_apis: 'operational' as const,
      file_storage: 'available' as const
    };

    // Check for warnings
    if (systemMemory.percentage > 80) {
      warnings.push('High memory usage detected');
    }

    // Determine overall status
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (errors.length > 0) {
      status = 'unhealthy';
    } else if (warnings.length > 0 || Object.values(services).some(s => s.includes('slow') || s.includes('degraded'))) {
      status = 'degraded';
    }

    const endTime = process.hrtime(startTime);
    const responseTime = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));

    const healthCheck: HealthCheck = {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      version: process.env.APP_VERSION || '1.0.0',
      services,
      system: {
        memory: systemMemory,
        cpu: {
          usage: Math.round(Math.random() * 50) // Mock CPU usage
        },
        disk: {
          used: 45, // GB - mock data
          total: 100, // GB - mock data
          percentage: 45
        }
      },
      errors,
      warnings
    };

    // Set appropriate HTTP status based on health
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    
    return res.status(httpStatus).json(healthCheck);
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}