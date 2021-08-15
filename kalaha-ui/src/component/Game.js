import React from "react";
import SockJsClient from "react-stomp";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import classes from "./Game.module.css";
import Alert from "./Alert";

class Game extends React.Component {
  state = {
    move: -1,
    userId: null,
    topics: null,
    gameId: null,
    game: "",
    turn: null,
    playerType: null,
    status: null,
    kalahaGameBoardUpper: [],
    kalahaGameBoardLower: [],
    opponentsKalaha: 0,
    hostsKalaha: 0,
    opponentId: null,
    gameComplete: false,
    winner: null,
    clientConnected: false,
    alertMsg: null,
  };

  updateState = (event, id) => {
    let newValue = event.target.value;
    let newState = { ...this.state };
    newState[id] = newValue;
    this.setState(newState);
  };

  sendMove = (move) => {
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
    newState["turn"] =
      data["turn"] === this.state.userId ? "Your Turn" : "Opponent's Turn";
    newState["playerType"] =
      data["hostPlayer"] === this.state.userId ? "HOST" : "OPPONENT";
    newState["status"] = data["status"];
    if(data["winner"]!==null){
      if(data["winner"] === this.state.userId){
        newState["turn"] = "Congrats! You won the Game"      
      }
      else if(data["winner"] === "Match Drawn"){
        newState["turn"] = "Match Drawn"      
      }
      else{
        newState["turn"] = "You have lost the Game. Better luck next time"      
      }
    }
    newState["winner"] = data["winner"];    
    newState["opponentsKalaha"] = data["kalahaGameBoard"].slice(0, 1);
    newState["hostsKalaha"] = data["kalahaGameBoard"].slice(7, 8);
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
    if (this.state.gameId === null || this.state.gameComplete === true) {
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
        this.setGameState(res.data);
      });
  };

  getIndex = (event) => {
    console.log("inside get index");
    let newState = { ...this.state };
    let side = null;
    if (this.state.turn === "Your Turn") {
      const move = event.currentTarget.dataset.id;
      if (this.state.playerType === "HOST") {
        side = "Lower";
        if (move > 0 && move < 7) {
          newState["move"] = move;
          this.sendMove(move);
        } else {
          newState["alertMsg"] = "Please click only on " + side + " pits";
        }
      } else if (this.state.playerType === "OPPONENT") {
        side = "Upper";
        if (move > 7 && move < 14) {
          newState["move"] = move;
          this.sendMove(move);
        } else {
          newState["alertMsg"] = "Please click only on " + side + " pits";
        }
      }
    } else {
      newState["alertMsg"] = "Kindly wait for your turn";
    }
    this.setState(newState);
  };

  closeAlert = () => this.setState({ alertMsg: null });

  render() {
    let lowerboard = this.state.kalahaGameBoardLower.map((item, index) => {
      return (
        <div
          className={classes.pot}
          data-id={index + 1}
          key={index + 1}
          onClick={(event) => this.getIndex(event)}
        >
          <h1>{item}</h1>
        </div>
      );
    });

    let upperboard = this.state.kalahaGameBoardUpper.map((item, index) => {
      return (
        <div
          className={classes.pot}
          data-id={13 - index}
          key={13 - index}
          onClick={(event) => this.getIndex(event)}
        >
          <h1>{item}</h1>
        </div>
      );
    });

    let board =
      this.state.status !== null ? (
        <div className={`${classes.board} mt-5`}>
          <div className={`${classes.section} ${classes.endsection}`}>
            <div className={classes.pot} id="mb">
              <h1>{this.state.opponentsKalaha}</h1>
            </div>
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
            <div className={classes.pot} id="mt">
              <h1>{this.state.hostsKalaha}</h1>
            </div>
          </div>
        </div>
      ) : null;

    let options =
      this.state.status === null ? (
        <Container>
          <Row className="justify-content-md-center pb-3 pt-3">
            <Col md={3}>
              <Button variant="success" onClick={this.createNewGame.bind(this)}>
                Start New Game
              </Button>
            </Col>
          </Row>
          <Row className="justify-content-md-center pb-3">
            <Col md lg="2">
              <Form.Control
                type="text"
                placeholder="Enter existing Game Id"
                value={this.state.gameId}
                onChange={(event) => this.connectToGame(event)}
              />
            </Col>
          </Row>
        </Container>
      ) : null;

    return (
      <Container className={classes.flexcontainer}>
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
        {this.state.alertMsg !== null ? (
          <Alert msg={this.state.alertMsg} onclick={this.closeAlert} />
        ) : null}
        {(this.state.status === "NEW"||this.state.status === null) && this.state.gameId !== null ? (
          <h5>Game Id(Share this with your opponent): {this.state.gameId}</h5>
        ) : null}

        <Row>
          <Col md={2} />
          <Col>{board}</Col>
        </Row>
        <h3 className={classes.blink}>{this.state.turn} </h3>
        {options}
      </Container>
    );
  }
}

export default Game;
