CREATE TABLE analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations ON DELETE CASCADE,
  user_id uuid REFERENCES profiles ON DELETE SET NULL,
  file_name text,
  file_size integer,
  format_detected text CHECK (format_detected IN ('PESV2', 'CHORUS_UBL', 'CSV', 'ERROR_CODE', 'INCONNU')),
  content_preview text,
  is_valid boolean,
  error_count integer DEFAULT 0,
  warning_count integer DEFAULT 0,
  ai_summary text,
  ai_diagnosis text,
  created_at timestamptz DEFAULT now()
);
