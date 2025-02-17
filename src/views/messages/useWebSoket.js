import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

const useWebSocket = (brokerUrl, userName, activeUser, setUserMassageList, userMessageList, scrollToBottom, notification, setNotification) => {
  const stompClientRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');
  const [newNotification, setNewNotification] = useState('');

  useEffect(() => {
    stompClientRef.current?.deactivate();
    stompClientRef.current = null;
  }, [userName])

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
  console.log("üç", activeUser)
  useEffect(() => {
    if (stompClientRef?.current && stompClientRef?.current?.connected) {
      const mainRoute = `/user/${userName}/messages`;
      stompClientRef?.current.subscribe(mainRoute, message => {
        const { type, sender, content, sendTime } = JSON.parse(message.body);
        console.log(type,content)
        if (type === 'CHAT_MESSAGE') {
          console.log("iki", activeUser, sender)
          if (sender === activeUser?.userName) {
            setNewMessage({ message: { content: content, sender: activeUser?.userName, sendTime: sendTime } });
            messageReceived(message);
          } else {
            setNewMessage({ message: { content: "", sender: activeUser?.userName, sendTime: sendTime } });

            setNewNotification({ user: sender })
          }
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
  }, [stompClientRef?.current?.connected, activeUser]);

  useEffect(() => {
    if (newMessage) {
      if (userMessageList?.length > 0) {
        const tempList = [...userMessageList];
        tempList.push(newMessage);
        setUserMassageList(tempList);
      } else {
        setUserMassageList([newMessage]);
      }
      scrollToBottom();
    }
  }, [newMessage, activeUser]);

  useEffect(() => {
    if (newNotification) {
      if (notification?.find((e) => newNotification?.user === e?.user)) {
        setNotification(notification?.map((e) => e?.user === newNotification?.user ? { ...e, count: e?.count + 1 } : e))
      } else {
        const tempNot = notification ? [...notification] : []
        tempNot.push({ user: newNotification?.user, count: 1 })
        setNotification(tempNot)
      }
    }
  }, [newNotification])

  const sendMessage = (messageText, gUserName) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      if (userMessageList?.length > 0) {
        const tempList = [...userMessageList];
        tempList.push({ message: { content: messageText, sender: gUserName } });
        setUserMassageList(tempList);
      } else {
        setUserMassageList([{ message: { content: messageText, sender: gUserName } }]);
      }
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          type: 'CHAT_MESSAGE',
          payload: {
            traceId: crypto.randomUUID(),
            chatId: 1,
            messageId: crypto.randomUUID(),
            sender: gUserName,
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

  const addGroup = (gUserName,data) => {
    stompClientRef.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        type: 'CREATE_CHANNEL_REQUEST',
        payload: {
          traceId: crypto.randomUUID(),
          messageId: crypto.randomUUID(),
          sender: gUserName,
          isGroup:true,
          channelName:data?.channelName,
          invitees:data?.participants,
          type: 'CREATE_CHANNEL_REQUEST',
        },
      }),
    });
  }

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

  return { userMessageList, setUserMassageList, sendMessage, addGroup };
};

export default useWebSocket;
