import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

const useWebSocket = (brokerUrl, userName, activeUser, setUserMassageList, userMessageList, scrollToBottom) => {
  const stompClientRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!stompClientRef.current) {
      const client = new Client({
        brokerURL: brokerUrl,
        connectHeaders: {
          username: userName,
        },
        onConnect: () => {
          console.log('Connected to chat!');
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

  useEffect(() => {
    if (stompClientRef?.current && stompClientRef?.current?.connected) {
      stompClientRef?.current.subscribe(`/user/${userName}/messages`, message => {
        setNewMessage(message.body);
      });
    }
  }, [stompClientRef?.current?.connected]);

  useEffect(() => {
    if (newMessage) {
      if (userMessageList?.length > 0) {
        const tempList = [...userMessageList];
        tempList.push(JSON.parse(newMessage));
        console.log(tempList, JSON.parse(newMessage));
        setUserMassageList(tempList);
      } else {
        setUserMassageList([JSON.parse(newMessage)]);
      }
      scrollToBottom();
    }
  }, [newMessage]);

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
