import React, { useState, useEffect } from 'react';
import { Input, Button, Timeline, Modal, Card } from 'antd';
import axios from 'axios';
import './App.css'; // 导入外部的 CSS 文件

const { TextArea } = Input;
const App = () => {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyDivFormat, sethistoryDivFormat] = useState(new Map());

  const [year, setYear] = useState('');
  const [name, setName] = useState('');

  const [cause, setCause] = useState('');
  const [event, setEvent] = useState('');
  const [influnce, setInflunce] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('新建历史事件')
  const [eventId, setEventID] = useState();
  const [screenWidth] = useState(window.innerWidth)

  const showModal = () => {
    setModalTitle('新建历史事件');
    setYear('');
    setName('');
    setCause('');
    setEvent('');
    setInflunce('');
    setIsModalVisible(true);
  };
  const showModifyModal = (history) => {
    setModalTitle('修改');
    setEventID(history.EventID)
    setYear(history.EventYear);
    setName(history.EventName);
    setCause(history.EventCause);
    setEvent(history.Event);
    setInflunce(history.EventInfluence);
    setIsModalVisible(true);
  }

  const handleCancel = () => {
    setIsModalVisible(false);
  };


  function getCurrent() {
    // 发送GET请求
    axios.get('http://3.23.99.16:4000/history_records', {
      headers: {
        'Access-Control-Allow-Origin': '*' // 仅在开发中使用，生产环境需要设置具体的允许域名
      }
    }).then(response => {
      // 请求成功，更新state中的数据
      var array = response.data;
      const sorted = [...array].sort((a, b) => compareDates(a.EventYear, b.EventYear));
      setHistoryRecords(sorted);
    })
      .catch(error => {
        // 请求失败，处理错误
        console.error('Error fetching data:', error);
      });
  }

  useEffect(() => {
    console.log('useEffect getCurrent');
    getCurrent();
  }, []); // 这里的依赖数组为空，表示只在组件首次渲染时调用一次

  useEffect(() => {
    // 生成一个新的映射对象
    console.log('useEffect historyRecords');
    const newObjectMap = new Map();
    historyRecords.forEach(obj => {
      newObjectMap.set(obj.EventID, obj);
    });

    // 更新状态，将映射对象与数组保持同步
    sethistoryDivFormat(newObjectMap);
  }, [historyRecords]);

  function compareDates(dateA, dateB) {
    const [yearA, monthA, dayA] = parseDate(dateA);
    const [yearB, monthB, dayB] = parseDate(dateB);

    if (yearA !== yearB) {
      return yearA - yearB;
    } else if (monthA !== monthB) {
      return monthA - monthB;
    } else {
      return dayA - dayB;
    }
  }

  function parseDate(dateString) {
    const parts = dateString.split('.');
    const year = parseInt(parts[0]);
    const month = parts[1] ? parseInt(parts[1]) : 1; // Default to January if month is not provided
    const day = parts[2] ? parseInt(parts[2]) : 1;   // Default to 1st day if day is not provided
    return [year, month, day];
  }

  // function formatDate(dateString) {
  //   const date = new Date(dateString);
  //   const month = date.getMonth() + 1;
  //   const day = date.getDate();
  //   return `${month}-${day}`;
  // }


  function addHistory() {
    let postData = {
      id: 1,
      name: name,
      year: year,
      cause: cause,
      event: event,
      influence: influnce
    };
    axios.post('http://3.23.99.16:4000/history_records', postData, {
      headers: {
        'Access-Control-Allow-Origin': '*' // 仅在开发中使用，生产环境需要设置具体的允许域名
      }
    }).then(response => {
      // 请求成功，更新state中的数据
      setIsModalVisible(false);
      getCurrent();
    })
      .catch(error => {
        // 请求失败，处理错误
        getCurrent();
        console.error('Error fetching data:', error);
      });
  }

  function modifyHistory() {
    console.log(eventId);
    let postData = {
      eventid: eventId,
      id: 1,
      name: name,
      year: year,
      cause: cause,
      event: event,
      influence: influnce
    };
    axios.put('http://3.23.99.16:4000/history_records', postData, {
      headers: {
        'Access-Control-Allow-Origin': '*' // 仅在开发中使用，生产环境需要设置具体的允许域名
      }
    }).then(response => {
      setIsModalVisible(false);
      // 请求成功，更新state中的数据
      getCurrent();
    })
      .catch(error => {
        // 请求失败，处理错误
        getCurrent();
        console.error('Error fetching data:', error);
      });
  }

  const deleteHistory = () => {
    axios.delete('http://3.23.99.16:4000/history_records', {
      data: { id: eventId }, // 将 id 放在请求体中
      headers: {
        'Access-Control-Allow-Origin': '*' // 仅在开发中使用，生产环境需要设置具体的允许域名
      }
    }).then(response => {
      // 请求成功，处理响应
      setIsModalVisible(false);
      getCurrent();
      // 在删除成功后，你可能需要更新界面或重新加载数据
    }).catch(error => {
      // 请求失败，处理错误
      console.error('Error deleting record:', error);
    });
  };

  const historys = Array.from(historyDivFormat.values()).map(history => {
    const leftOrRight = history.important === 0 ? 'left' : 'right';
    const color = history.important === 0 ? 'blue' : 'red';
    console.log(leftOrRight);

    const historyObject = {
      children: (
        <Card
          className={history.important === 0 ? "history-card" : "history-card-left"}
          onClick={() => showModifyModal(history)}
          hoverable
        >
          <div className="card-line"><p style={{ fontWeight: 'bold'}}>{history.EventName}</p><p></p></div>
          <div className="card-line"><p style={{ fontWeight: 'bold'}}><div className='card-title'>年: </div></p><p>{history.EventYear}</p></div>
          <div className="card-line"><p style={{ fontWeight: 'bold'}}><div className='card-title'>起因: </div></p><p>{history.EventCause}</p></div>
          <div className="card-line"><p style={{ fontWeight: 'bold'}}><div className='card-title'>经过: </div></p><p>{history.Event}</p></div>
          <div className="card-line"><p style={{ fontWeight: 'bold'}}><div className='card-title'>影响: </div></p><p>{history.EventInfluence}</p></div>
        </Card>
      ),
      position: leftOrRight, // Add the 'position' property here,
      color: color
    };

    return historyObject;
  });


  return (
    <>
      <div>
        <Button type="primary" onClick={showModal}>
          新建历史事件
        </Button>
        <Modal
          title={modalTitle}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null} // 不显示底部按钮
        >
          <div>
            <div>
              时间: <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="事情发生在几几年"></input>
              事件简称: <input value={name} onChange={(e) => setName(e.target.value)} placeholder="如 辛亥革命"></input>

              <div
                style={{
                  margin: '24px 0',
                }}
              />
              起因:<TextArea value={cause} onChange={(e) => setCause(e.target.value)} placeholder="想想事情为什么会发生" autoSize />
              经过:<TextArea value={event} onChange={(e) => setEvent(e.target.value)} placeholder="事情的大概经过是什么呢" autoSize />
              结果:<TextArea value={influnce} onChange={(e) => setInflunce(e.target.value)} placeholder="事情发生后，对后续产生了什么样的影响" autoSize />
            </div>
            <div
              style={{
                margin: '24px 0',
              }}
            />
            {modalTitle === '新建历史事件' && (
              <Button type="primary" onClick={addHistory}>
                添加历史事件
              </Button>
            )}
            {modalTitle === '修改' && (
              <div>
                <Button type="primary" onClick={modifyHistory}>
                  修改
                </Button>
                <Button type="primary" onClick={deleteHistory} danger>
                  删除
                </Button>
              </div>
            )}
          </div>
        </Modal>
      </div>
      {(screenWidth <= 768) && (
        <Timeline
          className='one-time-line-mobile'
          items={historys}
        />
      )}
      {(screenWidth > 768 && historys.length < 10) && (
        <Timeline
          className='one-time-line-web'
          mode="alternate"
          items={historys}
        />
      )}
      {(screenWidth > 768 && historys.length >= 10) && (
        <div className='two-time-lines-web'>
          <Timeline
            className='two-time-line'
            mode="alternate"
            items={historys.slice(0, Math.ceil(historys.length / 2))}
          />
          <Timeline
            className='two-time-line'
            mode="alternate"
            items={historys.slice(Math.ceil(historys.length / 2))}
          />
        </div>
      )}
    </>
  );
};
export default App;