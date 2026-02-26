import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, supabase } from '../firebase-config';
import { Search, Plus, Grid, List, Trash2, X, FolderOpen, Loader2, Download, FileText } from 'lucide-react';

// Helper function to get correct file URL
const getCorrectFileUrl = (fileUrl, supabaseInstance) => {
  if (!fileUrl) return null;
  if (!fileUrl.includes('supabase.co')) return fileUrl;
  
  try {
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex((part, i) => 
      i > 4 && (part === 'documents' || part === 'vault_documents')
    );
    
    if (bucketIndex === -1) return fileUrl;
    
    let filePathParts = pathParts.slice(bucketIndex + 1);
    if (filePathParts[0] === 'documents') {
      filePathParts = filePathParts.slice(1);
    }
    
    const correctPath = filePathParts.join('/');
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
    if (authLoading) return;
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
            setDocuments(prev => {
              const exists = prev.some(doc => doc.id === payload.new.id);
              if (exists) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setDocuments(prev => prev.filter(doc => doc.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setDocuments(prev => prev.map(doc => doc.id === payload.new.id ? payload.new : doc));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

  const isLoading = authLoading || loading;

  const extractFilePath = (fileUrl) => {
    if (!fileUrl || !fileUrl.includes('supabase.co')) return null;
    
    try {
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex((part, i) => 
        i > 4 && (part === 'documents' || part === 'vault_documents')
      );
      
      if (bucketIndex === -1) return null;
      
      let filePathParts = pathParts.slice(bucketIndex + 1);
      if (filePathParts[0] === 'documents') {
        filePathParts = filePathParts.slice(1);
      }
      
      return filePathParts.join('/');
    } catch (e) {
      return null;
    }
  };

  const handleDeleteDocument = async (document) => {
    if (!confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }

    try {
      if (document.file_url) {
        const filePath = extractFilePath(document.file_url);
        if (filePath) {
          await supabase.storage.from('documents').remove([filePath]);
        }
      }

      const { error: dbError } = await supabase
        .from('vault_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;
      
      setSelectedDoc(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const correctUrl = getCorrectFileUrl(doc.file_url, supabase);
      const response = await fetch(correctUrl);
      if (!response.ok) throw new Error(`Failed to download: ${response.status}`);
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
    { id: 'all', label: 'All', icon: '📁', color: 'from-gray-500 to-gray-600' },
    { id: 'personal', label: 'Personal', icon: '👤', color: 'from-blue-500 to-blue-600' },
    { id: 'career', label: 'Career', icon: '💼', color: 'from-amber-500 to-amber-600' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧', color: 'from-pink-500 to-pink-600' },
    { id: 'legal', label: 'Legal', icon: '⚖️', color: 'from-purple-500 to-purple-600' },
    { id: 'medical', label: 'Medical', icon: '🏥', color: 'from-red-500 to-red-600' },
    { id: 'financial', label: 'Financial', icon: '💰', color: 'from-green-500 to-green-600' },
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

  const getCategoryInfo = (category) => {
    return categories.find(c => c.id === category) || { icon: '📄', color: 'from-gray-500 to-gray-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="px-5 py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Document Vault</h2>
            <p className="text-sm text-gray-500 mt-1">{filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} stored</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${
                viewMode === 'grid' 
                  ? 'bg-violet-100 text-violet-600' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${
                viewMode === 'list' 
                  ? 'bg-violet-100 text-violet-600' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-violet-500" />
          </div>
        )}

        {/* Category Filters - Premium horizontal bar */}
        {!isLoading && (
          <div className="mb-6">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-5 px-5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 h-11 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                      : 'bg-white/80 border border-gray-200/80 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Documents Grid/List */}
        {!isLoading && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
            {filteredDocs.map((doc) => {
              const catInfo = getCategoryInfo(doc.category);
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md active:scale-[0.98] transition-all ${
                    viewMode === 'list' ? 'flex items-center p-3 gap-3' : ''
                  }`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="aspect-square bg-gray-100 relative">
                        <img 
                          src={getCorrectFileUrl(doc.file_url, supabase)} 
                          alt={doc.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text x="50%" y="45%" text-anchor="middle" fill="%239ca3af" font-size="40">📄</text></svg>';
                          }}
                        />
                        <div className={`absolute top-2 right-2 w-7 h-7 rounded-lg bg-gradient-to-r ${catInfo.color} flex items-center justify-center text-white text-xs shadow`}>
                          {catInfo.icon}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">{doc.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(doc.created_at)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={getCorrectFileUrl(doc.file_url, supabase)} 
                          alt={doc.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><rect fill="%23f3f4f6" width="56" height="56"/><text x="50%" y="55%" text-anchor="middle" fill="%239ca3af" font-size="20">📄</text></svg>';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">{doc.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs">{catInfo.icon}</span>
                          <span className="text-xs text-gray-500">{formatDate(doc.created_at)}</span>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${catInfo.color} flex items-center justify-center text-white text-xs`}>
                        {catInfo.icon}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredDocs.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <FolderOpen size={36} className="text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
            <p className="text-sm text-gray-500 mb-6">Start by scanning your first document</p>
            <button 
              onClick={onOpenScanner}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={18} />
              <span>Scan Document</span>
            </button>
          </div>
        )}

        {/* Document Detail Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedDoc(null)}>
            <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Image */}
              <div className="relative aspect-video bg-gray-100">
                <img 
                  src={getCorrectFileUrl(selectedDoc.file_url, supabase)} 
                  alt={selectedDoc.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="48">📄</text></svg>';
                  }}
                />
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Details */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedDoc.title}</h3>
                
                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Category</span>
                    <span className="text-sm font-medium text-gray-900">{getCategoryInfo(selectedDoc.category).icon} {selectedDoc.category}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Date added</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(selectedDoc.created_at)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleDownloadDocument(selectedDoc)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <Download size={18} />
                    <span>Download</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteDocument(selectedDoc)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all"
                  >
                    <Trash2 size={18} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultGallery;