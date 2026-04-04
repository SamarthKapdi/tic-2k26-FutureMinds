const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
  console.log(' Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error(' Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Execute a query with optional parameters
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(' Query:', { text: text.substring(0, 80), duration: `${duration}ms`, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error(' Query error:', { text: text.substring(0, 80), error: error.message });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);

  const timeout = setTimeout(() => {
    console.error(' Client has been checked out for too long!');
  }, 5000);

  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease();
  };

  return client;
};

/**
 * Initialize database with PostGIS and schema
 */
const initializeDatabase = async () => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Enable PostGIS
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255),
        phone VARCHAR(20) UNIQUE,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        avatar_url TEXT,
        location GEOGRAPHY(Point, 4326),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Migrations for existing DBs
    await client.query('ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);').catch(() => {});
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE email IS NOT NULL;').catch(() => {});

    // User settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        alert_radius_km INTEGER DEFAULT 25,
        blood_alerts BOOLEAN DEFAULT true,
        missing_alerts BOOLEAN DEFAULT true,
        fund_alerts BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // OTP table
    await client.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        phone VARCHAR(20) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_used BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Admin table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Blood donors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blood_donors (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blood_group VARCHAR(5) NOT NULL,
        location GEOGRAPHY(Point, 4326) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        is_available BOOLEAN DEFAULT true,
        last_donation_date DATE,
        total_donations INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Blood requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blood_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        patient_name VARCHAR(255) NOT NULL,
        blood_group VARCHAR(5) NOT NULL,
        units_needed INTEGER DEFAULT 1,
        urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('critical', 'urgent', 'normal')),
        hospital_name VARCHAR(255),
        hospital_address TEXT,
        location GEOGRAPHY(Point, 4326),
        city VARCHAR(100),
        contact_number VARCHAR(20),
        description TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled', 'expired')),
        fulfilled_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Blood responses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blood_responses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        request_id UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
        donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Fund categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS fund_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Fund campaigns table
    await client.query(`
      CREATE TABLE IF NOT EXISTS fund_campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id UUID REFERENCES fund_categories(id),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        target_amount DECIMAL(12,2) NOT NULL,
        raised_amount DECIMAL(12,2) DEFAULT 0,
        image_url TEXT,
        documents_url TEXT[],
        is_verified BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'suspended')),
        urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('critical', 'urgent', 'normal')),
        end_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Fund transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS fund_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        campaign_id UUID NOT NULL REFERENCES fund_campaigns(id) ON DELETE CASCADE,
        donor_id UUID REFERENCES users(id),
        amount DECIMAL(12,2) NOT NULL,
        payment_method VARCHAR(50),
        cashfree_order_id VARCHAR(255),
        cashfree_payment_id VARCHAR(255),
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
        donor_name VARCHAR(255),
        donor_email VARCHAR(255),
        donor_phone VARCHAR(20),
        is_anonymous BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Missing persons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS missing_persons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        age INTEGER,
        gender VARCHAR(20),
        description TEXT,
        image_url TEXT,
        last_seen_location GEOGRAPHY(Point, 4326),
        last_seen_address TEXT,
        last_seen_date TIMESTAMP WITH TIME ZONE,
        city VARCHAR(100),
        contact_number VARCHAR(20),
        status VARCHAR(20) DEFAULT 'missing' CHECK (status IN ('missing', 'found', 'closed')),
        urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('critical', 'urgent', 'normal')),
        unique_identifiers TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Missing sightings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS missing_sightings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        missing_person_id UUID NOT NULL REFERENCES missing_persons(id) ON DELETE CASCADE,
        reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        location GEOGRAPHY(Point, 4326),
        address TEXT,
        description TEXT,
        image_url TEXT,
        sighting_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Reports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('blood_request', 'campaign', 'missing_person', 'user', 'other')),
        target_id UUID,
        reason TEXT NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
        admin_notes TEXT,
        resolved_by UUID REFERENCES admins(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Verification requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        document_url TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        admin_notes TEXT,
        reviewed_by UUID REFERENCES admins(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(location);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_blood_donors_location ON blood_donors USING GIST(location);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_blood_donors_blood_group ON blood_donors(blood_group);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_blood_requests_location ON blood_requests USING GIST(location);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_blood_requests_urgency ON blood_requests(urgency);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_fund_campaigns_status ON fund_campaigns(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_fund_transactions_status ON fund_transactions(payment_status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_missing_persons_location ON missing_persons USING GIST(last_seen_location);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_missing_persons_status ON missing_persons(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_otps_phone ON otps(phone);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);');

    // Seed default fund categories
    await client.query(`
      INSERT INTO fund_categories (name, description, icon)
      VALUES 
        ('Medical Emergency', 'Help fund medical treatments and surgeries', 'heart-pulse'),
        ('Education', 'Support education for underprivileged children', 'graduation-cap'),
        ('Disaster Relief', 'Aid for natural disaster victims', 'cloud-lightning'),
        ('Animal Welfare', 'Help animals in need', 'paw-print'),
        ('Community Development', 'Support community growth projects', 'users'),
        ('Elder Care', 'Help elderly people with basic needs', 'hand-heart')
      ON CONFLICT DO NOTHING;
    `);

    // Seed default admin
    const bcrypt = require('bcryptjs');
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    await client.query(`
      INSERT INTO admins (name, email, password_hash, role)
      VALUES ('Super Admin', 'admin@sahyog.org', $1, 'super_admin')
      ON CONFLICT (email) DO NOTHING;
    `, [adminPasswordHash]);

    await client.query('COMMIT');
    console.log('Database schema initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(' Database initialization error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { pool, query, getClient, initializeDatabase };
