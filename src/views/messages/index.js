import { act } from 'react';
import { useEffect, useState, useRef } from 'react';
import useWebSocket from './useWebSoket';
import axios from '../../components/api';

const Messages = props => {
  const [userList, setUserList] = useState();
  const [activeUser, setActiveUser] = useState({
    name: 'Harun Acar',
    userName: 'hacar',
    icon: 'fa-solid fa-user-doctor',
  });
  const [filter, setFilter] = useState();
  const [filterList, setFilterList] = useState();
  const [messageText, setMessageText] = useState();
  const userName = sessionStorage.getItem('userName');
  const brokerUrl = 'ws://localhost:8080/ws/websocket'; // WebSocket sunucu adresi
  const [userMessageList, setUserMassageList] = useState();
  const [notification, setNotification] = useState();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const { sendMessage } = useWebSocket(
    brokerUrl,
    userName,
    activeUser,
    setUserMassageList,
    userMessageList,
    scrollToBottom, notification, setNotification
  );
  console.log(notification, "notify")

  useEffect(() => {
    if (!userList) {
      const tempList = [
        { name: 'Harun Acar', userName: 'hacar', icon: 'fa-solid fa-user-doctor', count: 0 },
        { name: 'Orhan Avcı', userName: 'oavci', icon: 'fa-solid fa-user-ninja', count: 0 },
        { name: 'Emre Altınayar', userName: 'ealtinayar', icon: 'fa-solid fa-user-gear', count: 0 },
        { name: 'Enes Döngez', userName: 'edongez', icon: 'fa-solid fa-user-astronaut', count: 0 },
      ];
      setUserList(tempList);
      setFilterList(
        tempList
          ?.filter(e => e?.userName !== sessionStorage.getItem('userName'))
          .map(x => {
            return x;
          }),
      );
    }
  }, []);

  const inMessageTemp = (user, message) => {
    return (
      <div class="d-flex justify-content-start mb-4" style={{ display: 'flex' }}>
        <div class="img_cont" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={user?.icon} style={{ fontSize: '45px', color: 'white' }} />
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
          <i className={user?.icon} style={{ fontSize: '45px', color: 'white' }} />
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (activeUser) {
      if (!userMessageList) {
        axios.get('/message-history/' + sessionStorage.getItem('userName')).then(res => {
          setUserMassageList(res?.data?.data?.find(e => e?.title === activeUser?.userName)?.messages);
          scrollToBottom();
        });
      }
    }
  }, [activeUser]);

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
      setFilterList(filterList?.map((e) => {
        const tempNot = notification?.find((x) => x?.user === e?.userName);
        if (tempNot) { return { ...e, count: tempNot?.count } } else { return e }
      }))
    }
  }, [notification])

  useEffect(() => {
    if (activeUser) {
      if (notification) {
        setFilterList(filterList?.map((e) => {
          const tempNot = notification?.find((x) => x?.user === activeUser?.userName);
          if (tempNot) {
            setNotification(notification?.map((z) => z?.user === activeUser?.userName ? { ...z, count: 0 } : z))
            return { ...e, count: 0 }
          } else { return e }
        }))
      }
    }
  }, [activeUser])

  return (
    <div className="maincontainer">
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
                          setActiveUser(e);
                          setUserMassageList(null);
                        }}
                      >
                        <div>
                          <div class="d-flex bd-highlight">
                            {e?.count ? <div style={{
                              color: "yellow", background: "blue", borderRadius: 100,
                              height: "25px", width: "25px", display: "flex", justifyContent: "center", position: "absolute", zIndex: 999, left: "-1px"
                            }}>{e?.count}</div> : ""}
                            <div
                              class="img_cont"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <i className={e?.icon} style={{ fontSize: '45px', color: 'white' }} />
                              <span class="online_icon"></span>
                            </div>
                            <div class="user_info">
                              <span>{e?.name}</span>
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
                {userMessageList?.map(e => {
                  if (e?.sender === sessionStorage.getItem('userName')) {
                    return outMessageTemp(
                      userList?.find(x => x?.userName === sessionStorage.getItem('userName')),
                      e?.content,
                    );
                  } else {
                    return inMessageTemp(
                      userList?.find(x => x?.userName === e?.sender),
                      e?.content,
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
                        sendMessage(messageText);
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
