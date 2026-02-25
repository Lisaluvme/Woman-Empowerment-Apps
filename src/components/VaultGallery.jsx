import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, supabase } from '../firebase-config';
import { Search, Filter, Plus, Grid, List, Trash2, Edit2, X, FolderOpen, Loader2, Download } from 'lucide-react';

// Helper function to get correct file URL
// Handles both old incorrect URLs (documents/documents/...) and new correct URLs
const getCorrectFileUrl = (fileUrl, supabaseInstance) => {
  if (!fileUrl) return null;
  
  // If URL already works or is not a supabase URL, return as-is
  if (!fileUrl.includes('supabase.co')) return fileUrl;
  
  // Extract the file path from the URL
  // URL format: https://xxx.supabase.co/storage/v1/object/public/documents/userId/filename.jpg
  // or incorrect: https://xxx.supabase.co/storage/v1/object/public/documents/documents/userId/filename.jpg
  
  try {
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    // pathParts: ['', 'storage', 'v1', 'object', 'public', 'documents', ...]
    
    // Find the bucket name index
    const bucketIndex = pathParts.findIndex((part, i) => 
      i > 4 && (part === 'documents' || part === 'vault_documents')
    );
    
    if (bucketIndex === -1) return fileUrl;
    
    // Get everything after the bucket name
    let filePathParts = pathParts.slice(bucketIndex + 1);
    
    // Check for doubled "documents" folder in path
    if (filePathParts[0] === 'documents') {
      // Remove the extra "documents" prefix
      filePathParts = filePathParts.slice(1);
    }
    
    const correctPath = filePathParts.join('/');
    
    // Reconstruct the URL
    const { data: { publicUrl } } = supabaseInstance.storage
      .from('documents')
      .getPublicUrl(correctPath);
    
    return publicUrl;
  } catch (e) {
    console.error('Error parsing file URL:', e);
    return fileUrl;
  }
};

