package com.bol.games.kalaha.entity;

import com.bol.games.kalaha.exception.InvalidMoveException;
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
	private final int seedsPerCup;
	private String winner;
	private final int hostKalahaIndex;
	private final int opponentKalahaIndex;
	private final int sideLength;
	private final int kalahaPlayersPerGame;
	private String turn;

	public Game(String gameId, String hostPlayer, int kalahaBoardSize, int seedsPerCup, int kalahaPlayersPerGame) {
		this.gameId = gameId;
		this.hostPlayer = hostPlayer;
		this.seedsPerCup = seedsPerCup;
		this.kalahaPlayersPerGame = kalahaPlayersPerGame;
		this.sideLength = (kalahaBoardSize - 2) / 2;
		this.opponentKalahaIndex = 0;
		this.hostKalahaIndex = sideLength + 1;
		this.status = GameStatus.NEW;
		this.kalahaGameBoard = new int[kalahaBoardSize];
		initializeBoard();
		turn = hostPlayer;
	}

	private void initializeBoard() {
		for (int i = 0; i < kalahaGameBoard.length; i++) {
			if (i != hostKalahaIndex && i != opponentKalahaIndex)
				kalahaGameBoard[i] = seedsPerCup;
		}
	}

	public Boolean waitingForOpponent() {
		if (this.opponentPlayer == null && this.status == GameStatus.NEW)
			return true;
		return false;
	}

	public void validateAndMove(int move, String moveBy) throws InvalidMoveException {
		if (status != GameStatus.COMPLETE && turn.equals(moveBy) && move < kalahaGameBoard.length && move > 0
				&& kalahaGameBoard[move] > 0) {
			if (moveBy.equals(hostPlayer) && (move < hostKalahaIndex && move >= hostKalahaIndex - sideLength)) {
				performMove(move, moveBy, hostKalahaIndex, opponentKalahaIndex);
			} else if (moveBy.equals(opponentPlayer)
					&& (move > hostKalahaIndex && move <= hostKalahaIndex + sideLength)) {
				performMove(move, moveBy, opponentKalahaIndex, hostKalahaIndex);
			} else {
				throw new InvalidMoveException(String.format("Invalid move %s by %s", move, moveBy));
			}

		} else if (status == GameStatus.COMPLETE) {
			throw new InvalidMoveException("Error: Game is complete");
		} else {
			throw new InvalidMoveException(String.format("Invalid move %s by %s", move, moveBy));
		}
	}

	private void performMove(int move, String player, int playerKalahaIndex, int opponentKalahaIndex) {
		int coins = kalahaGameBoard[move];
		int index = -1;
		for (int i = 1; i <= coins; i++) {
			index = (move + i) % kalahaGameBoard.length;
			if (index != opponentKalahaIndex) {
				kalahaGameBoard[index] += 1;
				kalahaGameBoard[move] -= 1;
			} else {
				coins++;
			}
		}

		if (index != playerKalahaIndex && kalahaGameBoard[index] == 1) {
			int oppositeIndex = findOppositeIndex(kalahaGameBoard, index);
			kalahaGameBoard[playerKalahaIndex] += kalahaGameBoard[oppositeIndex];
			kalahaGameBoard[playerKalahaIndex] += kalahaGameBoard[index];
			kalahaGameBoard[oppositeIndex] = 0;
			kalahaGameBoard[index] = 0;
			this.turn = toggleTurn(player);
		} else if (index != playerKalahaIndex) {
			this.turn = toggleTurn(player);
		}

		checkGameCompletion(kalahaGameBoard, playerKalahaIndex, player);
	}

	private void checkGameCompletion(int[] kalahaGameBoard, int playerKalahaIndex, String player) {
		int hostRemainingSeedsSum = 0;
		int opponentRemainingSeedsSum = 0;
		boolean gameComplete = false;

		for (int i = 1; i < hostKalahaIndex; i++) {
			hostRemainingSeedsSum += kalahaGameBoard[i];
		}

		for (int i = hostKalahaIndex + 1; i <= hostKalahaIndex + sideLength; i++) {
			opponentRemainingSeedsSum += kalahaGameBoard[i];
		}

		if (hostRemainingSeedsSum == 0) {
			kalahaGameBoard[opponentKalahaIndex] += opponentRemainingSeedsSum;
			gameComplete = true;
			for (int i = hostKalahaIndex + 1; i <= hostKalahaIndex + sideLength; i++) {
				kalahaGameBoard[i] = 0;
			}
		} else if (opponentRemainingSeedsSum == 0) {
			kalahaGameBoard[hostKalahaIndex] += hostRemainingSeedsSum;
			gameComplete = true;
			for (int i = 1; i < hostKalahaIndex; i++) {
				kalahaGameBoard[i] = 0;
			}
		}

		if (gameComplete) {
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
