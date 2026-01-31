import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase-config';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Trash2, Edit3, Eye, Filter, FileText, Upload, Download, Share2 } from 'lucide-react';

const VaultGallery = () => {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'personal', 'career', 'family'
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Live Query to Firestore
    const q = query(
      collection(db, "journals"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDoc(doc(db, "journals", id));
        // Note: You should also call deleteObject from Firebase Storage here
        alert("Document deleted successfully!");
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete document. Please try again.");
      }
    }
  };

  const handleEdit = (doc) => {
    setSelectedDoc(doc);
    setEditTitle(doc.title || '');
    setEditType(doc.type || 'personal');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedDoc) return;
    
    try {
      await updateDoc(doc(db, "journals", selectedDoc.id), {
        title: editTitle,
        type: editType
      });
      setShowEditModal(false);
      alert("Document updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update document. Please try again.");
    }
  };

  const filteredDocs = filter === 'all' 
    ? documents 
    : documents.filter(d => d.type === filter);

  const getTypeColor = (type) => {
    switch (type) {
      case 'career': return 'bg-blue-100 text-blue-700';
      case 'family': return 'bg-purple-100 text-purple-700';
      case 'personal': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen safe-area">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="text-teal-600" /> My Secure Vault
        </h2>
        <div className="flex gap-2 items-center">
          <select 
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg bg-white shadow-sm px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Documents</option>
            <option value="personal">Personal</option>
            <option value="career">Career</option>
            <option value="family">Family</option>
          </select>
          <button className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2">
            <Upload size={18} /> Upload
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-teal-600">{documents.length}</div>
          <div className="text-sm text-slate-500">Total Documents</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-blue-600">
            {documents.filter(d => d.type === 'career').length}
          </div>
          <div className="text-sm text-slate-500">Career Files</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-purple-600">
            {documents.filter(d => d.type === 'family').length}
          </div>
          <div className="text-sm text-slate-500">Family Records</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading your vault...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 group relative hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                {doc.mediaUrl ? (
                  <img src={doc.mediaUrl} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <FileText size={48} />
                  </div>
                )}
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(doc.mediaUrl, '_blank')}
                      className="p-2 bg-white rounded-full text-slate-600 hover:text-teal-600 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleEdit(doc)}
                      className="p-2 bg-white rounded-full text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 bg-white rounded-full text-slate-600 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Info */}
              <div className="p-3">
                <h3 className="text-sm font-bold text-slate-800 truncate">{doc.title || "Untitled Document"}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getTypeColor(doc.type)}`}>
                    {doc.type || 'personal'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {doc.timestamp?.toDate().toLocaleDateString()}
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-slate-100 text-slate-700 text-xs py-1 px-2 rounded hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                    <Download size={14} /> Download
                  </button>
                  <button className="flex-1 bg-slate-100 text-slate-700 text-xs py-1 px-2 rounded hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredDocs.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-400">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Your vault is empty.</p>
          <p className="text-sm">Scan a document to get started.</p>
          <button className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors">
            Scan Document
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Document</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="personal">Personal</option>
                  <option value="career">Career</option>
                  <option value="family">Family</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultGallery;