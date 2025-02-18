import { act } from 'react';
import { useEffect, useState, useRef } from 'react';
import useWebSocket from './useWebSoket';
import axios from '../../components/api';

const Messages = props => {
  const [userList, setUserList] = useState();
  const [activeUser, setActiveUser] = useState();
  const [filter, setFilter] = useState();
  const [filterList, setFilterList] = useState();
  const [messageText, setMessageText] = useState();
  const userName = sessionStorage.getItem('userName');
  const brokerUrl = 'ws://localhost:8080/ws/websocket'; // WebSocket sunucu adresi
  const [userMessageList, setUserMassageList] = useState();
  const [notification, setNotification] = useState();
  const [addUserList, setAddUserList] = useState();
  const messagesEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');
  const [type, setType] = useState('');
  const [newNotification, setNewNotification] = useState('');
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const messageStatus = (message, reciever, type) => {
    console.log(message, reciever, 'üst');
    setNewMessage(message);
    setType(type);
    setNewNotification(reciever);
  };

  const { sendMessage, addGroup } = useWebSocket(
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
  );

  useEffect(() => {
    if (activeUser) {
      if (newNotification && newMessage) {
        console.log('noti user:', newNotification);
        console.log('active user:', activeUser);
        console.log('type:', type);
        if (
          activeUser?.isGroup
            ? newNotification?.user === activeUser?.groupId
            : newNotification?.user === activeUser?.userName
        ) {
          if (userMessageList?.length > 0) {
            const tempList = [...userMessageList];
            tempList.push({
              ...newMessage,
              sender: activeUser?.isGroup
                ? type === 'invitechannel' || type === 'sub'
                  ? newNotification?.sender === sessionStorage.getItem('userName')
                    ? sessionStorage.getItem('userName')
                    : newNotification?.sender
                  : activeUser?.groupId
                : activeUser?.userName,
            });
            setUserMassageList(tempList);
          } else {
            setUserMassageList([
              {
                ...newMessage,
                sender: activeUser?.isGroup
                  ? type === 'invitechannel' || type === 'sub'
                    ? newNotification?.sender === sessionStorage.getItem('userName')
                      ? sessionStorage.getItem('userName')
                      : newNotification?.sender
                    : activeUser?.groupId
                  : activeUser?.userName,
              },
            ]);
          }
          scrollToBottom();
        } else {
          if (notification?.find(e => newNotification?.user === e?.user)) {
            setNotification(
              notification?.map(e => (e?.user === newNotification?.user ? { ...e, count: e?.count + 1 } : e)),
            );
          } else {
            const tempNot = notification ? [...notification] : [];
            tempNot.push({ user: newNotification?.user, count: 1 });
            setNotification(tempNot);
          }
        }
      }
    }
  }, [newNotification]);

  useEffect(() => {
    if (filterList) {
      if (!activeUser) {
        setTimeout(() => {
          setActiveUser(filterList[0]);
        }, 1000);
      }
    }
  }, [activeUser, filterList]);

  useEffect(() => {
    if (addUserList) {
      console.log(addUserList, 'addUserList');
      setFilterList([
        ...filterList,
        {
          name: addUserList?.channelName,
          userName: addUserList?.channelName,
          icon: 'fa-solid fa-user',
          count: 0,
          isGroup: true,
          groupId: addUserList?.channelId,
        },
      ]);
      console.log(addUserList, 'add');
    }
  }, [addUserList]);

  // useEffect(() => {
  //   if (!userList) {
  //     const tempList = [
  //       { name: 'Harun Acar', userName: 'hacar', icon: 'fa-solid fa-user-doctor', count: 0 },
  //       { name: 'Orhan Avcı', userName: 'oavci', icon: 'fa-solid fa-user-ninja', count: 0 },
  //       { name: 'Emre Altınayar', userName: 'ealtinayar', icon: 'fa-solid fa-user-gear', count: 0 },
  //       { name: 'Enes Döngez', userName: 'edongez', icon: 'fa-solid fa-user-astronaut', count: 0 },
  //       {
  //         name: 'group',
  //         userName: 'a3e5bf15-8922-4adb-8e3f-c8607b127a56',
  //         icon: 'fa-solid fa-user-astronaut',
  //         count: 0,
  //         isGroup: true,
  //       },
  //     ];
  //     setUserList(tempList);
  //     setFilterList(
  //       tempList
  //         ?.filter(e => e?.userName !== sessionStorage.getItem('userName'))
  //         .map(x => {
  //           return x;
  //         }),
  //     );
  //   }
  // }, []);

  const inMessageTemp = (user, message) => {
    return (
      <div class="d-flex justify-content-start mb-4" style={{ display: 'flex' }}>
        <div class="img_cont" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div id="profileImage" style={{ margin: '12px auto 5px auto' }}>
            {user?.userName[0]?.toUpperCase() + user?.userName[1]?.toUpperCase()}
          </div>
        </div>
        <div class="msg_cotainer" style={{ marginTop: '10px' }}>
          {message}
        </div>
      </div>
    );
  };

  const outMessageTemp = (user, message) => {
    return (
      <div class="d-flex justify-content-end mb-4">
        <div class="msg_cotainer">{message}</div>
        <div class="img_cont" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div id="profileImage" style={{ margin: '12px auto 5px auto' }}>
            {user?.userName[0]?.toUpperCase() + user?.userName[1]?.toUpperCase()}
          </div>{' '}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (activeUser) {
      if (!userMessageList) {
        axios.get('/message-history/' + sessionStorage.getItem('userName')).then(res => {
          const tempMessage = res.data?.data?.find(e => {
            if (
              !activeUser?.isGroup &&
              !e?.groupChat &&
              e?.participants?.find(x => x?.username === activeUser?.userName)
            ) {
              return e;
            } else {
              if (activeUser?.isGroup && e?.groupChat && e?.chatKey === activeUser?.groupId) {
                return e;
              }
            }
          });
          setUserMassageList(tempMessage?.messages);
          scrollToBottom();
        });
      }
    }
  }, [activeUser]);

  useEffect(() => {
    axios.get('/users').then(res => {
      const response = res.data?.data;
      const tempData = [];
      response?.forEach(e => {
        if (e?.username === sessionStorage.getItem('userName')) {
          e?.subscriptions?.forEach(r => {
            if (!r?.channel?.base) {
              tempData.push({
                ...r?.channel,
                icon: 'fa-solid fa-user-doctor',
                groupId: r?.channel?.channelId,
                userName: r?.channel?.channelName,
                isGroup: true,
              });
            }
          });
        } else {
          tempData.push({ ...e, icon: 'fa-solid fa-user-doctor', userName: e?.username, isGroup: false });
        }
      });
      setUserList(tempData);
      setFilterList(tempData);
    });
  }, []);

  useEffect(() => {
    setUserMassageList(null);
  }, [activeUser]);

  useEffect(() => {
    if (userMessageList) {
      scrollToBottom();
    }
  }, [userMessageList]);

  useEffect(() => {
    if (notification) {
      setFilterList(
        filterList?.map(e => {
          const tempNot = notification?.find(x => x?.user === e?.userName || x?.user === e?.groupId);
          if (tempNot) {
            return { ...e, count: tempNot?.count };
          } else {
            return e;
          }
        }),
      );
    }
  }, [notification]);

  useEffect(() => {
    if (activeUser) {
      if (notification) {
        setFilterList(
          filterList?.map(e => {
            const tempNot = notification?.find(
              x => x?.user === activeUser?.userName || x?.user === activeUser?.groupId,
            );
            if (tempNot) {
              setNotification(
                notification?.map(z =>
                  z?.user === activeUser?.userName
                    ? { ...z, count: 0 }
                    : z?.user === activeUser?.groupId
                    ? { ...z, count: 0 }
                    : z,
                ),
              );
              return { ...e, count: 0 };
            } else {
              return e;
            }
          }),
        );
      }
    }
  }, [activeUser]);

  return (
    <div className="maincontainer">
      <input
        type="button"
        onClick={() =>
          addGroup(sessionStorage.getItem('userName'), {
            channelName: 'test grup' + Math.floor(Math.random() * (100 - 1 + 1) + 1),
            participants: [
              {
                username: 'edongez',
                permissions: ['READ', 'WRITE'],
              },
              {
                username: 'oavci',
                permissions: ['READ', 'WRITE'],
              },
              {
                username: 'hacar',
                permissions: ['READ'],
              },
            ],
          })
        }
        value="grup ekle"
      />
      <div class="container-fluid h-50">
        <div class="row justify-content-center h-100">
          <div class="col-md-4 col-xl-3 chat">
            <div class="card mb-sm-3 mb-md-0 contacts_card">
              <div class="card-header">
                <div class="input-group">
                  <input
                    type="text"
                    placeholder="Search..."
                    name=""
                    class="form-control search"
                    onChange={e => setFilter(e?.target.value)}
                  />
                  <div class="input-group-prepend">
                    <span class="input-group-text search_btn">
                      <i class="fas fa-search"></i>
                    </span>
                  </div>
                </div>
              </div>
              <div class="card-body contacts_body">
                <ul class="contacts">
                  {filterList?.map(e => {
                    return (
                      <li
                        class={e?.userName === activeUser?.userName ? 'active' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          if (
                            activeUser?.isGroup
                              ? e?.groupId !== activeUser?.groupId
                              : e?.userName !== activeUser?.userName
                          ) {
                            console.log(e, 'active');
                            setActiveUser(e);
                            setUserMassageList(null);
                          }
                        }}
                      >
                        <div>
                          <div class="d-flex bd-highlight">
                            {e?.count ? (
                              <div
                                style={{
                                  color: 'yellow',
                                  background: 'blue',
                                  borderRadius: 100,
                                  height: '25px',
                                  width: '25px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  zIndex: 999,
                                  left: '-1px',
                                }}
                              >
                                {e?.count}
                              </div>
                            ) : (
                              ''
                            )}
                            <div
                              class="img_cont"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <i className={e?.icon} style={{ fontSize: '45px', color: 'white' }} />
                              <span class="online_icon"></span>
                            </div>
                            <div class="user_info">
                              <span>{e?.userName}</span>
                              <p>{e?.userName}</p>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div class="card-footer"></div>
            </div>
          </div>
          <div class="col-md-8 col-xl-6 chat">
            <div class="card">
              <div class="card-header msg_head">
                <div class="d-flex bd-highlight">
                  <div class="img_cont">
                    <div class="img_cont" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={activeUser?.icon} style={{ fontSize: '45px', color: 'white' }} />
                    </div>
                  </div>
                  <div class="user_info">
                    <span>Chat with {activeUser?.name}</span>
                    <p>1767 Messages</p>
                  </div>
                </div>
              </div>
              <div class="card-body msg_card_body">
                {userMessageList
                  ?.sort((a, b) => a?.messages?.sendTime > b?.messages?.sendTime)
                  ?.map(e => {
                    if (
                      e?.message?.sender === sessionStorage.getItem('userName') ||
                      e?.sender === sessionStorage.getItem('userName')
                    ) {
                      return outMessageTemp({ userName: sessionStorage.getItem('userName') }, e?.message?.content);
                    } else {
                      return inMessageTemp(
                        userList?.find(x => x?.userName === e?.message?.sender || x?.userName === e?.sender),
                        e?.message?.content,
                      );
                    }
                  })}
                <div ref={messagesEndRef} />
              </div>
              <div class="card-footer">
                <div class="input-group">
                  <div class="input-group-append">
                    <span class="input-group-text attach_btn">
                      <i class="fas fa-paperclip"></i>
                    </span>
                  </div>
                  <textarea
                    name=""
                    class="form-control type_msg"
                    placeholder="Type your message..."
                    onChange={e => setMessageText(e?.target.value)}
                    value={messageText || ''}
                  ></textarea>
                  <div class="input-group-append">
                    <span
                      class="input-group-text send_btn"
                      onClick={() => {
                        sendMessage(messageText, sessionStorage.getItem('userName'), activeUser?.isGroup);
                        setMessageText('');
                        scrollToBottom();
                      }}
                    >
                      <i class="fas fa-location-arrow"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