const VaultGallery = ({ onOpenScanner }) => {
  const [user, authLoading] = useAuthState(auth);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load documents from Supabase
  useEffect(() => {
    // Wait for auth to finish loading before deciding what to do
    if (authLoading) {
      return; // Still loading auth, don't do anything yet
    }

    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchDocuments = async () => {
      try {
        console.log('📂 Fetching documents for user:', user.uid);
        
        const { data, error } = await supabase
          .from('vault_documents')
          .select('*')
          .eq('firebase_uid', user.uid)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error loading documents:', error);
          setDocuments([]);
        } else {
          console.log(`✅ Loaded ${data?.length || 0} documents:`, data);
          setDocuments(data || []);
        }
      } catch (err) {
        console.error('❌ Exception loading documents:', err);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();

    // Set up real-time subscription
    const channel = supabase
      .channel('vault_documents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vault_documents',
          filter: `firebase_uid=eq.${user.uid}`
        },
        (payload) => {
          console.log('📡 Real-time update received:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            console.log('➕ New document added:', payload.new);
            // Check if document already exists to avoid duplicates
            setDocuments(prev => {
              const exists = prev.some(doc => doc.id === payload.new.id);
              if (exists) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            console.log('➖ Document deleted:', payload.old);
            setDocuments(prev => prev.filter(doc => doc.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            console.log('📝 Document updated:', payload.new);
            setDocuments(prev => prev.map(doc => doc.id === payload.new.id ? payload.new : doc));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

  // Combined loading state - show loading if auth is loading OR documents are loading
  const isLoading = authLoading || loading;

  // Helper to extract correct file path for storage operations
  const extractFilePath = (fileUrl) => {
    if (!fileUrl || !fileUrl.includes('supabase.co')) return null;
    
    try {
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      
      // Find the bucket name index
      const bucketIndex = pathParts.findIndex((part, i) => 
        i > 4 && (part === 'documents' || part === 'vault_documents')
      );
      
      if (bucketIndex === -1) return null;
      
      // Get everything after the bucket name
      let filePathParts = pathParts.slice(bucketIndex + 1);
      
      // Check for doubled "documents" folder in path
      if (filePathParts[0] === 'documents') {
        // Remove the extra "documents" prefix
        filePathParts = filePathParts.slice(1);
      }
      
      return filePathParts.join('/');
    } catch (e) {
      console.error('Error extracting file path:', e);
      return null;
    }
  };

  const handleDeleteDocument = async (document) => {
    if (!confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }

    try {
      // Delete from Supabase Storage
      if (document.file_url) {
        // Extract correct file path (handles both old and new URL formats)
        const filePath = extractFilePath(document.file_url);
        if (filePath) {
          console.log('🗑️ Deleting file from storage:', filePath);
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([filePath]);

          if (storageError) {
            console.error('Error deleting from storage:', storageError);
          } else {
            console.log('✅ File deleted from storage');
          }
        }
      }

      // Delete from Supabase database
      const { error: dbError } = await supabase
        .from('vault_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) {
        throw dbError;
      }
      
      console.log('✅ Document metadata deleted from database');
      // Document will be automatically removed from state by the real-time subscription
      setSelectedDoc(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      // Use corrected URL for download
      const correctUrl = getCorrectFileUrl(doc.file_url, supabase);
      console.log('📥 Downloading from:', correctUrl);
      
      const response = await fetch(correctUrl);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const categories = [
    { id: 'all', label: 'All Documents', icon: '📁' },
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'career', label: 'Career', icon: '💼' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
    { id: 'legal', label: 'Legal', icon: '⚖️' },
    { id: 'medical', label: 'Medical', icon: '🏥' },
    { id: 'financial', label: 'Financial', icon: '💰' },
  ];

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : '📄';
  };

  return (
    <div className="px-5 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-bold mb-1">Document Vault</h2>
          <p className="text-sm text-gray-500 font-medium">{filteredDocs.length} documents stored</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-2xl transition-all duration-200 ${
              viewMode === 'grid' 
                ? 'glass-card-lavender shadow-lg' 
                : 'glass-card hover:shadow-md'
            }`}
          >
            <Grid size={20} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-2xl transition-all duration-200 ${
              viewMode === 'list' 
                ? 'glass-card-lavender shadow-lg' 
                : 'glass-card hover:shadow-md'
            }`}
          >
            <List size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents..."
          className="input-field-glass pl-12"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={48} className="animate-spin text-violet-600" />
        </div>
      )}

      {/* Filter Pills - 2 items per row for better text fit */}
      <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/60 backdrop-blur-sm border border-gray-100 hover:bg-white/80 hover:shadow-md text-gray-700'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-left">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid/List */}
      {!isLoading && (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-2 gap-4' 
          : 'space-y-4'
        }>
          {filteredDocs.map((doc, index) => (
            <div
              key={doc.id}
              className={`glass-card cursor-pointer hover:shadow-xl active:scale-95 transition-all duration-200 ${
                viewMode === 'grid' ? 'p-3' : 'p-4 flex items-center gap-4'
              } animate-fade-in-up`}
              style={{ animationDelay: `${0.2 + (index * 0.05)}s` }}
              onClick={() => setSelectedDoc(doc)}
            >
              <div className={`${viewMode === 'grid' ? 'w-full' : 'w-16 h-16'} bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden ${viewMode === 'grid' ? 'aspect-square mb-3' : ''} shadow-inner relative`}>
                <img 
                  src={getCorrectFileUrl(doc.file_url, supabase)} 
                  alt={doc.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Failed to load image:', doc.file_url);
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="12">No Image</text></svg>';
                  }}
                />
                <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {getCategoryIcon(doc.category)}
                </div>
              </div>
              
              {viewMode === 'grid' ? (
                <div>
                  <h3 className="font-bold text-sm truncate mb-1">{doc.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">{formatDate(doc.created_at)}</p>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate mb-1">{doc.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">{formatDate(doc.created_at)}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button 
                  className="p-2 rounded-xl hover:bg-white/60 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadDocument(doc);
                  }}
                  title="Download"
                >
                  <Download size={16} className="text-gray-600" />
                </button>
                <button 
                  className="p-2 rounded-xl hover:bg-rose-100 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDocument(doc);
                  }}
                  title="Delete"
                >
                  <Trash2 size={16} className="text-rose-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredDocs.length === 0 && !isLoading && (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="w-24 h-24 glass-card-lavender rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <FolderOpen size={48} className="text-violet-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">No documents yet</h3>
          <p className="text-sm text-gray-500 font-medium mb-8">Start by scanning your first document</p>
          <button 
            onClick={onOpenScanner}
            className="btn-primary-glass shadow-lg px-8"
          >
            <div className="flex items-center justify-center gap-2">
              <Plus size={20} />
              <span>Scan Document</span>
            </div>
          </button>
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
          <div className="glass-card p-8 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{selectedDoc.title}</h3>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-3 rounded-2xl glass-card hover:shadow-md transition-all"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="aspect-video bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden mb-6 shadow-inner relative group">
              <img 
                src={getCorrectFileUrl(selectedDoc.file_url, supabase)} 
                alt={selectedDoc.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load modal image:', selectedDoc.file_url);
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="16">Image Not Available</text></svg>';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <button 
                  onClick={() => window.open(getCorrectFileUrl(selectedDoc.file_url, supabase), '_blank')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-900 px-4 py-2 rounded-xl font-bold text-sm"
                >
                  Open Full Size
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Category</span>
                <span className="font-bold capitalize">{getCategoryIcon(selectedDoc.category)} {selectedDoc.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Date added</span>
                <span className="font-bold">{formatDate(selectedDoc.created_at)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => handleDownloadDocument(selectedDoc)}
                className="flex-1 btn-secondary-glass"
              >
                <div className="flex items-center justify-center gap-2">
                  <Download size={18} />
                  <span>Download</span>
                </div>
              </button>
              <button 
                onClick={() => handleDeleteDocument(selectedDoc)}
                className="flex-1 bg-rose-500 text-white font-bold py-3.5 px-5 rounded-2xl hover:bg-rose-600 active:scale-95 transition-all shadow-lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <Trash2 size={18} />
                  <span>Delete</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultGallery;