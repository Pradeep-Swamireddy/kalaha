package com.bol.games.kalaha.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bol.games.kalaha.exception.InvalidGameIdException;
import com.bol.games.kalaha.service.GameService;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/game")
public class GameController {

	@Autowired
	private SimpMessagingTemplate simpMessagingTemplate;
	
	@Autowired
	private GameService gameService;

	@GetMapping("/chat/{chatId}/{message}")
	public ResponseEntity<String> gamePlay(@PathVariable String chatId, @PathVariable String message) {
		log.info("chatId: {}", chatId);
		simpMessagingTemplate.convertAndSend("/queue/chat/" + chatId, message+": received");
		return ResponseEntity.ok(message);
	}
	
	@MessageMapping("/play")
    @SendTo("/queue/game/{gameId}")
    public void gamePlay(@Payload Map<String, String> message) throws MessagingException, InvalidGameIdException {
		String gameId = message.get("gameId"); 
		String userId = message.get("userId"); 
		String move = message.get("move"); 		
        simpMessagingTemplate.convertAndSend("/queue/game/" + gameId, gameService.gamePlay(gameId, userId, move));
    }
	
	@GetMapping("/register")
	public ResponseEntity<String> register() {
		String randomUserName = "Guest_"+Long.toString(System.currentTimeMillis());
		return ResponseEntity.ok(randomUserName);
	}
	
	@GetMapping("/new/{userId}")
	public String newGame(@PathVariable String userId) {
		return gameService.createNewGame(userId);
	}
	
	@GetMapping("/join/existing/{opponentUserId}/{gameId}")
	public String joinGame(@PathVariable String opponentUserId, @PathVariable String gameId) throws InvalidGameIdException {
		return gameService.joinExistingGame(opponentUserId, gameId);
	}

}
