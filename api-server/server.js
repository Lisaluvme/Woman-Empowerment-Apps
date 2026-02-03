/**
 * ============================================
 * WOMEN EMPOWERMENT SUPER APP LITE
 * Backend API Server - Firebase Auth + Supabase
 * ============================================
 * 
 * This server acts as a secure bridge between Firebase Authentication
 * and Supabase (Database + Storage + Realtime).
 * 
 * Architecture:
 * 1. Client sends Firebase ID token
 * 2. Server verifies token with Firebase Admin SDK
 * 3. Server extracts Firebase UID and passes to Supabase
 * 4. Server uses Supabase Service Role key for secure DB access
 * 5. All RLS policies use firebase_uid from request headers
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// FIREBASE ADMIN INITIALIZATION
// ============================================

// Initialize Firebase Admin
let firebaseAdmin;

try {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  firebaseAdmin = admin;
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error);
  process.exit(1);
}

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// FIREBASE TOKEN VERIFICATION MIDDLEWARE
// ============================================

/**
 * Verifies Firebase ID token and extracts user information
 * Sets request.firebaseUid and request.user for use in routes
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Set user info on request
    req.firebaseUid = decodedToken.uid;
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name || null,
      phoneNumber: decodedToken.phone_number || null
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Invalid or expired token',
      details: error.message 
    });
  }
};

/**
 * Sets Firebase UID in Supabase request context for RLS
 */
const setSupabaseContext = (req, res, next) => {
  // Set Firebase UID in local config for this request
  req.supabase = supabase;
  
  // This will be used by RLS policies via get_request_firebase_uid()
  req.supabaseConfig = {
    headers: {
      'X-Client-Info': 'supabase-js/2.x.x',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'X-Firebase-UID': req.firebaseUid // Custom header for RLS
    }
  };

  next();
};

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Women Empowerment Super App Lite API'
  });
});

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

/**
 * GET /api/user/profile
 * Get user profile
 */
app.get('/api/user/profile', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_by_firebase_uid', { 
        target_firebase_uid: req.firebaseUid 
      }, {
        headers: {
          ...req.supabaseConfig.headers,
          'X-Firebase-UID': req.firebaseUid
        }
      });

    if (error) throw error;

    if (!data) {
      // Create user profile if it doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          firebase_uid: req.firebaseUid,
          email: req.user.email,
          display_name: req.user.displayName || req.user.email.split('@')[0],
          phone: req.user.phoneNumber
        }])
        .select()
        .single();

      if (createError) throw createError;

      return res.json(newUser);
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * PUT /api/user/profile
 * Update user profile
 */
