import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'
import { DIAGNOSE_SYSTEM_PROMPT } from '@/lib/anthropic/diagnose'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { error_code, description } = await req.json()

  const { data: kbEntry } = await supabase
    .from('knowledge_base')
    .select('*')
    .or(`error_code.ilike.%${error_code}%,title.ilike.%${error_code}%`)
    .eq('is_public', true)
    .limit(1)
    .single()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      if (kbEntry) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ kb_match: kbEntry })}\n\n`))
      }

      const aiStream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: DIAGNOSE_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Diagnostique cette erreur:\nCode: ${error_code}\nDescription: ${description || 'non fournie'}\n\n${kbEntry ? `Fiche connue en base:\n${JSON.stringify(kbEntry, null, 2)}` : 'Aucune fiche en base pour ce code.'}`
          }
        ]
      })

      let fullResponse = ''
      for await (const chunk of aiStream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          fullResponse += chunk.delta.text
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: chunk.delta.text })}\n\n`))
        }
      }

      if (!kbEntry) {
        try {
          const parsed = JSON.parse(fullResponse)
          await supabase.from('knowledge_base').insert({
            error_code: parsed.error_code || error_code,
            title: parsed.title || error_code,
            description: parsed.description || '',
            cause: parsed.cause || '',
            fix: parsed.fix || '',
            format: parsed.format || 'INCONNU',
            created_by: user.id,
            is_public: false,
          })
        } catch {}
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}
