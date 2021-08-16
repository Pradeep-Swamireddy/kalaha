package com.bol.games.kalaha.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.bol.games.kalaha.entity.Game;
import com.bol.games.kalaha.exception.InvalidGameIdException;
import com.bol.games.kalaha.exception.InvalidMoveException;
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

	public Game joinExistingGame(String opponentUserId, String gameId) throws InvalidGameIdException {
		if(gamesMap.containsKey(gameId)) {
			Game existingGame = gamesMap.get(gameId);
			if(existingGame.waitingForOpponent()) {
				existingGame.setOpponentPlayer(opponentUserId);
				existingGame.setStatus(GameStatus.IN_PROGRESS);
				log.info(existingGame.toString());
				return existingGame;
			}
			else {
				throw new InvalidGameIdException(String.format("Game with id %s already in progress. Please enter different game id", gameId));
			}
		}
		throw new InvalidGameIdException(String.format("Game with id %s doesnt exist. Please enter different game id", gameId));
	}
	
	public Game gamePlay( String gameId, String userId, String move) throws InvalidGameIdException, NumberFormatException, InvalidMoveException {
		Game existingGame = gamesMap.get(gameId);	
		if(existingGame==null) {
			throw new InvalidGameIdException(String.format("Game with id %s doesnt exist. Please enter different game id", gameId));
		}
		existingGame.validateAndMove(Integer.parseInt(move), userId);		
		return existingGame;
	}

}
