// src/components/ChatBox.js
import React, { useState, useRef, useEffect } from 'react';
import '../../user/styles/ChatBox.css';

const ChatBox = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll xuống cuối chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Format phản hồi từ AI
  const formatReply = (reply) => {
    if (!reply) return '';

    // Nếu là string, loại bỏ prefix "Kết quả: "
    if (typeof reply === 'string') {
        // loại bỏ prefix "Kết quả: " nếu có
        if (reply.startsWith('Kết quả:')) {
            reply = reply.replace(/^Kết quả:\s*/, '');
        }

        // nếu dạng "[{author=ok}]"
        if (reply.startsWith('[') && reply.endsWith(']')) {
            return reply
                .replace(/^\[|\]$/g, '')      // bỏ [ ]
                .split('}, {')                // tách từng object
                .map(item => item.replace(/=/g, ':').replace(/{|}/g, '').trim())
                .join('\n');                  // xuống dòng
        }

        return reply;  // string bình thường
    }

    // Nếu là mảng
    if (Array.isArray(reply)) {
        return reply
            .map(item => {
                if (typeof item === 'object') {
                    return Object.entries(item)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                }
                return item;
            })
            .join('\n');
    }

    // Nếu là object
    if (typeof reply === 'object') {
        return Object.entries(reply)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    }

    return String(reply);
};



    // Gửi message
    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/identity/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: inputMessage })
            });

            const data = await response.json();

            const botMessage = {
                id: Date.now() + 1,
                text: formatReply(data.reply),
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Lỗi kết nối đến AI. Vui lòng thử lại sau.',
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
            console.error('Error communicating with AI:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
    };



    return (
        <>
            {/* Nút mở chat */}
            {!isOpen && (
                <button
                    className="chat-button"
                    onClick={() => setIsOpen(true)}
                >
                    💬 AI Assistant
                </button>
            )}

            {/* Chat Box */}
            {isOpen && (
                <div className="chat-box">
                    <div className="chat-header">
                        <div className="chat-title">
                            <span className="ai-icon">🤖</span>
                            <span>AI Assistant</span>
                        </div>
                        <div className="chat-actions">
                            <button className="clear-btn" onClick={clearChat}>
                                🗑️
                            </button>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="welcome-message">
                                <div className="welcome-icon">👋</div>
                                <h3>Xin chào! Tôi là trợ lý AI</h3>
                                <p>Hỏi tôi bất cứ điều gì về hệ thống hoặc sử dụng "@db:" để hỏi dữ liệu trong thư viện</p>
                                <div className="examples">
                                    <strong>Ví dụ:</strong>
                                    <ul>
                                        <li>"Có thể mượn sách online không?"</li>
                                        <li>"Các quy định khi mượn sách là gì?"</li>
                                        <li>"@db: cho tôi tên 2 quyển sách có nhiều lượt mượn nhất"</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
                                >
                                    <div className="message-content">
                                        <div className="message-text" style={{ whiteSpace: 'pre-line' }}>
                                            {formatReply(message.text)}
                                        </div>
                                        <div className="message-time">{message.timestamp}</div>
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="message bot">
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <div className="input-container">
                            <textarea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Hãy sử dụng '@db:' để hỏi về dữ liệu trong thư viện"
                                rows="1"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="send-button"
                            >
                                {isLoading ? '⏳' : '📤'}
                            </button>
                        </div>
                        <div className="chat-hint">
                            💡 Sử dụng "trong hệ thống:" để truy vấn dữ liệu thực tế
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBox;
