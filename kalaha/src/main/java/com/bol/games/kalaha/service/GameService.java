package com.bol.games.kalaha.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.bol.games.kalaha.entity.Game;
import com.bol.games.kalaha.exception.InvalidGameIdException;
import com.bol.games.kalaha.model.GameStatus;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GameService {
	
	private Map<String, Game> gamesMap = new HashMap<>();
	
	public String createNewGame(String userId) {
		UUID gameId = UUID.randomUUID();
		Game newGame = new Game(gameId.toString(), userId, new int[14]);
		log.info(newGame.toString());
		gamesMap.put(newGame.getGameId(), newGame);
		return newGame.getGameId();
	}

	public String joinExistingGame(String opponentUserId, String gameId) throws InvalidGameIdException {
		if(gamesMap.containsKey(gameId)) {
			Game existingGame = gamesMap.get(gameId);
			if(existingGame.waitingForOpponent()) {
				existingGame.setOpponentPlayer(opponentUserId);
				existingGame.setStatus(GameStatus.IN_PROGRESS);
				log.info(existingGame.toString());
				return gameId;
			}
			else {
				throw new InvalidGameIdException(String.format("Game with id %s already in progress. Please enter different game id", gameId));
			}
		}
		throw new InvalidGameIdException(String.format("Game with id %s doesnt exist. Please enter different game id", gameId));
	}
	
	public List<String> gamePlay( String gameId, Map<String, String> message) {
		Game existingGame = gamesMap.get(gameId);
		existingGame.addMessage(message.get("userId")+"- "+message.get("message"));
		return existingGame.getMessages();
	}

}
