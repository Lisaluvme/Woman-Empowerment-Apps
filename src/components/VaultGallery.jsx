import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../firebase-config';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { Search, Filter, Plus, Grid, List, Trash2, Edit2, X, FolderOpen, Loader2, Download } from 'lucide-react';

const VaultGallery = ({ onOpenScanner }) => {
  const [user] = useAuthState(auth);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load documents from Firebase
  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    let q = query(
      collection(db, 'documents'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(docs);
      setLoading(false);
    }, (error) => {
      console.error('Error loading documents:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteDocument = async (doc) => {
    if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      return;
    }

    try {
      // Delete from storage
      if (doc.filePath) {
        const fileRef = storageRef(storage, doc.filePath);
        await deleteObject(fileRef);
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'documents', doc.id));
      
      // Document will be automatically removed from state by the onSnapshot listener
      setSelectedDoc(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const response = await fetch(doc.fileUrl);
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
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={48} className="animate-spin text-violet-600" />
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-6 scrollbar-hide animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat.id
                ? 'glass-card-lavender shadow-lg scale-105'
                : 'glass-card hover:shadow-md'
            }`}
          >
            <span className="text-base">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Documents Grid/List */}
      {!loading && (
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
                  src={doc.fileUrl} 
                  alt={doc.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {getCategoryIcon(doc.category)}
                </div>
              </div>
              
              {viewMode === 'grid' ? (
                <div>
                  <h3 className="font-bold text-sm truncate mb-1">{doc.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">{formatDate(doc.createdAt)}</p>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate mb-1">{doc.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">{formatDate(doc.createdAt)}</p>
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
      {filteredDocs.length === 0 && (
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
                src={selectedDoc.fileUrl} 
                alt={selectedDoc.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <button 
                  onClick={() => window.open(selectedDoc.fileUrl, '_blank')}
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
                <span className="font-bold">{formatDate(selectedDoc.createdAt)}</span>
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