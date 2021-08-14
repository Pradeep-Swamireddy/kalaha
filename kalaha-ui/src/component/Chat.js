import React from 'react';
import SockJsClient from 'react-stomp';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { TalkBox } from "react-talk";

class Chat extends React.Component {
  state={
      currentMessage: "",
      msg: [],      
      userId: null,
      topics: null,
      gameId: "",
      game: {},
      opponentId: null,
      gameComplete: false,
      winner: null,
      clientConnected: false
  }

  updateCurrentMessage = event => {
    let newCurrentMsg = event.target.value;
    this.setState({currentMessage: newCurrentMsg})
  }

  sendMessage = () => {   
      console.log(this.state.currentMessage);   
      this.clientRef.sendMessage('/app/all', JSON.stringify({userId: this.state.userId, message: this.state.currentMessage, gameId: this.state.gameId}))    
  }

  setMessage = (data) => {
    console.log("msg:"+data);
    let newState = {...this.state}
    newState["msg"] = data.toString().split(',')
    this.setState(newState)
    console.log(this.state)
  }

  componentDidMount() {
    if(this.state.userId===null){
    axios.get(`http://localhost:8080/game/register`)
      .then(res => {
        console.log(res.data);
        this.setState({ userId:  res.data});
      })
    }
  }

  createNewGame = () => {
    if(this.state.gameId===""||this.state.gameComplete===true){
      axios.get('http://localhost:8080/game/new/'+this.state.userId)
      .then(res => {
        this.setState({ gameId:  res.data, topics: '/queue/chat/'+res.data});
        console.log(this.state);
      })
    }
    else{
      console.log('Game still not complete');
    }
  }

  connectToGame = event => {
    const gameId = event.target.value;
    axios.get('http://localhost:8080/game/join/existing/'+this.state.userId+'/'+gameId)
      .then(res => {
        this.setState({ gameId:  gameId, topics: '/queue/chat/'+gameId});
        console.log(this.state);
      })
  }

  render() {
    
    let chat =  <ul>
                {this.state.msg?                
                this.state.msg.map(item=>{return <li>{item}</li>}):"else"}
                </ul>                
                
    return (
      <div>
        

        <SockJsClient url='http://localhost:8080/gameplay' topics={[this.state.topics]}
            onMessage={(data) => { console.log(data); this.setMessage(data)}}
            ref={ (client) => { this.clientRef = client }}
            onConnect={ () => { this.setState({ clientConnected: true }) } }
            onDisconnect={ () => { this.setState({ clientConnected: false }) } }
            />
        
        <h4>Game Id: {this.state.gameId}</h4>
        <h4>Your UserID: {this.state.userId}</h4>
        <p>Chat: {chat}</p>
        <textarea value={this.state.currentMessage} onChange={event=>this.updateCurrentMessage(event)}/>     

        <Container fluid="md">
        <Row className="justify-content-md-center pb-3 pt-3">
            <Col xs lg="2">
             <Button variant="primary" onClick={this.sendMessage}>Send Message</Button>
            </Col>
          </Row>
          <Row className="justify-content-md-center pb-3 pt-3">
            <Col xs lg="2">
             <Button variant="primary" onClick={this.createNewGame.bind(this)}>New Game</Button>
            </Col>
          </Row>
          <Row className="justify-content-md-center pb-3" >  
            <Col xs lg="2">      
              <Form.Control type="text" placeholder="Enter existing Game Id" value={this.state.gameId} onChange={event => this.connectToGame(event)}/>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Chat;