import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class LlmOperationsService {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  constructor() {
    if (!this.apiKey) {
      Logger.error('OPENAI_API_KEY is not set in environment variables');
    } else {
      Logger.log('OpenAI API Key is set');
    }
  }

  async getActivityPrice(request: any): Promise<any> {
    const apiKey = this.apiKey;
    const openai = new OpenAI({
      apiKey: apiKey
    });

    const activitiesList = request.activities.join(', ');
    const prompt = `For the following activities, provide the most common industry standard price (a single recommended value, not a range) in ${request.location}.
Format: Activity: Price (e.g., Yoga Class: $25 per class)
Activities: ${activitiesList}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const answer = response.choices[0].message?.content ?? '';

    // Simple parsing: split by lines and map to activity/price
    const prices = answer
      .split('\n')
      .map(line => {
        const [activity, ...priceParts] = line.split(':');
        return {
          activity: activity?.trim() ?? '',
          estimatedPrice: priceParts.join(':').trim() ?? ''
        };
      })
      .filter(item => item.activity && item.estimatedPrice);

    return prices || [];
  }

  async healthCheck() {
    return {
      success: true,
      message: 'LLM Operations service is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}
