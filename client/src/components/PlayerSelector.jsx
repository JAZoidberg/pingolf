function PlayerSelector({
  players,
  selectedPlayerId,
  onChange,
}) {
  return (
    <section className="card">
      <h2>Player</h2>

      <label htmlFor="player">
        Choose a player
      </label>

      <select
        id="player"
        value={selectedPlayerId}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        <option value="">
          Select player...
        </option>

        {players.map((player) => (
          <option
            key={player._id}
            value={player._id}
          >
            {player.displayName}
          </option>
        ))}
      </select>
    </section>
  );
}

export default PlayerSelector;
