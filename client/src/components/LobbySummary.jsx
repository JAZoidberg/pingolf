function LobbySummary({ lobby }) {
  if (!lobby) {
    return null;
  }

  return (
    <section className="card lobby-summary">
      <h2>Current Lobby</h2>

      <div className="lobby-code">
        {lobby.code}
      </div>

      <p>
        Status:{" "}
        <strong>
          {lobby.status}
        </strong>
      </p>

      <h3>Players</h3>

      <ul>
        {lobby.players.map((player) => (
          <li key={player._id}>
            {player.displayName}
          </li>
        ))}
      </ul>

      {lobby.location && (
        <>
          <h3>Location</h3>

          <p>
            {lobby.location.name}
          </p>
        </>
      )}

      {lobby.holes.length > 0 && (
        <>
          <h3>Course</h3>

          <ol>
            {lobby.holes.map((hole) => (
              <li key={hole._id}>
                {hole.machine.name}

                {hole.targetScore && (
                  <>
                    {" — "}
                    target{" "}
                    {hole.targetScore.toLocaleString()}
                  </>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

export default LobbySummary;
