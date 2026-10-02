/**
 * TruthGuard AI - OpenAPI 3.1 Specification Definition
 * Machine-readable API schema for automated documentation and client SDK generation.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export const truthGuardOpenApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'TruthGuard AI Fact Checking & Misinformation Detection API',
    version: '2.1.0',
    description: 'High-performance AI and heuristics pipeline for real-time verification of online claims, sensationalism detection, and source credibility scoring.',
    contact: {
      name: 'Yunis Al-Afeef',
      email: 'shoeabvv@gmail.com',
      url: 'https://github.com/yunis-alafeef/TruthGuard-AI'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'https://truthguard-ai.api',
      description: 'Production API Gateway'
    }
  ],
  paths: {
    '/api/verify': {
      post: {
        summary: 'Verify a factual claim',
        description: 'Analyzes a single claim through web grounding, sensationalism index, and confidence matrix.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['claim'],
                properties: {
                  claim: {
                    type: 'string',
                    example: 'الماء يغلي عند 100 درجة مئوية تحت الضغط القياسي'
                  },
                  language: {
                    type: 'string',
                    enum: ['ar', 'en', 'auto'],
                    default: 'auto'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Verification report with verdict, confidence matrix, and sources.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    claim: { type: 'string' },
                    verdict: { type: 'string', enum: ['true', 'mostly_true', 'half_true', 'mostly_false', 'false', 'unproven'] },
                    confidenceScore: { type: 'number', minimum: 0, maximum: 100 },
                    sensationalism: { type: 'object' },
                    matrix: { type: 'object' },
                    sources: { type: 'array' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/badge/{verdict}/{score}': {
      get: {
        summary: 'Generate dynamic SVG verification badge',
        parameters: [
          { name: 'verdict', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'score', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': {
            description: 'SVG badge image',
            content: {
              'image/svg+xml': {
                schema: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
};
