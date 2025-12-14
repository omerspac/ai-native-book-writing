import React, { useState, useRef, useEffect } from 'react';
import './RAGPopup.css';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const RAGPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (userInput.trim() === '' || isLoading) return;

    const userMessage: Message = { text: userInput, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userInput }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage: Message = { text: data.answer || 'Sorry, I could not find an answer.', sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      const errorMessage: Message = { text: 'Sorry, something went wrong. Please try again.', sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button className="rag-popup-button" onClick={togglePopup}>
        💬
      </button>
    );
  }

  return (
    <div className="rag-popup-window">
      <div className="rag-popup-header" onClick={togglePopup}>
        <h3>AI Chat</h3>
        <button className="rag-popup-minimize-btn">-</button>
      </div>
      <div className="rag-chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`rag-chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div className="rag-chat-message bot">...</div>}
      </div>
      <div className="rag-popup-input-area">
        <input
          type="text"
          className="rag-popup-input"
          placeholder="Ask a question..."
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button className="rag-popup-send-btn" onClick={handleSendMessage} disabled={isLoading}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default RAGPopup;
