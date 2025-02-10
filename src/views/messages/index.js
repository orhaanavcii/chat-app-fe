import { act } from 'react';
import { useEffect, useState } from 'react';

const Messages = props => {
  const [userList, setUserList] = useState();
  const [activeUser, setActiveUser] = useState({ name: 'Harun Acar', userName: 'hacar' });
  const [filter, setFilter] = useState();
  const [filterList, setFilterList] = useState();
  const [messageText, setMessageText] = useState();

  useEffect(() => {
    if (!userList) {
      setUserList([
        { name: 'Harun Acar', userName: 'hacar', icon: 'fa-solid fa-user-doctor' },
        { name: 'Orhan Avcı', userName: 'oavci', icon: 'fa-solid fa-user-ninja' },
        { name: 'Emre Altınayar', userName: 'ealtinayar', icon: 'fa-solid fa-user-gear' },
        { name: 'Enes Döngez', userName: 'edongez', icon: 'fa-solid fa-user-astronaut' },
      ]);
    }
  }, []);

  const sendMessage = () => {
    if (messageText) {
      console.log(messageText);
    }
  };

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
                  {userList?.map(e => {
                    return (
                      <li
                        class={e?.userName === activeUser?.userName ? 'active' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setActiveUser(e)}
                      >
                        <div>
                          <div class="d-flex bd-highlight">
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
                {inMessageTemp(activeUser, 'tesetMessage')}
                {outMessageTemp(activeUser, 'tesetMessage')}
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
                  ></textarea>
                  <div class="input-group-append">
                    <span class="input-group-text send_btn" onClick={() => sendMessage()}>
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
