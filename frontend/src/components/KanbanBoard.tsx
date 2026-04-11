import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Download, Clock, Trash2, X } from 'lucide-react';

const COLUMNS = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'];

const KanbanBoard = () => {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const response = await axios.get('http://localhost:5000/api/applications', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      return response.data;
    }
  });

  
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      return axios.patch(`http://localhost:5000/api/applications/${id}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
    },
    onMutate: async (updatedApp) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });
      const previousApps = queryClient.getQueryData(['applications']);
      queryClient.setQueryData(['applications'], (old: any) => {
        return old.map((app: any) => 
          app._id === updatedApp.id ? { ...app, status: updatedApp.status } : app
        );
      });
      return { previousApps };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });

  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      return axios.delete(`http://localhost:5000/api/applications/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setSelectedApp(null);
    }
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    updateStatusMutation.mutate({ id: draggableId, status: destination.droppableId });
  };

  
  const filteredApps = applications?.filter((app: any) => 
    app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.role.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  
  const stats = {
    total: filteredApps.length,
    active: filteredApps.filter((a: any) => ['Applied', 'Phone Screen', 'Interview'].includes(a.status)).length,
    offers: filteredApps.filter((a: any) => a.status === 'Offer').length,
  };

  const handleExportCSV = () => {
    if (!applications || applications.length === 0) return;
    const headers = "Company,Role,Status,Location\n";
    const rows = applications.map((a: any) => 
      `"${a.company}","${a.role}","${a.status}","${a.location || 'N/A'}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'job_tracker_export.csv';
    link.click();
  };

  const isOverdue = (dateString: string, status: string) => {
    if (status !== 'Applied' || !dateString) return false;
    const appliedDate = new Date(dateString);
    const diffDays = Math.floor((new Date().getTime() - appliedDate.getTime()) / (1000 * 3600 * 24));
    return diffDays > 7; 
  };

  const columns: Record<string, any[]> = {
    'Applied': filteredApps.filter((app: any) => app.status === 'Applied'),
    'Phone Screen': filteredApps.filter((app: any) => app.status === 'Phone Screen'),
    'Interview': filteredApps.filter((app: any) => app.status === 'Interview'),
    'Offer': filteredApps.filter((app: any) => app.status === 'Offer'),
    'Rejected': filteredApps.filter((app: any) => app.status === 'Rejected'),
  };

  if (isLoading) return <div className="p-10 text-center text-gray-500">Loading your board...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Failed to load applications.</div>;

  return (
    <div className="flex flex-col h-full">
      
      <div className="flex flex-wrap justify-between items-end gap-4 shrink-0 mb-6">

        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total</p>
            <p className="text-xl font-black text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-blue-50 px-5 py-3 rounded-xl border border-blue-100 shadow-sm">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Active</p>
            <p className="text-xl font-black text-blue-800">{stats.active}</p>
          </div>
          <div className="bg-green-50 px-5 py-3 rounded-xl border border-green-100 shadow-sm">
            <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Offers</p>
            <p className="text-xl font-black text-green-800">{stats.offers}</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto h-full pb-4">
            {COLUMNS.map((colId) => (
              <div key={colId} className="w-[300px] shrink-0 bg-gray-100/80 p-4 rounded-xl flex flex-col border border-gray-200/50">
                <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-4 px-2">{colId}</h3>
                <Droppable droppableId={colId}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto space-y-3 min-h-[150px]">
                      {columns[colId].map((item, index) => (
                        <Draggable key={item._id} draggableId={item._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedApp(item)}
                              className={`p-4 bg-white rounded-lg shadow-sm border transition cursor-pointer relative ${
                                isOverdue(item.createdAt, item.status) 
                                  ? 'border-red-300 hover:border-red-500 bg-red-50/30' 
                                  : 'border-gray-200 hover:border-blue-400'
                              }`}
                            >
                              <h4 className="font-bold text-gray-800 pr-6">{item.company}</h4>
                              <p className="text-sm text-gray-500 mt-1">{item.role}</p>
                              
                              {isOverdue(item.createdAt, item.status) && (
                                <div className="mt-3 inline-flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold">
                                  <Clock className="w-3 h-3" /> FOLLOW UP
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col">
            <button 
                onClick={() => {
                  setSelectedApp(null);
                  setCoverLetter(''); 
                }} 
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
                <X className="w-5 h-5 text-gray-400" />
            </button>

            <h2 className="text-2xl font-black text-gray-900">{selectedApp.company}</h2>
            <p className="text-blue-600 font-bold text-lg mb-6">{selectedApp.role}</p>
            

            <div className="overflow-y-auto pr-2 space-y-6 flex-1 min-h-0">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-xs text-blue-800 uppercase tracking-widest mb-3">AI Resume Suggestions</h3>
                  <ul className="list-disc ml-5 text-sm text-blue-900 space-y-2">
                      {selectedApp.resumeSuggestions?.length > 0 ? (
                          selectedApp.resumeSuggestions.map((s: string, i: number) => <li key={i}>{s}</li>)
                      ) : (
                          <li className="list-none ml-[-20px] italic text-gray-500">No suggestions available yet.</li>
                      )}
                  </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-xs text-gray-600 uppercase tracking-widest">Magic Cover Letter</h3>
                  <button
                    onClick={async () => {
                      setIsStreaming(true);
                      setCoverLetter('');
                      try {
                        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                        const response = await fetch('http://localhost:5000/api/ai/stream-cover-letter', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${userInfo.token}`
                          },
                          body: JSON.stringify({ company: selectedApp.company, role: selectedApp.role })
                        });

                        const reader = response.body?.getReader();
                        const decoder = new TextDecoder('utf-8');

                        while (true) {
                          const { done, value } = await reader!.read();
                          if (done) break;

                          const chunk = decoder.decode(value, { stream: true });
                          setCoverLetter((prev) => prev + chunk);
                        }
                      } catch (err) {
                        alert("Failed to stream letter.");
                      } finally {
                        setIsStreaming(false);
                      }
                    }}
                    disabled={isStreaming}
                    className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {isStreaming ? 'Generating...' : 'Generate Letter'}
                  </button>
                </div>
                
                {/* Display the streaming text */}
                {(coverLetter || isStreaming) && (
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded border border-gray-100 min-h-[100px]">
                    {coverLetter}
                    {isStreaming && <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1 align-middle"></span>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6 shrink-0">
              <button 
                onClick={() => {
                    if(window.confirm("Are you sure you want to delete this?")) {
                        deleteMutation.mutate(selectedApp._id)
                    }
                }} 
                className="flex items-center gap-2 text-red-500 font-bold hover:text-red-700 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button 
                onClick={() => {
                  setSelectedApp(null);
                  setCoverLetter('');
                }} 
                className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;