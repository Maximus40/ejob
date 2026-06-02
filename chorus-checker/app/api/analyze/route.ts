import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'
import { ANALYZE_SYSTEM_PROMPT } from '@/lib/anthropic/analyze'
import { parsePesV2 } from '@/lib/parsers/pesv2'
import { parseChorusUbl } from '@/lib/parsers/chorus-ubl'
import { parseCsvFlat } from '@/lib/parsers/csv-flat'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  let content = ''
  let filename = 'unknown'

  const contentType = req.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (file) {
      content = await file.text()
      filename = file.name
    }
  } else {
    const body = await req.json()
    content = body.content || ''
    filename = body.filename || 'paste'
  }

  if (!content) {
    return new Response('No content provided', { status: 400 })
  }

  let parseResult
  if (content.includes('PES_Aller') || content.includes('CommunicationEchange') || content.includes('BlocBudget')) {
    parseResult = parsePesV2(content)
  } else if (content.includes('ubl:Invoice') || content.includes('rsm:CrossIndustryInvoice') || content.includes('cbc:InvoiceTypeCode')) {
    parseResult = parseChorusUbl(content)
  } else if (content.includes(',') || content.includes(';')) {
    parseResult = parseCsvFlat(content)
  } else {
    parseResult = { format: 'INCONNU' as const, preview: content.slice(0, 500), metadata: {}, staticErrors: [] }
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const aiStream = await anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: ANALYZE_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Analyse ce flux (format détecté: ${parseResult.format}):\n\nFichier: ${filename}\n\nContenu (extrait):\n${content.slice(0, 3000)}\n\nErreurs statiques déjà détectées:\n${JSON.stringify(parseResult.staticErrors, null, 2)}`
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

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

          let parsed: Record<string, unknown> = {}
          try {
            parsed = JSON.parse(fullResponse)
          } catch {}

          const { data: analysis } = await supabase.from('analyses').insert({
            organization_id: profile?.organization_id,
            user_id: user.id,
            file_name: filename,
            file_size: content.length,
            format_detected: (parsed.format_detected as string) || parseResult.format,
            content_preview: content.slice(0, 500),
            is_valid: (parsed.is_valid as boolean) ?? false,
            error_count: Array.isArray(parsed.errors) ? (parsed.errors as unknown[]).filter((e: unknown) => (e as {severity: string}).severity === 'error').length : 0,
            warning_count: Array.isArray(parsed.errors) ? (parsed.errors as unknown[]).filter((e: unknown) => (e as {severity: string}).severity === 'warning').length : 0,
            ai_summary: (parsed.summary as string) || '',
            ai_diagnosis: (parsed.ai_diagnosis as string) || '',
          }).select().single()

          if (analysis && Array.isArray(parsed.errors)) {
            const errorsToInsert = (parsed.errors as Array<{
              severity: string
              code?: string
              title: string
              description: string
              location?: string
              fix?: string
              responsibility?: string
            }>).map(e => ({
              analysis_id: analysis.id,
              severity: e.severity,
              code: e.code || null,
              title: e.title,
              description: e.description,
              location: e.location || null,
              fix_suggestion: e.fix || null,
              responsibility: e.responsibility || 'INCONNU',
            }))
            await supabase.from('analysis_errors').insert(errorsToInsert)
          }
        } catch (dbErr) {
          console.error('DB save error:', dbErr)
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
        controller.close()
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`))
        controller.close()
      }
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
