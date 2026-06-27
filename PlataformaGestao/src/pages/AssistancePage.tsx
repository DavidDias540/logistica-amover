import React, { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { apiClient } from '../api/client';

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
}

interface Request {
  id: number;
  reason: string;
  subject: string;
  date: string;
  targetUserID?: number;
  status: string;
  messages: Message[];
}

interface User {
  id: number;
  name: string;
}

const AssistancePage: React.FC = () => {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [reason, setReason] = useState('');
  const [subject, setSubject] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTargetUser, setSelectedTargetUser] = useState<number | ''>('');
  
  const [activeTab, setActiveTab] = useState<'Abertos' | 'Fechados'>('Abertos');

  useEffect(() => {
    loadRequests();
    loadUsers();
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      const { data } = await apiClient.get('/api/User/me');
      setCurrentUser(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadRequests() {
    try {
      const { data } = await apiClient.get('/api/Assistance');
      setRequests(data);
      if (selectedRequest) {
        const updated = data.find((r: Request) => r.id === selectedRequest.id);
        if (updated) setSelectedRequest(updated);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadUsers() {
    try {
      const { data } = await apiClient.get('/api/User');
      setUsers(data.filter((u: User) => (u as any).role?.toLowerCase() === 'motorista'));
    } catch (e) {
      console.error(e);
    }
  }

  const getTargetLabel = (targetUserID?: number) => {
    if (!targetUserID) return 'Todos os condutores';
    const user = users.find(u => u.id === targetUserID);
    return user ? user.name : `Condutor ID ${targetUserID}`;
  };

  const handleSubmit = async () => {
    if (reason && subject) {
      try {
        const newReq = {
          reason,
          subject,
          date: new Date().toISOString(),
          targetUserID: selectedTargetUser ? Number(selectedTargetUser) : null,
          status: 'Open',
          messages: [{
            text: subject,
            sender: currentUser?.name || 'Gestão',
            timestamp: new Date().toISOString()
          }]
        };
        await apiClient.post('/api/Assistance', newReq);
        setReason('');
        setSubject('');
        setSelectedTargetUser('');
        setShowNewRequest(false);
        loadRequests();
      } catch (e) {
        console.error(e);
        alert("Erro ao criar pedido");
      }
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedRequest) {
      try {
        await apiClient.post(`/api/Assistance/${selectedRequest.id}/messages`, {
          text: newMessage,
          sender: currentUser?.name || 'Gestão'
        });
        setNewMessage('');
        loadRequests();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCloseChat = async () => {
    if (selectedRequest) {
      try {
        await apiClient.put(`/api/Assistance/${selectedRequest.id}/close`);
        setSelectedRequest(null);
        loadRequests();
      } catch (e) {
        console.error(e);
        alert("Erro ao fechar o pedido");
      }
    }
  };

  const filteredRequests = requests.filter(r => 
    activeTab === 'Abertos' ? (r.status !== 'Closed') : (r.status === 'Closed')
  );

  const renderChat = () => (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-md p-4 shadow-md flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 pb-3 border-b">
        <div>
          <h2 className="font-semibold text-lg">{selectedRequest?.reason}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedRequest?.date ? new Date(selectedRequest.date).toLocaleDateString() : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedRequest?.status !== 'Closed' && (
            <button
              onClick={handleCloseChat}
              className="text-red-500 hover:text-red-700 font-medium px-3 py-1 border border-red-500 rounded hover:bg-red-50 transition-colors"
            >
              Fechar Chat
            </button>
          )}
          <button
            onClick={() => setSelectedRequest(null)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:bg-gray-700/50 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {selectedRequest?.messages?.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(message => {
          const isOwn = currentUser && message.sender.startsWith(currentUser.name);
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isOwn
                    ? 'bg-[#333333] text-white'
                    : 'bg-blue-100 border border-blue-200 text-black'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${isOwn ? 'text-gray-300' : 'text-blue-600'}`}>
                  {message.sender}
                </div>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-gray-400' : 'text-blue-500'}`}>
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mt-auto">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2"
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <button
          onClick={handleSendMessage}
          className="bg-[#333333] text-white p-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
          disabled={selectedRequest?.status === 'Closed'}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <button
        onClick={() => {
          setSelectedRequest(null);
          setShowNewRequest(true);
        }}
        className="bg-white dark:bg-gray-800 text-black py-2 px-4 rounded-md font-semibold shadow-md w-fit"
      >
        + Enviar Pedido
      </button>

      <div className="flex flex-col lg:flex-row gap-4 h-full" style={{ minHeight: '500px' }}>
        {/* Left side - Request History */}
        <div className={`${selectedRequest ? 'hidden lg:flex' : 'flex'} flex-1 bg-white dark:bg-gray-800 rounded-md p-4 shadow-md overflow-auto h-full flex-col`}>
          
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button
              className={`flex-1 py-2 text-center font-semibold ${activeTab === 'Abertos' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600 dark:text-gray-300'}`}
              onClick={() => setActiveTab('Abertos')}
            >
              Abertos
            </button>
            <button
              className={`flex-1 py-2 text-center font-semibold ${activeTab === 'Fechados' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600 dark:text-gray-300'}`}
              onClick={() => setActiveTab('Fechados')}
            >
              Histórico
            </button>
          </div>

          <div className="space-y-2">
            {filteredRequests.map(request => (
              <div
                key={request.id}
                className="border-b border-gray-200 dark:border-gray-700 py-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-700/50 transition-colors"
                onClick={() => {
                  setSelectedRequest(request);
                  setShowNewRequest(false);
                }}
              >
                <div className="font-medium">{request.reason}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{new Date(request.date).toLocaleDateString()}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {request.messages?.length || 0} mensagens
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.targetUserID ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {getTargetLabel(request.targetUserID)}
                  </span>
                </div>
              </div>
            ))}
            {filteredRequests.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-4">Sem pedidos.</p>}
          </div>
        </div>

        {/* Right side - Chat or New Request Form */}
        <div className={`${selectedRequest || showNewRequest ? 'flex' : 'hidden lg:flex'} flex-1 h-full`}>
          {selectedRequest ? (
            renderChat()
          ) : showNewRequest ? (
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow-md h-full flex flex-col">
              <h2 className="text-black font-semibold mb-4">Novo Pedido / Alerta</h2>
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 mb-1">Motivo:</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 mb-1">Destinatário:</label>
                  <select
                    value={selectedTargetUser}
                    onChange={(e) => setSelectedTargetUser(e.target.value ? Number(e.target.value) : '')}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-800"
                  >
                    <option value="">Todos os condutores</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 mb-1">Mensagem Inicial / Assunto:</label>
                  <textarea
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 h-32"
                  />
                </div>
                <div className="flex justify-end mt-auto pt-4">
                  <button
                    onClick={handleSubmit}
                    className="bg-[#333333] text-white py-2 px-6 rounded-md font-semibold hover:bg-[#444444] transition-colors"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow-md h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Selecione um pedido à esquerda ou crie um novo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistancePage;