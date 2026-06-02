CREATE TABLE analysis_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid REFERENCES analyses ON DELETE CASCADE,
  severity text CHECK (severity IN ('error', 'warning', 'info')),
  code text,
  title text,
  description text,
  location text,
  fix_suggestion text,
  responsibility text CHECK (responsibility IN ('ETABLISSEMENT', 'TDT', 'INCONNU'))
);
