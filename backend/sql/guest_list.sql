-- Matches DB schema: id, user_id, guest_name, contact_info, created_at

CREATE TABLE IF NOT EXISTS guest_list (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  guest_name VARCHAR(100) NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS guest_list_user_id_idx ON guest_list(user_id);
