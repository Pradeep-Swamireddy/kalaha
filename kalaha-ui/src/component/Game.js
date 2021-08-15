import React from "react";
import SockJsClient from "react-stomp";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import classes from "./Game.module.css";
import Badge from 'react-bootstrap/Badge'

class Game extends React.Component {
  state = {
    move: -1,
    userId: null,
    topics: null,
    gameId: "",
    game: "",
    turn: null,
    playerType: null,
    kalahaGameBoardUpper: [4,4,4,4,4,4],
    kalahaGameBoardLower: [4,4,4,4,4,4],
    opponentsKalaha: 0,
    hostsKalaha: 0,
    opponentId: null,
    gameComplete: false,
    winner: null,
    clientConnected: false,
    alertMsg: null
  };

  updateState = (event, id) => {
    let newValue = event.target.value;
    let newState = { ...this.state };
    newState[id] = newValue;
    this.setState(newState);
  };

  sendMove = move => {
    console.log(move);
    this.clientRef.sendMessage(
      "/app/play",
      JSON.stringify({
        userId: this.state.userId,
        move: move,
        gameId: this.state.gameId,
      })
    );
  };

  setGameState = (data) => {
    console.log("game:" + data);
    let newState = { ...this.state };
    newState["game"] = JSON.stringify(data);
    newState["turn"] = data["turn"]===this.state.userId?"Your Turn":"Opponent's Turn"
    newState["playerType"] = data["hostPlayer"]===this.state.userId?"HOST":"OPPONENT"

    newState["opponentsKalaha"] = data["kalahaGameBoard"].slice(0,1)
    newState["hostsKalaha"] = data["kalahaGameBoard"].slice(7,8)
    newState["kalahaGameBoardLower"] = data["kalahaGameBoard"].slice(1, 7);
    newState["kalahaGameBoardUpper"] = data["kalahaGameBoard"]
      .slice(8, 14)
      .reverse();
    this.setState(newState);
    console.log(this.state);
  };

  componentDidMount() {
    if (this.state.userId === null) {
      axios.get(`http://localhost:8080/game/register`).then((res) => {
        console.log(res.data);
        this.setState({ userId: res.data });
      });
    }
  }

  createNewGame = () => {
    if (this.state.gameId === "" || this.state.gameComplete === true) {
      axios
        .get("http://localhost:8080/game/new/" + this.state.userId)
        .then((res) => {
          this.setState({
            gameId: res.data,
            topics: "/queue/game/" + res.data,
          });
          console.log(this.state);
        });
    } else {
      console.log("Game still not complete");
    }
  };

  connectToGame = (event) => {
    const gameId = event.target.value;
    axios
      .get(
        "http://localhost:8080/game/join/existing/" +
          this.state.userId +
          "/" +
          gameId
      )
      .then((res) => {
        this.setState({ gameId: gameId, topics: "/queue/game/" + gameId });
        console.log(this.state);
      });
  };

  getIndex = event => {
    console.log("inside get index")
    let newState = { ...this.state };
    let side = null;
    if(this.state.turn==="Your Turn"){
      const move = event.currentTarget.dataset.id;
      if(this.state.playerType==="HOST"){
        side="Lower" 
        if(move>0&&move<7){
          newState["move"] = move;
          this.sendMove(move);
        } else{
          newState["alertMsg"] = "Please click only on "+side+ " side pits"
        }            
      }
      else if(this.state.playerType==="OPPONENT"){
        side="Upper" 
        if(move>7&&move<14){
          newState["move"] = move; 
          this.sendMove(move);
        } else{
          newState["alertMsg"] = "Please click only on "+side+ " side pits"
        }        
      }      
    }
    else{
      newState["alertMsg"] = "Kindly wait for your turn"
    }
    this.setState(newState);
  }

  render() {    
    let lowerboard = this.state.kalahaGameBoardLower.map((item, index) => {
      return <div className={classes.pot} data-id={index+1} key={index+1} onClick={(event)=>this.getIndex(event)}><h1>{item}</h1></div>;
    });

    let upperboard = this.state.kalahaGameBoardUpper.map((item, index) => {
      return <div className={classes.pot} data-id={13-index} key={13-index} onClick={(event)=>this.getIndex(event)}><h1>{item}</h1></div>;
    });

    let turn = this.state.turn!==null?<Badge bg="primary">{this.state.turn}</Badge>:null
              
    return (
      <Container className={classes.flexcontainer} >
        <SockJsClient
          url="http://localhost:8080/gameplay"
          topics={[this.state.topics]}
          onMessage={(data) => {
            console.log(data);
            this.setGameState(data);
          }}
          ref={(client) => {
            this.clientRef = client;
          }}
          onConnect={() => {
            this.setState({ clientConnected: true });
          }}
          onDisconnect={() => {
            this.setState({ clientConnected: false });
          }}
        />

        <h5>Game Id(Share this with your opponent): {this.state.gameId}</h5>
        <h5>Your UserID: {this.state.userId}</h5>
        <p>Game Board: {this.state.game}</p>        
        <Row>
        <Col md={2} />
        <Col>
        <div className={classes.board}>
              <div className={`${classes.section} ${classes.endsection}`}>
                <div className={classes.pot} id="mb"><h1>{this.state.opponentsKalaha}</h1></div> 
              </div>
              <div className={`${classes.section} ${classes.midsection}`}>
                <div className={`${classes.midrow} ${classes.topmid}`}>
                  {upperboard}
                </div>
                <div className={`${classes.midrow} ${classes.botmid}`}>
                  {lowerboard}
                </div>
              </div>
              <div className={`${classes.section} ${classes.endsection}`}>
                  <div className={classes.pot} id="mt"><h1>{this.state.hostsKalaha}</h1></div>        
              </div>
        </div>
        </Col>        
        </Row>        
        <h3 className={classes.blink}>{ this.state.turn} </h3>   
        {turn}    

        <Container fluid="md">          
          <Row className="justify-content-md-center pb-3 pt-3">
            <Col xs lg="2">
              <Button variant="success" onClick={this.createNewGame.bind(this)}>
                Start New Game
              </Button>
            </Col>
          </Row>
          <Row className="justify-content-md-center pb-3">
            <Col xs lg="2">
              <Form.Control
                type="text"
                placeholder="Enter existing Game Id"
                value={this.state.gameId}
                onChange={(event) => this.connectToGame(event)}
              />
            </Col>
          </Row>
        </Container>
      </Container>
    );
  }
}

export default Game;
