import { BadGatewayException, Injectable, Logger } from '@nestjs/common'
import OpenAI from 'openai'
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions'

type JsonSchemaSpec = NonNullable<
  Extract<
    ChatCompletionCreateParamsNonStreaming['response_format'],
    { type: 'json_schema' }
  >['json_schema']
>

interface ParseJsonInput {
  system: string
  user: string
  schema: JsonSchemaSpec
  model?: string
  temperature?: number
}

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name)
  private readonly client: OpenAI | null
  private readonly defaultModel: string

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    this.client = apiKey ? new OpenAI({ apiKey }) : null
    this.defaultModel = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
  }

  async parseJson<T>({ system, user, schema, model, temperature = 0 }: ParseJsonInput): Promise<T> {
    if (!this.client) {
      throw new BadGatewayException('OPENAI_API_KEY is not configured on the server.')
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: model ?? this.defaultModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_schema', json_schema: schema },
        temperature,
      })
      const content = completion.choices[0]?.message?.content
      if (!content) throw new Error('Empty response from OpenAI.')
      return JSON.parse(content) as T
    } catch (err) {
      this.logger.error(`OpenAI parseJson failed (schema: ${schema.name})`, err as Error)
      throw new BadGatewayException("Couldn't understand that query, please rephrase.")
    }
  }
}
