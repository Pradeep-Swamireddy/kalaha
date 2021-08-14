import React from "react";
import SockJsClient from "react-stomp";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

class Game extends React.Component {
  state = {
    currentMessage: "",
    move: -1,
    msg: [],
    userId: null,
    topics: null,
    gameId: "",
    game: "",
    kalahaGameBoardUpper: [],
    kalahaGameBoardLower: [],
    opponentsKalaha: 0,
    hostsKalaha: 1,
    opponentId: null,
    gameComplete: false,
    winner: null,
    clientConnected: false,
  };

  updateState = (event, id) => {
    let newValue = event.target.value;
    let newState = { ...this.state };
    newState[id] = newValue;
    this.setState(newState);
  };

  sendMove = () => {
    console.log(this.state.move);
    this.clientRef.sendMessage(
      "/app/play",
      JSON.stringify({
        userId: this.state.userId,
        move: this.state.move,
        gameId: this.state.gameId,
      })
    );
  };

  setGameState = (data) => {
    console.log("game:" + data);
    let newState = { ...this.state };
    newState["game"] = JSON.stringify(data);
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

  render() {
    const circle = {
      display: "flex",
      width: "100px",
      height: "100px",
      "background-color": "#966F33",
      "border-radius": "50%"
    };

    const wrapper = {
      display: "flex",
      "flex-direction": "column",
      "flex-wrap": "wrap",
      "height": "120px",
      "width": "516px"    
    }

    const mancalacircle = {
      display: "flex",
      width: "100px",
      height: "100px",
      "background-color": "green",
      "border-radius": "100%",
      "flex-basis": "110px",
    };
    const text = {
      margin: "auto"
    };

    let lowerboard = this.state.kalahaGameBoardLower.map((item) => {
      return <Col style={circle} md={1}> <p style={text}>{item}</p></Col>;
    });

    let upperboard = this.state.kalahaGameBoardUpper.map((item) => {
      return <Col style={circle} md={1}> <p style={text}>{item}</p></Col>;
    });
    return (
      <div className="d-flex p-2 flex-md-column justify-content-center">
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
        <Container fluid="md">
          <Row>            
          <Col md={3}></Col>
           {upperboard}
          </Row>
          <Row>
            <Col style={mancalacircle} md={3}> <p style={text}>{this.state.opponentsKalaha}</p></Col>
            <Col md={9}></Col>
            <Col style={mancalacircle} md={1}> <p style={text}>{this.state.hostsKalaha}</p></Col>
          </Row>
          <Row>        
          <Col md={3}></Col>    
           {lowerboard}
          </Row>
        </Container>
        <textarea
          id="move"
          value={this.state.move}
          onChange={(event) => this.updateState(event, "move")}
        />

        <Container fluid="md">
          <Row className="justify-content-md-center pb-3 pt-3">
            <Col xs lg="2">
              <Button variant="primary" onClick={this.sendMove}>
                Send Move
              </Button>
            </Col>
          </Row>
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
      </div>
    );
  }
}

export default Game;
