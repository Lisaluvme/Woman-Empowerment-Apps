import React, { useState } from 'react';
import { Search, Filter, Plus, Grid, List, Trash2, Edit2, X } from 'lucide-react';

const VaultGallery = ({ onOpenScanner }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Mock documents data
  const [documents] = useState([
    { id: 1, title: 'Passport', category: 'personal', date: '2024-01-15', thumbnail: '📄' },
    { id: 2, title: 'Degree Certificate', category: 'career', date: '2024-01-10', thumbnail: '🎓' },
    { id: 3, title: 'Birth Certificate', category: 'family', date: '2024-01-08', thumbnail: '👶' },
    { id: 4, title: 'Bank Statement', category: 'personal', date: '2024-01-05', thumbnail: '🏦' },
    { id: 5, title: 'Resume', category: 'career', date: '2024-01-03', thumbnail: '📝' },
    { id: 6, title: 'Insurance Policy', category: 'personal', date: '2024-01-01', thumbnail: '🛡️' },
  ]);

  const categories = [
    { id: 'all', label: 'All Documents', icon: '📁' },
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'career', label: 'Career', icon: '💼' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  ];

  const filteredDocs = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Document Vault</h2>
          <p className="text-sm text-slate-500">{filteredDocs.length} documents stored</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Grid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search documents..."
          className="input-field pl-10"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Documents Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-2 gap-3' 
        : 'space-y-3'
      }>
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className={`card-hover cursor-pointer ${
              viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center gap-4'
            }`}
            onClick={() => setSelectedDoc(doc)}
          >
            <div className={`${viewMode === 'grid' ? 'w-full' : 'w-12 h-12'} bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center ${viewMode === 'grid' ? 'aspect-square mb-3' : ''}`}>
              <span className="text-3xl">{doc.thumbnail}</span>
            </div>
            
            {viewMode === 'grid' ? (
              <div>
                <h3 className="font-semibold text-slate-900 text-sm truncate">{doc.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{doc.date}</p>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{doc.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{doc.date}</p>
              </div>
            )}

            <div className="flex items-center gap-1">
              <button 
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit
                }}
              >
                <Edit2 size={16} className="text-slate-400" />
              </button>
              <button 
                className="p-2 rounded-lg hover:bg-rose-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle delete
                }}
              >
                <Trash2 size={16} className="text-rose-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid size={40} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No documents yet</h3>
          <p className="text-sm text-slate-500 mb-6">Start by scanning your first document</p>
          <button 
            onClick={onOpenScanner}
            className="btn-primary"
          >
            <div className="flex items-center justify-center gap-2">
              <Plus size={20} />
              Scan Document
            </div>
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={onOpenScanner}
        className="fixed bottom-24 right-4 bg-gradient-to-br from-emerald-500 to-teal-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
      >
        <Plus size={28} className="text-white" />
      </button>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">{selectedDoc.title}</h3>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-4">
              <span className="text-6xl">{selectedDoc.thumbnail}</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Category</span>
                <span className="font-medium text-slate-900 capitalize">{selectedDoc.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date added</span>
                <span className="font-medium text-slate-900">{selectedDoc.date}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 btn-secondary">
                <div className="flex items-center justify-center gap-2">
                  <Edit2 size={18} />
                  Edit
                </div>
              </button>
              <button className="flex-1 btn-danger">
                <div className="flex items-center justify-center gap-2">
                  <Trash2 size={18} />
                  Delete
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