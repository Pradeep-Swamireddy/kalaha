package com.bol.games.kalaha.entity;

import java.util.ArrayList;
import java.util.List;

import com.bol.games.kalaha.model.GameStatus;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class Game {

	private final String gameId;
	private final String hostPlayer;
	private String opponentPlayer;
	private GameStatus status;
	private final int[] kalahaGameBoard;
	private String winner;
	private int hostKalahaIndex;
	private int opponentKalahaIndex;
	private List<String> messages = new ArrayList<>();

	public Game(String gameId, String hostPlayer, int[] kalahaGameBoard) {
		this.gameId = gameId;
		this.hostPlayer = hostPlayer;
		this.kalahaGameBoard = kalahaGameBoard;
		this.hostKalahaIndex = 0;
		this.opponentKalahaIndex = ((kalahaGameBoard.length - 2) / 2) + 1;
		this.status = GameStatus.NEW;
	}

	public Boolean waitingForOpponent() {
		if (this.opponentPlayer == null && this.status == GameStatus.NEW)
			return true;
		return false;
	}
	
	public void addMessage(String message) {
		messages.add(message);
	}
}
