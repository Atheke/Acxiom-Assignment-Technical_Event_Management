-- User → vendor message requests (vendor: Transaction → User Request).
-- Requires `users` and `vendors`; `vendors.user_id` must be UNIQUE so REFERENCES vendors(user_id) is valid.
-- If you already had an older `user_product_requests` with `product_id`, drop that column and align
-- constraints before applying this file, or recreate the table after backup.

CREATE TABLE IF NOT EXISTS user_product_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_id INTEGER NOT NULL REFERENCES vendors(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS user_product_requests_vendor_id_idx ON user_product_requests(vendor_id);
CREATE INDEX IF NOT EXISTS user_product_requests_user_id_idx ON user_product_requests(user_id);
