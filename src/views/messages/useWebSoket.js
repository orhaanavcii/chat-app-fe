import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

const useWebSocket = (brokerUrl, userName, activeUser) => {
  const stompClientRef = useRef(null);
  const [userMessageList, setUserMassageList] = useState([]);

  useEffect(() => {
    if (!stompClientRef.current) {
      const client = new Client({
        brokerURL: brokerUrl,
        connectHeaders: {
          username: userName,
        },
        onConnect: () => {
          console.log('Connected to chat!');

          client.subscribe(`/user/${userName}/messages`, message => {
            console.log('New message received:', message.body);
            setUserMassageList(prevMessages => [...prevMessages, JSON.parse(message.body)]);
          });
        },
      });

      client.activate();
      stompClientRef.current = client;
    }

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [brokerUrl, userName]);

  const sendMessage = messageText => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          type: 'CHAT_MESSAGE',
          payload: {
            traceId: crypto.randomUUID(),
            chatId: 1,
            messageId: crypto.randomUUID(),
            sender: userName,
            receiver: activeUser.userName,
            participants: [userName, activeUser.userName],
            content: messageText,
            type: 'CHAT_MESSAGE',
          },
        }),
      });
    } else {
      console.error('WebSocket is not connected.');
    }
  };

  return { userMessageList, setUserMassageList, sendMessage };
};

export default useWebSocket;
