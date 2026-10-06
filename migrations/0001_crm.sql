PRAGMA foreign_keys = ON;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  managed_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX users_managed_by ON users(managed_by);
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 200),
  website TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  segment TEXT NOT NULL DEFAULT 'SMB',
  stage TEXT NOT NULL DEFAULT 'New Logo',
  pipeline_value REAL NOT NULL DEFAULT 0 CHECK(pipeline_value >= 0),
  win_probability INTEGER NOT NULL DEFAULT 0 CHECK(win_probability BETWEEN 0 AND 100),
  owner_id TEXT NOT NULL REFERENCES users(id),
  logo_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  archived_at TEXT
);
CREATE INDEX companies_account_pipeline ON companies(account_id, archived_at, pipeline_value DESC);
CREATE INDEX companies_account_name ON companies(account_id, archived_at, name COLLATE NOCASE);
CREATE INDEX companies_account_stage ON companies(account_id, archived_at, stage);
CREATE INDEX companies_account_owner ON companies(account_id, archived_at, owner_id);
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  x_url TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(id, company_id)
);
CREATE INDEX contacts_company_name ON contacts(company_id, full_name);
CREATE TABLE opportunities (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Discovery',
  value REAL NOT NULL DEFAULT 0 CHECK(value >= 0),
  probability INTEGER NOT NULL DEFAULT 0 CHECK(probability BETWEEN 0 AND 100),
  expected_close_date TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','won','lost')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX opportunities_company_status ON opportunities(company_id, status, expected_close_date);
CREATE TABLE interactions (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK(type IN ('email','call','linkedin','x','meeting','note','demo','follow-up','other')),
  subject TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX interactions_company_date ON interactions(company_id, occurred_at DESC);
CREATE INDEX interactions_contact_date ON interactions(contact_id, occurred_at DESC);
CREATE INDEX interactions_user ON interactions(user_id);
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  assigned_to TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_at TEXT,
  completed_at TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX tasks_company_due ON tasks(company_id, completed_at, due_at);
CREATE INDEX tasks_assigned_due ON tasks(assigned_to, completed_at, due_at);
CREATE INDEX tasks_contact ON tasks(contact_id);
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  UNIQUE(account_id, name)
);
CREATE TABLE company_tags (
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(company_id, tag_id)
);
CREATE INDEX company_tags_tag ON company_tags(tag_id, company_id);
CREATE TABLE notification_reads (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  read_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY(user_id, task_id)
);
-- Keep all related links in the same company, including direct SQL writes.
CREATE TRIGGER interactions_contact_insert BEFORE INSERT ON interactions WHEN NEW.contact_id IS NOT NULL
BEGIN SELECT RAISE(ABORT, 'Contact must belong to company') WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE id=NEW.contact_id AND company_id=NEW.company_id); END;
CREATE TRIGGER interactions_contact_update BEFORE UPDATE OF contact_id, company_id ON interactions WHEN NEW.contact_id IS NOT NULL
BEGIN SELECT RAISE(ABORT, 'Contact must belong to company') WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE id=NEW.contact_id AND company_id=NEW.company_id); END;
CREATE TRIGGER tasks_contact_insert BEFORE INSERT ON tasks WHEN NEW.contact_id IS NOT NULL
BEGIN SELECT RAISE(ABORT, 'Contact must belong to company') WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE id=NEW.contact_id AND company_id=NEW.company_id); END;
CREATE TRIGGER tasks_contact_update BEFORE UPDATE OF contact_id, company_id ON tasks WHEN NEW.contact_id IS NOT NULL
BEGIN SELECT RAISE(ABORT, 'Contact must belong to company') WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE id=NEW.contact_id AND company_id=NEW.company_id); END;
-- Pipeline totals are maintained atomically with the deal mutation.
CREATE TRIGGER opportunity_insert AFTER INSERT ON opportunities BEGIN
 UPDATE companies SET pipeline_value=(SELECT COALESCE(SUM(value),0) FROM opportunities WHERE company_id=NEW.company_id AND status='open'),
 win_probability=(SELECT COALESCE(ROUND(SUM(value*probability)/NULLIF(SUM(value),0)),ROUND(AVG(probability)),0) FROM opportunities WHERE company_id=NEW.company_id AND status='open'),
 updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=NEW.company_id;
END;
CREATE TRIGGER opportunity_update AFTER UPDATE ON opportunities BEGIN
 UPDATE companies SET pipeline_value=(SELECT COALESCE(SUM(value),0) FROM opportunities WHERE company_id=NEW.company_id AND status='open'),
 win_probability=(SELECT COALESCE(ROUND(SUM(value*probability)/NULLIF(SUM(value),0)),ROUND(AVG(probability)),0) FROM opportunities WHERE company_id=NEW.company_id AND status='open'),
 updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=NEW.company_id;
END;
CREATE TRIGGER opportunity_delete AFTER DELETE ON opportunities BEGIN
 UPDATE companies SET pipeline_value=(SELECT COALESCE(SUM(value),0) FROM opportunities WHERE company_id=OLD.company_id AND status='open'),
 win_probability=(SELECT COALESCE(ROUND(SUM(value*probability)/NULLIF(SUM(value),0)),ROUND(AVG(probability)),0) FROM opportunities WHERE company_id=OLD.company_id AND status='open'),
 updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=OLD.company_id;
END;
