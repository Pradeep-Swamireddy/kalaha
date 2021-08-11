import React from 'react';
import SockJsClient from 'react-stomp';

class Chat extends React.Component {
  state={
      msg: "default",
      timestamp: ""
  }

  sendMessage = (event) => {
    this.setState({msg: event.target.value})
    console.log(this.state.msg)
    console.log(event.target.value)
    this.clientRef.sendMessage('/app/all', JSON.stringify(this.state));
  }

  onMessageReceive = (msg, topic) => {
    this.setState(prevState => ({
        msg: [...prevState.msg, msg]
    }));
  }

  setMessage = (data) => {
    this.setState(data)
  }

  render() {
    return (
      <div>
        <SockJsClient url='http://localhost:8080/gameplay' topics={['/queue/chat']}
            onMessage={(msg) => { console.log(msg); this.setMessage(msg)}}
            ref={ (client) => { this.clientRef = client }} />
        <input type="text" value={this.msg} onChange={event=>this.sendMessage(event)}/>
        <h4>{this.state.msg}</h4>
        <h4>{this.state.timestamp}</h4>
      </div>
    );
  }
}

export default Chat;