package com.bol.games.kalaha.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/game")
public class GameController {

	@Autowired
	private SimpMessagingTemplate simpMessagingTemplate;

	@GetMapping("/chat/{chatId}/{message}")
	public ResponseEntity<String> gamePlay(@PathVariable String chatId, @PathVariable String message) {
		log.info("chatId: {}", chatId);
		simpMessagingTemplate.convertAndSend("/queue/chat/" + chatId, message+": received");
		return ResponseEntity.ok(message);
	}
	
	@MessageMapping("/all")
    @SendTo("/queue/chat")
    public Map<String, String> post(@Payload Map<String, String> message) {
        message.put("timestamp", Long.toString(System.currentTimeMillis()));
        log.info("{}",message);
        return message;
    }

}
