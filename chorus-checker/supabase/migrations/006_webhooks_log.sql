CREATE TABLE webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations ON DELETE CASCADE,
  source text DEFAULT 'manual' CHECK (source IN ('enovacom', 'useitflow', 'manual')),
  payload jsonb,
  parsed_error_code text,
  status text DEFAULT 'received',
  created_at timestamptz DEFAULT now()
);
