import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helpers
export const db = {
  // User operations
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  },

  async createUserProfile(user) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: user.uid,
        email: user.email,
        display_name: user.displayName || user.email.split('@')[0],
        emergency_contact: '',
        stats: { total_points: 0 }
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    return data;
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    return data;
  },

  async incrementUserPoints(userId, points) {
    const { data, error } = await supabase.rpc('increment_user_points', {
      user_id: userId,
      points_to_add: points
    });

    if (error) {
      console.error('Error incrementing points:', error);
      return null;
    }
    return data;
  },

  // Journal operations
  async createJournal(entry) {
    const { data, error } = await supabase
      .from('journals')
      .insert([entry])
      .select()
      .single();

    if (error) {
      console.error('Error creating journal:', error);
      return null;
    }
    return data;
  },

  async getJournals(userId, type = null) {
    let query = supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching journals:', error);
      return [];
    }
    return data;
  },

  async deleteJournal(journalId) {
    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('id', journalId);

    if (error) {
      console.error('Error deleting journal:', error);
      return false;
    }
    return true;
  },

  // Document operations
  async createDocument(doc) {
    const { data, error } = await supabase
      .from('documents')
      .insert([doc])
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      return null;
    }
    return data;
  },

  async getDocuments(userId, category = null) {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    return data;
  },

  async updateDocument(docId, updates) {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', docId)
      .select()
      .single();

    if (error) {
      console.error('Error updating document:', error);
      return null;
    }
    return data;
  },

  async deleteDocument(docId, fileUrl) {
    // Delete from storage first
    if (fileUrl) {
      const fileName = fileUrl.split('/').pop();
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([fileName]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId);

    if (error) {
      console.error('Error deleting document:', error);
      return false;
    }
    return true;
  },

  // Upload file to storage
  async uploadFile(userId, file, fileName) {
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Family tasks
  async createFamilyTask(task) {
    const { data, error } = await supabase
      .from('family_tasks')
      .insert([task])
      .select()
      .single();

    if (error) {
      console.error('Error creating family task:', error);
      return null;
    }
    return data;
  },

  async getFamilyTasks(groupId) {
    const { data, error } = await supabase
      .from('family_tasks')
      .select('*')
      .eq('family_group_id', groupId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching family tasks:', error);
      return [];
    }
    return data;
  },

  async updateTaskStatus(taskId, completed, updatedBy) {
    const { data, error } = await supabase
      .from('family_tasks')
      .update({ completed, updated_by: updatedBy })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return null;
    }
    return data;
  }
};

export default supabase;