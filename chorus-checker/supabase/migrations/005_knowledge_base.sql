CREATE TABLE knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_code text NOT NULL,
  title text,
  description text,
  cause text,
  fix text,
  format text,
  occurrences integer DEFAULT 1,
  last_seen timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles ON DELETE SET NULL,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
