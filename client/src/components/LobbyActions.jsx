function LobbyActions({
  selectedPlayerId,
  lobbyCode,
  onLobbyCodeChange,
  onCreateLobby,
  onJoinLobby,
  loading,
}) {
  const playerSelected =
    Boolean(selectedPlayerId);

  return (
    <section className="card">
      <h2>Lobby</h2>

      <button
        type="button"
        onClick={onCreateLobby}
        disabled={
          !playerSelected || loading
        }
      >
        Create Lobby
      </button>

      <div className="divider">
        or
      </div>

      <label htmlFor="lobby-code">
        Lobby code
      </label>

      <input
        id="lobby-code"
        type="text"
        value={lobbyCode}
        maxLength={6}
        placeholder="ABC123"
        onChange={(event) =>
          onLobbyCodeChange(
            event.target.value.toUpperCase()
          )
        }
      />

      <button
        type="button"
        onClick={onJoinLobby}
        disabled={
          !playerSelected ||
          !lobbyCode.trim() ||
          loading
        }
      >
        Join Lobby
      </button>
    </section>
  );
}

export default LobbyActions;
