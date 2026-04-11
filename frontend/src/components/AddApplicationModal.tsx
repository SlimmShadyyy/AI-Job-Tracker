import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { parseJobDescription, createApplication } from '../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddApplicationModal = ({ isOpen, onClose }: ModalProps) => {
  const queryClient = useQueryClient();
  const [jdText, setJdText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    requiredSkills: '',
    resumeSuggestions: [] as string[], 
  });

  const saveMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      onClose();
      // Reset form properly
      setJdText('');
      setFormData({ 
        company: '', 
        role: '', 
        location: '', 
        requiredSkills: '',
        resumeSuggestions: [] 
      });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to save application');
    }
  });


  const handleParseAI = async () => {
    if (!jdText) return;
    setIsParsing(true);
    try {
      const data = await parseJobDescription(jdText);
      setFormData({
        company: data.company || '',
        role: data.role || '',
        location: data.location || '',
        requiredSkills: data.requiredSkills ? data.requiredSkills.join(', ') : '',
        resumeSuggestions: [] as string[],
      });
    } catch (error) {
      alert("AI Parsing failed. Check your API key.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = () => {
    if (!formData.company || !formData.role) {
      alert("Company and Role are required.");
      return;
    }
    
    saveMutation.mutate({
      ...formData,
      status: 'Applied' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Add New Application</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-sm font-semibold text-blue-800 mb-2">Paste Job Description</label>
            <textarea 
              rows={4}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 text-sm mb-3"
            />
            <button 
              onClick={handleParseAI}
              disabled={isParsing || !jdText}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Sparkles className="w-4 h-4" />
              {isParsing ? 'Parsing with AI...' : 'Auto-Fill with AI'}
            </button>

            {formData.resumeSuggestions.length > 0 && (
              <p className="text-[10px] text-blue-500 mt-2 font-medium">
                AI generated {formData.resumeSuggestions.length} resume suggestions.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition">Cancel</button>
          <button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddApplicationModal;