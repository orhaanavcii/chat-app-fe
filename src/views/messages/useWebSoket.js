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
      const mainRoute = `/user/${userName}/messages`;
      stompClientRef?.current.subscribe(mainRoute, message => {
        const { type } = JSON.parse(message.body);
        console.log(type);
        if (type === 'CHAT_MESSAGE') {
          setNewMessage(message.body);
          messageReceived(message);
        }
        /*       if (type === 'FETCH_REGISTRY_RESPONSE') {
          const { channelRoutes } = JSON.parse(message.body);
          console.log('channelRoutes routes : ' + channelRoutes);
          channelRoutes
            .filter(channelRoute => channelRoute.route == !mainRoute) //isBased değilse ile değiştirilecek
            .map(channelRoute => {
              stompClientRef?.current.subscribe(channelRoute.route, message => {
                if (type === 'CHAT_MESSAGE') {
                  setNewMessage(message.body);
                  messageReceived(message);
                  console.log('new message from ' + route + ' message : ', JSON.parse(message.body));
                }
              });
              joinMessage(userName, channelRoute.channelId, channelRoute.route, false);
              console.log('subscribed by registry message. route : ' + route);
            });
        } */
        if (type === 'INVITE_CHANNEL') {
          const { channelId, route } = JSON.parse(message.body);
          console.log(channelId, route, 'helele');
          stompClientRef?.current.subscribe(route, message => {
            if (type === 'CHAT_MESSAGE') {
              setNewMessage(message.body);
              messageReceived(message);
              console.log('new message from ' + route + ' message : ', JSON.parse(message.body));
            }
          });
          console.log('subscribed by registry message. route : ' + route);
        }
      });
      sendFetchRegistryRequest(userName);
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
      if (userMessageList?.length > 0) {
        const tempList = [...userMessageList];
        tempList.push({ content: messageText, sender: userName });
        console.log(tempList, messageText);
        setUserMassageList(tempList);
      } else {
        setUserMassageList([{ content: messageText, sender: userName }]);
      }
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
            sendTime: new Date(),
            content: messageText,
            type: 'CHAT_MESSAGE',
          },
        }),
      });
    } else {
      console.error('WebSocket is not connected.');
    }
  };

  const sendFetchRegistryRequest = username => {
    stompClientRef.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        type: 'FETCH_REGISTRY',
        payload: {
          traceId: crypto.randomUUID(),
          sender: username,
          type: 'FETCH_REGISTRY',
        },
      }),
    });
  };

  const messageReceived = message => {
    const { traceId, chatId, messageId, sender } = JSON.parse(message.body);
    stompClientRef.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        type: 'CHAT_MESSAGE_DELIVERED',
        payload: {
          traceId: traceId,
          sender: userName,
          receiver: sender,
          messageId: messageId,
          deliveredTime: new Date(),
          type: 'CHAT_MESSAGE_DELIVERED',
        },
      }),
    });
  };

  return { userMessageList, setUserMassageList, sendMessage };
};

export default useWebSocket;
