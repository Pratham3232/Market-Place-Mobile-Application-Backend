export interface LLMProvider {
  name: string;
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
  supportedModels: string[];
}

export interface LLMConfig {
  openai?: LLMProvider;
  anthropic?: LLMProvider;
  google?: LLMProvider;
  defaultProvider: string;
}

export const LLM_CONFIG: LLMConfig = {
  openai: {
    name: 'OpenAI',
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-3.5-turbo',
    supportedModels: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo']
  },
  anthropic: {
    name: 'Anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-sonnet-20240229',
    supportedModels: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
  },
  defaultProvider: 'openai'
};