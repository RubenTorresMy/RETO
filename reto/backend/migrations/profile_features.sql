ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS rol VARCHAR(20) NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS password VARCHAR(255);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'usuario'
      AND constraint_name = 'usuario_rol_check'
  ) THEN
    ALTER TABLE usuario
      ADD CONSTRAINT usuario_rol_check CHECK (rol IN ('user', 'worker'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS diseno_favorito (
  id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_diseno INT NOT NULL REFERENCES diseno(id_diseno) ON DELETE CASCADE,
  fecha_guardado TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_usuario, id_diseno)
);

CREATE TABLE IF NOT EXISTS diseno_like (
  id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_diseno INT NOT NULL REFERENCES diseno(id_diseno) ON DELETE CASCADE,
  fecha_like TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_usuario, id_diseno)
);
