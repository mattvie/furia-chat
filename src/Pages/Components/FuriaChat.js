import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './FuriaChat.css'
import bots from './bots.json'

export default function FuriaChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const usedIndexes = {};
    const remainingMessages = [];

    // Etapa 1: Após 5s, cada bot envia 1 mensagem
    const stage1 = () => {
      Object.entries(bots).forEach(([sender, messages]) => {
        const randomIndex = Math.floor(Math.random() * messages.length);
        const text = messages[randomIndex];

        // Marca a mensagem como usada
        usedIndexes[sender] = new Set([randomIndex]);

        // Envia a mensagem
        setMessages((prev) => [...prev, { sender, text }]);

        // Adiciona as outras mensagens à fila do estágio 2
        messages.forEach((msg, i) => {
          if (i !== randomIndex) {
            remainingMessages.push({ sender, text: msg });
          }
        });
      });
    };

    // Etapa 2: Mensagens aleatórias com delays de até 30s
    const stage2 = () => {
      const sendNext = () => {
        if (remainingMessages.length === 0) return;

        const index = Math.floor(Math.random() * remainingMessages.length);
        const { sender, text } = remainingMessages.splice(index, 1)[0];

        setMessages((prev) => [...prev, { sender, text }]);

        const delay = Math.random() * 30000; // até 30s
        setTimeout(sendNext, delay);
      };

      sendNext();
    };

    const timer1 = setTimeout(() => {
      stage1();

      // Pequeno buffer de 0.5s antes de começar o estágio 2
      setTimeout(stage2, 5000);
    }, 5000);

    return () => clearTimeout(timer1);
  }, []);
 

  const handleUserInput = async (event) => {
    if (event.key === 'Enter' && inputMessage.trim()) {
      const userMessage = { sender: 'Você', text: inputMessage };
      setMessages((prev) => [...prev, userMessage]);
  
      const userInput = inputMessage;
      setInputMessage('');
  
      // 🔗 Chamada ao backend
      try {
        const res = await fetch('https://furia-chat-server.onrender.com/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: userInput })
        });
  
        const data = await res.json();
        const botMessage = { sender: 'FURIA Sensei', text: data.reply };
        setMessages((prev) => [...prev, botMessage]);
      } catch (err) {
        console.error(err);
        setMessages((prev) => [...prev, { sender: 'FURIA Sensei', text: 'Erro ao acessar a API' }]);
      }
    }
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  

  return (
    <div className="chat-wrapper">
      <h1 className="title">FURIA Chat</h1>
      <div className="chat-box">
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.sender === 'Você' ? 'user' : 'bot'}`}>
            <strong className={`sender-name ${m.sender !== 'Você' ? `bot-${m.sender.replace(/\s+/g, '').toLowerCase()}` : ''}`}>
              {m.sender}
            </strong>{' '}
            <ReactMarkdown>{m.text}</ReactMarkdown>
          </div>
          
          ))}

          <div ref={messagesEndRef} />
        </div>
        <input
          className="input"
          type="text"
          placeholder="Digite sua mensagem e pressione Enter"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleUserInput}
        />
      </div>
    </div>
  );
}
