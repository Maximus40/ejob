import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { source = 'enovacom', content, establishment } = body

  const errorCodeMatch = content?.match(/\b(\d{5}|RSU_\w+|UTF8_\w+|XSD_\w+)\b/)
  const parsed_error_code = errorCodeMatch ? errorCodeMatch[1] : null

  let org_id = null
  if (establishment) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .ilike('name', `%${establishment}%`)
      .single()
    org_id = org?.id || null
  }

  await supabase.from('webhook_logs').insert({
    organization_id: org_id,
    source,
    payload: body,
    parsed_error_code,
    status: 'received',
  })

  return NextResponse.json({ ok: true })
}
