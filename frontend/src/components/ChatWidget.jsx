import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ChevronDown } from 'lucide-react';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext.jsx';

const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

const ChatWidget = ({ predefinedMessage }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      socket.emit('join', { userId: user._id });

      socket.on('chatHistory', (history) => {
        setMessages(history);
      });

      socket.on('newMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }

    return () => {
      socket.off('chatHistory');
      socket.off('newMessage');
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (predefinedMessage) {
      setNewMessage(predefinedMessage);
      setIsOpen(true);
    }
  }, [predefinedMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      const message = {
        sender: 'user',
        text: newMessage,
        timestamp: new Date().toISOString(),
      };
      socket.emit('sendMessage', {
        userId: user._id,
        text: newMessage,
      });
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage('');
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-110"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      <div
        className={`fixed bottom-8 right-8 w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'h-[500px] opacity-100' : 'h-0 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-primary-600 text-white rounded-t-lg">
          <h3 className="font-semibold">Discutez avec PharmaMOS</h3>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-700 rounded-full">
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end space-x-2 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-right mt-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 input-field"
            />
            <button
              type="submit"
              className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50"
              disabled={!newMessage.trim()}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