app.put('/api/user/profile', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.firebase_uid;
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('firebase_uid', req.firebaseUid)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============================================
// VAULT DOCUMENTS ROUTES
// ============================================

/**
 * GET /api/vault/documents
 * Get user's vault documents
 */
app.get('/api/vault/documents', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const { category } = req.query;

    let query = supabase
      .from('vault_documents')
      .select('*')
      .eq('firebase_uid', req.firebaseUid)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * POST /api/vault/documents
 * Create new vault document
 */
app.post('/api/vault/documents', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const document = {
      firebase_uid: req.firebaseUid,
      ...req.body
    };

    const { data, error } = await supabase
      .from('vault_documents')
      .insert([document])
      .select()
      .single();

    if (error) throw error;

    // Award points for adding document
    await supabase.rpc('increment_user_points', {
      target_firebase_uid: req.firebaseUid,
      points_to_add: 10
    });

    res.json(data);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * PUT /api/vault/documents/:id
 * Update vault document
 */
app.put('/api/vault/documents/:id', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('vault_documents')
      .update(updates)
      .eq('id', id)
      .eq('firebase_uid', req.firebaseUid)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * DELETE /api/vault/documents/:id
 * Delete vault document
 */
app.delete('/api/vault/documents/:id', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('vault_documents')
      .delete()
      .eq('id', id)
      .eq('firebase_uid', req.firebaseUid);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============================================
// JOURNAL ROUTES
// ============================================

/**
 * GET /api/journals
 * Get user's journals
 */
app.get('/api/journals', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const { type } = req.query;

    let query = supabase
      .from('journals')
      .select('*')
      .eq('firebase_uid', req.firebaseUid)
      .order('created_at', { ascending: false });

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching journals:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * POST /api/journals
 * Create new journal entry
 */
app.post('/api/journals', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const journal = {
      firebase_uid: req.firebaseUid,
      ...req.body
    };

    const { data, error } = await supabase
      .from('journals')
      .insert([journal])
      .select()
      .single();

    if (error) throw error;

    // Award points for journaling
    await supabase.rpc('increment_user_points', {
      target_firebase_uid: req.firebaseUid,
      points_to_add: 5
    });

    res.json(data);
  } catch (error) {
    console.error('Error creating journal:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * DELETE /api/journals/:id
 * Delete journal entry
 */
app.delete('/api/journals/:id', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('id', id)
      .eq('firebase_uid', req.firebaseUid);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============================================
// CAREER GOALS ROUTES
// ============================================

/**
 * GET /api/career/goals
 * Get user's career goals
 */
app.get('/api/career/goals', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('career_goals')
      .select('*')
      .eq('firebase_uid', req.firebaseUid)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching career goals:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * POST /api/career/goals
 * Create new career goal
 */
app.post('/api/career/goals', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const goal = {
      firebase_uid: req.firebaseUid,
      ...req.body
    };

    const { data, error } = await supabase
      .from('career_goals')
      .insert([goal])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error creating career goal:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * PUT /api/career/goals/:id
 * Update career goal
 */
app.put('/api/career/goals/:id', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('career_goals')
      .update(updates)
      .eq('id', id)
      .eq('firebase_uid', req.firebaseUid)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating career goal:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============================================
// SAFETY ROUTES
// ============================================

/**
 * GET /api/safety/contacts
 * Get trusted contacts
 */
app.get('/api/safety/contacts', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('firebase_uid', req.firebaseUid)
      .order('priority', { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * POST /api/safety/contacts
 * Add trusted contact
 */
app.post('/api/safety/contacts', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const contact = {
      firebase_uid: req.firebaseUid,
      ...req.body
    };

    const { data, error } = await supabase
      .from('trusted_contacts')
      .insert([contact])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * POST /api/safety/alerts
 * Create safety alert
 */
app.post('/api/safety/alerts', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const alert = {
      firebase_uid: req.firebaseUid,
      ...req.body
    };

    const { data, error } = await supabase
      .from('safety_alerts')
      .insert([alert])
      .select()
      .single();

    if (error) throw error;

    // TODO: Send notifications to trusted contacts
    // This would integrate with SMS/email service

    res.json(data);
  } catch (error) {
    console.error('Error creating safety alert:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============================================
// FAMILY COLLABORATION ROUTES
// ============================================

/**
 * GET /api/family/groups
 * Get user's family groups
 */
app.get('/api/family/groups', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('family_groups')
      .select(`
        *,
        family_members (
          firebase_uid,
          role,
          status
        )
      `)
      .or(`created_by_firebase_uid.eq.${req.firebaseUid},family_members.firebase_uid.eq.${req.firebaseUid}`);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching family groups:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * POST /api/family/groups
 * Create family group
 */
app.post('/api/family/groups', verifyFirebaseToken, setSupabaseContext, async (req, res) => {
  try {
    const group = {
      created_by_firebase_uid: req.firebaseUid,
      ...req.body
    };

    const { data, error } = await supabase
      .from('family_groups')
      .insert([group])
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin member
    await supabase.from('family_members').insert([{
      family_group_id: data.id,
      firebase_uid: req.firebaseUid,
      role: 'admin',
      status: 'active'
    }]);

    res.json(data);
  } catch (error) {
    console.error('Error creating family group:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 Women Empowerment Super App Lite API');
  console.log('=================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Firebase Auth: Enabled`);
  console.log(`✅ Supabase DB: Connected`);
  console.log('=================================\n');
});