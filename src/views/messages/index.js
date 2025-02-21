import { act } from 'react';
import { useEffect, useState, useRef } from 'react';
import useWebSocket from './useWebSoket';
import axios from '../../components/api';
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react';
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { format } from 'date-fns';

const Messages = props => {
  const [userList, setUserList] = useState();
  const [activeUser, setActiveUser] = useState();
  const [filter, setFilter] = useState();
  const [filterList, setFilterList] = useState();
  const [messageText, setMessageText] = useState();
  const userName = sessionStorage.getItem('userName');
  const brokerUrl = 'ws://localhost:8080/ws/websocket'; // WebSocket sunucu adresi
  const [userMessageList, setUserMassageList] = useState();
  const [activeChatKey, setActiveChatKey] = useState();
  const [notification, setNotification] = useState();
  const [addUserList, setAddUserList] = useState();
  const messagesEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');
  const [type, setType] = useState('');
  const [newNotification, setNewNotification] = useState('');
  const [deleteMessageId, setDeleteMessageId] = useState('');
  const [activePage, setActivePage] = useState(false);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const [visible, setVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectUserList, setSelectUserList] = useState();
  const [selectedUsers, setSelectedUsers] = useState(null);
  const [deliveredMessage, setDeliveredMessage] = useState(null);
  const toast = useRef(null);
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });
  const [viewWriting, setViewWriting] = useState(false);

  const messageStatus = (message, reciever, type, messageId) => {
    setDeleteMessageId(messageId);
    setNewMessage(message);
    setType(type);
    setNewNotification(reciever);
  };

  const { sendMessage, addGroup, deleteChatMessage, messageReceivedContol, messageWriting } = useWebSocket(
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
    setViewWriting,
    viewWriting,
  );

  const handleContextMenu = (event, id) => {
    if (!activePage) {
      event.preventDefault();
      setMenu({ visible: true, x: event.clientX, y: event.clientY, id: id });
    }
  };

  const handleClick = () => {
    setMenu({ ...menu, visible: false });
  };

  useEffect(() => {
    setUserMassageList(null);
  }, [activeUser]);

  useEffect(() => {
    if (userMessageList) {
      scrollToBottom();
    }
  }, [userMessageList]);

  useEffect(() => {
    if (userList?.length > 0) {
      setSelectUserList(
        userList
          ?.filter(e => !e?.groupId)
          .map(x => {
            return { name: x.userName };
          }),
      );
    }
  }, [userList]);

  useEffect(() => {
    if (filter) {
      setFilterList(userList?.filter(e => e?.userName?.toLowerCase()?.includes(filter?.toString()?.toLowerCase())));
    } else {
      setFilterList(userList);
    }
  }, [filter]);

  useEffect(() => {
    if (activeUser) {
      if (newNotification && newMessage) {
        console.log('noti user:', newNotification);
        console.log('active user:', activeUser);
        console.log('type:', type);
        console.log('delete:', deleteMessageId);
        if (type === 'delete') {
          if (deleteMessageId) {
            setUserMassageList(userMessageList?.filter(e => e?.message?.messageId !== deleteMessageId));
          }
        }
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
    if (deliveredMessage) {
      setUserMassageList(
        userMessageList?.map(e =>
          deliveredMessage?.find(x => x?.messageId === e?.message?.messageId)
            ? { ...e, message: { ...e?.message, deliveredIcon: 'fa-solid fa-check-double' } }
            : { ...e },
        ),
      );
    }
  }, [deliveredMessage]);

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
      setUserList([
        ...userList,
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

  const inMessageTemp = (user, message, time, delivered) => {
    return (
      <div class="d-flex justify-content-start mb-4" style={{ display: 'flex' }}>
        <div class="img_cont" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div id="profileImage">{user?.userName[0]?.toUpperCase() + user?.userName[1]?.toUpperCase()}</div>
        </div>
        <div class="msg_cotainer" style={{ display: 'flex', justifyContent: 'start' }}>
          <div>{message}</div>
          <div
            style={{
              fontSize: '10px',
              marginLeft: 10,
              display: 'flex',
              alignItems: 'end',
              position: 'relative',
              bottom: '-5px',
              justifyContent: 'end',
              width: message?.length > 22 ? 80 : 45,
            }}
          >
            {format(new Date(time), 'HH:mm')}{' '}
          </div>
        </div>
      </div>
    );
  };

  const outMessageTemp = (user, message, time, delivered, id, icon) => {
    return (
      <div class="d-flex justify-content-end mb-4">
        <div
          class="msg_cotainer"
          style={{ display: 'flex', justifyContent: 'start' }}
          onContextMenu={event => handleContextMenu(event, id)}
        >
          <div>{message}</div>
          <div
            style={{
              fontSize: '10px',
              marginLeft: 10,
              display: 'flex',
              alignItems: 'end',
              position: 'relative',
              bottom: '-5px',
              justifyContent: 'end',
              width: message?.length > 22 ? 80 : 45,
            }}
          >
            {time && format(new Date(time), 'HH:mm')}
            <i
              class={icon ? icon : 'fa-solid fa-check-double'}
              style={{ margin: '0px 0px 0px 5px', position: 'relative', top: '-2px' }}
            ></i>
            {menu?.id === id && menu.visible && (
              <ul
                style={{
                  position: 'fixed',
                  top: `${menu.y}px`,
                  left: `${menu.x}px`,
                  backgroundColor: 'white',
                  boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
                  padding: '10px',
                  borderRadius: '5px',
                  listStyle: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => deleteMessage(id)}
              >
                <li>Sil</li>
              </ul>
            )}
          </div>
        </div>
        <div class="img_cont" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div id="profileImage">{user?.userName[0]?.toUpperCase() + user?.userName[1]?.toUpperCase()}</div>
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
          setActiveChatKey(tempMessage?.chatKey);
          const tempMessageList = [];
          tempMessage?.messages?.forEach(e => {
            if (e?.messageOwnerDetails?.find(x => !x?.delivered)) {
              tempMessageList.push({ ...e, message: { ...e?.message, deliveredIcon: 'fa-solid fa-check' } });
            } else {
              tempMessageList.push({ ...e, message: { ...e?.message, deliveredIcon: 'fa-solid fa-check-double' } });
            }
          });
          setUserMassageList(tempMessageList);

          tempMessage?.messages?.forEach(e => {
            if (
              e?.messageOwnerDetails?.find(
                x => !x?.delivered && x?.owner?.username === sessionStorage.getItem('userName'),
              )
            ) {
              messageReceivedContol(
                e?.message?.traceId,
                e?.message?.receiver,
                e?.message?.sender,
                e?.message?.messageId,
                false,
              );
            }
          });
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
                icon: 'fa-solid fa-users',
                groupId: r?.channel?.channelId,
                userName: r?.channel?.channelName,
                isGroup: true,
                lastMessageTime: new Date(),
              });
            }
          });
        } else {
          tempData.push({
            ...e,
            icon: 'fa-solid fa-user',
            userName: e?.username,
            isGroup: false,
            lastMessageTime: new Date(),
          });
        }
      });
      setUserList(tempData);
      setFilterList(tempData);
    });
  }, []);

  useEffect(() => {
    if (notification) {
      setFilterList(
        filterList?.map(e => {
          const tempNot = notification?.find(x => x?.user === e?.userName || x?.user === e?.groupId);
          if (tempNot) {
            return { ...e, count: tempNot?.count, lastMessageTime: tempNot?.count ? new Date() : e?.lastMessageTime };
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

  const deleteAllMessage = username => {
    axios.delete(`/message-history/delete/${activeChatKey}/${username}`).then(res => {
      setUserMassageList(null);
    });
  };

  const deleteMessage = messageId => {
    axios.delete(`/message-history/delete/all/${activeChatKey}/${messageId}`).then(res => {
      if (res.data?.status === 200) {
        deleteChatMessage(activeChatKey, messageId, activeUser?.groupId || activeUser?.userName);
        setUserMassageList(userMessageList?.filter(e => e?.message?.messageId !== messageId));
      }
    });
  };

  return (
    <div className="maincontainer">
      <Toast ref={toast} />
      <div class="container-fluid h-50" onClick={handleClick}>
        <div class="row justify-content-center h-100">
          <div class="col-md-12 col-lg-4 col-xl-3 chat" style={{ marginBottom: 15 }}>
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
                  <div style={{ marginLeft: 15 }}>
                    <span
                      class="input-group-text send_btn"
                      style={{ borderRadius: 15 }}
                      onClick={() => {
                        setGroupName('');
                        setSelectedUsers(null);
                        setVisible(true);
                      }}
                    >
                      <i class="fa fa-plus-circle"></i>
                    </span>
                  </div>
                </div>
              </div>
              <div class="card-body contacts_body">
                <ul class="contacts">
                  {filterList
                    ?.sort((a, b) => {
                      return new Date(b?.lastMessageTime)?.getTime() - new Date(a?.lastMessageTime)?.getTime();
                    })
                    ?.map(e => {
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
                                <span>{e?.isGroup ? e?.userName : e?.userFullName}</span>
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
          <div class="col-md-12 col-lg-8 col-xl-6 chat">
            <div class="card">
              <div class="card-header msg_head">
                <div class="d-flex bd-highlight">
                  <div class="img_cont">
                    <div class="img_cont" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i
                        className={activeUser?.isGroup ? 'fa-solid fa-users' : 'fa-solid fa-user'}
                        style={{ fontSize: '45px', color: 'white' }}
                      />
                    </div>
                  </div>
                  <div class="user_info2">
                    <span>Chat with {activeUser?.isGroup ? activeUser?.userName : activeUser?.userFullName}</span>
                    <p>{userMessageList?.length ? userMessageList?.length + ' ' + 'Messages' : ''}</p>
                  </div>
                  <div
                    style={{
                      display: userMessageList?.length ? 'flex' : 'none',
                      justifyContent: 'end',
                      width: '100%',
                      position: 'absolute',
                      left: '-20px',
                      top: '34px',
                      cursor: 'pointer',
                    }}
                    onClick={() => !activePage && deleteAllMessage(sessionStorage.getItem('userName'))}
                  >
                    <i class="fa-solid fa-trash-can" style={{ color: 'white' }}></i>
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
                      return outMessageTemp(
                        { userName: sessionStorage.getItem('userName') },
                        e?.message?.content,
                        e?.message?.sendTime,
                        true,
                        e?.message?.messageId || Math.random(),
                        e?.message?.deliveredIcon,
                      );
                    } else {
                      return inMessageTemp(
                        userList?.find(x => x?.userName === e?.message?.sender || x?.userName === e?.sender),
                        e?.message?.content,
                        e?.message?.sendTime,
                        true,
                      );
                    }
                  })}
                <div ref={messagesEndRef} />
              </div>
              <div class="card-footer">
                <div
                  style={{
                    color: 'white',
                    marginLeft: 40,
                    marginBottom: 2,
                    display:
                      viewWriting?.sender !== sessionStorage.getItem('userName')
                        ? viewWriting?.writing
                          ? 'block'
                          : 'none'
                        : 'none',
                  }}
                >
                  Yazıyor..
                </div>
                <div class="input-group">
                  <div class="input-group-append">
                    <span class="input-group-text attach_btn">
                      <i class="fas fa-paperclip"></i>
                    </span>
                  </div>
                  <textarea
                    name=""
                    disabled={activePage}
                    class="form-control type_msg"
                    placeholder="Type your message..."
                    onChange={e => {
                      setMessageText(e?.target.value);
                      if (e?.target?.value) {
                        if (!viewWriting?.writing) {
                          messageWriting(
                            true,
                            sessionStorage.getItem('userName'),
                            activeUser?.userName,
                            activeUser?.isGroup,
                          );
                        }
                      } else {
                        messageWriting(
                          false,
                          sessionStorage.getItem('userName'),
                          activeUser?.userName,
                          activeUser?.isGroup,
                        );
                      }
                    }}
                    value={messageText || ''}
                  ></textarea>
                  <div class="input-group-append">
                    <span
                      class="input-group-text send_btn"
                      onClick={() => {
                        if (!activePage) {
                          sendMessage(messageText, sessionStorage.getItem('userName'), activeUser?.isGroup);
                          setMessageText('');
                          scrollToBottom();
                          setFilterList(
                            filterList?.map(e => {
                              if (e?.userName === activeUser?.userName) {
                                return { ...e, lastMessageTime: new Date() };
                              } else {
                                return e;
                              }
                            }),
                          );
                        }
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
      <CModal visible={visible} onClose={() => setVisible(false)} aria-labelledby="LiveDemoExampleLabel">
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Grup Oluştur</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div style={{ dispaly: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', width: '100%', marginBottom: 20 }}>
              <InputText
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                style={{ width: '100%' }}
                placeholder="Grup Adı"
              />
            </div>
            <div style={{ display: 'flex', width: '100%' }}>
              <MultiSelect
                value={selectedUsers}
                onChange={e => setSelectedUsers(e.value)}
                options={selectUserList || []}
                optionLabel="name"
                style={{ width: '100%' }}
                placeholder="Kişi Seç"
                maxSelectedLabels={3}
              />
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Kapat
          </CButton>
          <CButton
            color="primary"
            onClick={() => {
              if (groupName && selectedUsers?.length > 0) {
                axios
                  .post('/channels/create', {
                    channelName: groupName,
                    invitees: [
                      ...selectedUsers?.map(e => {
                        return {
                          username: e?.name,
                          permissions: ['READ', 'WRITE'],
                        };
                      }),
                      {
                        username: sessionStorage.getItem('userName'),
                        permissions: ['READ', 'WRITE'],
                      },
                    ],
                  })
                  .then(res => {
                    toast.current.show({ severity: 'success', summary: 'İşlem Başarılı', detail: 'Grup oluşturuldu.' });
                  });
                setVisible(false);
              } else {
                toast.current.show({ severity: 'error', summary: 'Dikkat', detail: 'Kişi ve grup adı giriniz!' });
              }
            }}
          >
            Kaydet
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Messages;
