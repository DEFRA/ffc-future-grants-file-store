DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ffc_future_grants_file_store') THEN
    CREATE TABLE ffc_future_grants_file_store (
      file_data_id serial PRIMARY KEY,
      file_name VARCHAR(255),
      file_size BIGINT,
      file_type VARCHAR(50),
      category VARCHAR(50),
      user_ID INT,
      business_ID INT,
      case_ID INT,
      grant_scheme VARCHAR(50),
      grant_sub_scheme VARCHAR(50),
      grant_theme VARCHAR(50),
      date_time TIMESTAMPTZ,
      storage_url TEXT
    );
  END IF;
END $$;
