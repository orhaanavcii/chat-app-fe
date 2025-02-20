import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

const useWebSocket = (
  brokerUrl,
  userName,
  activeUser,
  setUserMassageList,
  userMessageList,
  scrollToBottom,
  notification,
  setNotification,
  setAddUserList,
  addUserList,
  messageStatus,
  setActivePage,
  deliveredMessage,
  setDeliveredMessage,
) => {
  const stompClientRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');
  const [newNotification, setNewNotification] = useState('');
  const [tempActiveUser, setTempActiveUser] = useState(activeUser);

  useEffect(() => {
    if (!stompClientRef?.current?.connected) {
      const client = new Client({
        brokerURL: brokerUrl,
        connectHeaders: {
          username: userName,
          userFullName: userName === 'oavci' ? 'Orhan Avcı' : userName === 'edongez' ? 'Enes Döngez' : 'Test User',
        },
        onConnect: () => {
          console.log('Connected to chat!');
        },
      });
      client.activate();
      stompClientRef.current = client ? client : undefined;
    }
  }, [stompClientRef?.current?.connected]);

  useEffect(() => {
    if (stompClientRef?.current && stompClientRef?.current?.connected) {
      const mainRoute = `/user/${userName}/messages`;
      stompClientRef?.current.subscribe(mainRoute, message => {
        const { type, sender, content, sendTime, receiver, messageId, freeze } = JSON.parse(message.body);
        console.log(type, sender, content, receiver, 'main');
        if (type === 'CHAT_MESSAGE') {
          messageStatus(
            { message: { content: content, sendTime: sendTime, messageId: messageId } },
            { user: sender },
            'main',
          );
          messageReceived(message);
        }
        if (type === 'FETCH_REGISTRY_RESPONSE') {
          const subscriptions = JSON.parse(message.body)?.subscriptions;
          subscriptions
            .filter(subscription => subscription.channel.route !== mainRoute) //isBased değilse ile değiştirilecek
            .map(subscription => {
              stompClientRef?.current.subscribe(subscription.channel.route, messageSubscribe => {
                const { type, sender, content, sendTime, receiver, messageId } = JSON.parse(messageSubscribe.body);
                console.log(receiver, activeUser, sender, 'sub');
                if (type === 'CHAT_MESSAGE') {
                  messageStatus(
                    { message: { content: content, sendTime: sendTime, messageId: messageId } },
                    { user: receiver, sender: sender },
                    'sub',
                  );
                  messageReceived(messageSubscribe);
                }
              });
            });
        }
        if (type === 'INVITE_CHANNEL') {
          const { channelId, route } = JSON.parse(message.body);
          setAddUserList(JSON.parse(message.body));
          stompClientRef?.current.subscribe(route, messageGroup => {
            const { type, sender, content, sendTime, receiver, messageId } = JSON.parse(messageGroup.body);
            console.log(type, sender, content, JSON.parse(messageGroup.body), 'invite channel');
            if (type === 'CHAT_MESSAGE') {
              messageStatus(
                { message: { content: content, sendTime: sendTime, messageId: messageId } },
                { user: receiver, sender: sender },
                'invitechannel',
              );
              messageReceived(messageGroup);
            }
          });
          console.log('subscribed by registry message. route : ' + route);
        }
        if (type === 'CHAT_MESSAGE_DELIVERED') {
          if (deliveredMessage) {
            const tempData = [...deliveredMessage];
            tempData.push({ messageId: messageId });
            setDeliveredMessage(tempData);
          } else {
            setDeliveredMessage([{ messageId: messageId }]);
          }
        }
        if (type === 'DELETE_CHAT_MESSAGE') {
          messageStatus(
            { message: { content: content, sendTime: sendTime } },
            { user: receiver, sender: sender },
            'delete',
            messageId,
          );
        }
        if (type === 'SYSTEM_FREEZE_MESSAGE') {
          setActivePage(freeze);
        }
      });
      sendFetchRegistryRequest(userName);
    }
  }, [stompClientRef?.current?.connected]);

  const sendMessage = (messageText, gUserName, isGroup) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      const messageId = crypto.randomUUID();
      if (!isGroup) {
        if (userMessageList?.length > 0) {
          const tempList = [...userMessageList];
          tempList.push({
            message: {
              content: messageText,
              sender: gUserName,
              sendTime: new Date(),
              messageId: messageId,
              deliveredIcon: 'fa-solid fa-check',
            },
          });
          setUserMassageList(tempList);
        } else {
          setUserMassageList([
            {
              message: {
                content: messageText,
                sender: gUserName,
                sendTime: new Date(),
                messageId: messageId,
                deliveredIcon: 'fa-solid fa-check',
              },
            },
          ]);
        }
      }
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          type: 'CHAT_MESSAGE',
          payload: {
            traceId: crypto.randomUUID(),
            isGroup: activeUser?.isGroup || false,
            chatId: 1,
            messageId: messageId,
            sender: gUserName,
            receiver: activeUser?.isGroup ? activeUser?.groupId : activeUser?.userName,
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

  const deleteChatMessage = (chatKey, messageId, gUserName) => {
    stompClientRef.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        type: 'DELETE_CHAT_MESSAGE',
        payload: {
          traceId: crypto.randomUUID(),
          isGroup: activeUser?.isGroup || false,
          chatKey: chatKey,
          messageId: messageId,
          sender: gUserName,
          receiver: activeUser?.isGroup ? activeUser?.groupId : activeUser?.userName,
          sendTime: new Date(),
          type: 'DELETE_CHAT_MESSAGE',
        },
      }),
    });
  };

  const addGroup = (gUserName, data) => {
    stompClientRef.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        type: 'CREATE_CHANNEL_REQUEST',
        payload: {
          traceId: crypto.randomUUID(),
          messageId: crypto.randomUUID(),
          sender: gUserName,
          isGroup: true,
          channelName: data?.channelName,
          invitees: data?.participants,
          type: 'CREATE_CHANNEL_REQUEST',
        },
      }),
    });
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

  return { userMessageList, setUserMassageList, sendMessage, addGroup, deleteChatMessage };
};

export default useWebSocket;
