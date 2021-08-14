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
	private static final int COINS_PER_HOLE = 4;
	private String winner;
	private int hostKalahaIndex;
	private int opponentKalahaIndex;
	private int sideLength;
	private List<String> messages = new ArrayList<>();
	private String turn;

	public Game(String gameId, String hostPlayer, int[] kalahaGameBoard) {
		this.gameId = gameId;
		this.hostPlayer = hostPlayer;
		this.kalahaGameBoard = kalahaGameBoard;
		this.hostKalahaIndex = 0;
		this.sideLength = (kalahaGameBoard.length - 2) / 2;
		this.opponentKalahaIndex = sideLength + 1;
		this.status = GameStatus.NEW;
		initializeBoard();
		turn = hostPlayer;
	}

	private void initializeBoard() {
		int size = kalahaGameBoard.length;
		for (int i = 0; i < size; i++) {
			if (i != hostKalahaIndex && i != opponentKalahaIndex)
				kalahaGameBoard[i] = COINS_PER_HOLE;
		}
	}

	public Boolean waitingForOpponent() {
		if (this.opponentPlayer == null && this.status == GameStatus.NEW)
			return true;
		return false;
	}

	public void addMessage(String message) {
		messages.add(message);
	}

	public void validateAndMove(int move, String moveBy) {
		if (status != GameStatus.COMPLETE && turn.equalsIgnoreCase(moveBy) && move < kalahaGameBoard.length && move > 0
				&& kalahaGameBoard[move] > 0) {
			if (moveBy.equalsIgnoreCase(hostPlayer)
					&& (move > hostKalahaIndex && move <= hostKalahaIndex + sideLength)) {
				performMove(move, moveBy, hostKalahaIndex);
			} else if (moveBy.equalsIgnoreCase(opponentPlayer)
					&& (move > opponentKalahaIndex && move <= opponentKalahaIndex + sideLength)) {
				performMove(move, moveBy, opponentKalahaIndex);
			}
		}
	}

	private void performMove(int move, String player, int playerKalahaIndex) {
		int coins = kalahaGameBoard[move];
		int index = -1;
		for (int i = 1; i <= coins; i++) {
			index = (move + i) % kalahaGameBoard.length;
			kalahaGameBoard[index] += 1;
			kalahaGameBoard[move] -= 1;
		}

		if (index != playerKalahaIndex && index != opponentKalahaIndex && kalahaGameBoard[index] == 1) {
			int oppositeIndex = findOppositeIndex(kalahaGameBoard, index);
			kalahaGameBoard[playerKalahaIndex] += kalahaGameBoard[oppositeIndex];
			kalahaGameBoard[oppositeIndex] = 0;
		} else if (index != playerKalahaIndex) {
			this.turn = toggleTurn(player);
		}

		checkGameCompletion(kalahaGameBoard, playerKalahaIndex, player);
	}

	private void checkGameCompletion(int[] kalahaGameBoard, int playerKalahaIndex, String player) {
		int sum = 0;
		for (int i = playerKalahaIndex + 1; i <= playerKalahaIndex + sideLength; i++) {
			sum += kalahaGameBoard[i];
		}
		if (sum == 0) {
			if (kalahaGameBoard[hostKalahaIndex] > kalahaGameBoard[opponentKalahaIndex])
				winner = hostPlayer;
			else if (kalahaGameBoard[hostKalahaIndex] < kalahaGameBoard[opponentKalahaIndex])
				winner = opponentPlayer;
			else
				winner = "Match Drawn";			
			this.status = GameStatus.COMPLETE;
		}

	}

	private int findOppositeIndex(int[] kalahaGameBoard, int index) {
		return kalahaGameBoard.length - index;
	}

	private String toggleTurn(String player) {
		if (player.equalsIgnoreCase(hostPlayer))
			return opponentPlayer;
		return hostPlayer;
	}
}
