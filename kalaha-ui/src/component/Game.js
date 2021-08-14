import React from 'react';
import SockJsClient from 'react-stomp';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class Game extends React.Component {
  state={
      currentMessage: "",
      move: -1,
      msg: [],      
      userId: null,
      topics: null,
      gameId: "",
      game: "",
      board: {"gameId":"ac2701e4-f8d1-4c2c-9cfd-b9975fefb4ec","hostPlayer":"Guest_1628968471632","opponentPlayer":"Guest_1628968472881","status":"IN_PROGRESS","kalahaGameBoard":[1,5,5,5,0,5,5,1,5,4,4,4,4,0],"winner":null,"hostKalahaIndex":7,"opponentKalahaIndex":0,"sideLength":6,"messages":[],"turn":"Guest_1628968471632"},
      kalahaGameBoardUpper: [],
      kalahaGameBoardLower: [],
      opponentId: null,
      gameComplete: false,
      winner: null,
      clientConnected: false
  }

  updateState = (event, id) => {
    let newValue = event.target.value;
    let newState = {...this.state}
    newState[id] = newValue
    this.setState(newState)
  }

  sendMessage = () => {   
      console.log(this.state.currentMessage);   
      this.clientRef.sendMessage('/app/all', JSON.stringify({userId: this.state.userId, message: this.state.currentMessage, gameId: this.state.gameId}))    
  }

  sendMove = () => {   
    console.log(this.state.move);   
    this.clientRef.sendMessage('/app/play', JSON.stringify({userId: this.state.userId, move: this.state.move, gameId: this.state.gameId}))    
  }

  setGameState = (data) => {
    console.log("game:"+data);
    let newState = {...this.state}
    newState["game"] = JSON.stringify(data)
    newState["kalahaGameBoardLower"] = data["kalahaGameBoard"].slice(0,7);
    newState["kalahaGameBoardUpper"] = data["kalahaGameBoard"].slice(7,14).reverse();
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
        this.setState({ gameId:  res.data, topics: '/queue/game/'+res.data});
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
        this.setState({ gameId:  gameId, topics: '/queue/game/'+gameId});
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
            onMessage={(data) => { console.log(data); this.setGameState(data)}}
            ref={ (client) => { this.clientRef = client }}
            onConnect={ () => { this.setState({ clientConnected: true }) } }
            onDisconnect={ () => { this.setState({ clientConnected: false }) } }
            />
        
        <h5>Game Id(Share this with your opponent): {this.state.gameId}</h5>
        <h5>Your UserID: {this.state.userId}</h5>
        <p>Game Board: {this.state.game}</p>
        <h5>{this.state.kalahaGameBoardUpper}</h5>
        <h5>{this.state.kalahaGameBoardLower}</h5>
        <textarea id="move" value={this.state.move} onChange={event=>this.updateState(event, "move")}/>     

        <Container fluid="md">
        <Row className="justify-content-md-center pb-3 pt-3">
            <Col xs lg="2">
             <Button variant="primary" onClick={this.sendMove}>Send Move</Button>
            </Col>
          </Row>
          <Row className="justify-content-md-center pb-3 pt-3">
            <Col xs lg="2">
             <Button variant="success" onClick={this.createNewGame.bind(this)}>Start New Game</Button>
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

export default Game;