import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getLobby,
  getLobbyStandings,
  submitHoleScore,
} from "../services/api";

function RoundView({
  lobby,
  selectedPlayerId,
  onLobbyUpdate,
}) {
  const [standings, setStandings] =
    useState(null);

  const [ballScores, setBallScores] =
    useState([]);

  const [
    currentScore,
    setCurrentScore,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const refreshRound =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const [
          updatedLobby,
          updatedStandings,
        ] = await Promise.all([
          getLobby(lobby.code),
          getLobbyStandings(
            lobby.code
          ),
        ]);

        onLobbyUpdate(
          updatedLobby
        );

        setStandings(
          updatedStandings
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, [
      lobby.code,
      onLobbyUpdate,
    ]);

  useEffect(() => {
    refreshRound();
  }, [refreshRound]);

  const playerStanding =
    useMemo(() => {
      if (!standings) {
        return null;
      }

      return standings.standings.find(
        (entry) =>
          entry.player.id ===
          selectedPlayerId
      );
    }, [
      standings,
      selectedPlayerId,
    ]);

  const currentHole =
    useMemo(() => {
      if (!playerStanding) {
        return null;
      }

      return (
        playerStanding.scorecard.find(
          (hole) =>
            !hole.completed
        ) || null
      );
    }, [playerStanding]);

  useEffect(() => {
    setBallScores([]);
    setCurrentScore("");
  }, [currentHole?.holeId]);

  const ballsAllowed =
    lobby.settings
      ?.ballsAllowed ?? 3;

  const nextBallNumber =
    ballScores.length + 1;

  const handleSubmitBall =
    async (event) => {
      event.preventDefault();

      if (!currentHole) {
        return;
      }

      const score =
        Number(currentScore);

      if (
        !Number.isFinite(score) ||
        score < 0
      ) {
        setError(
          "Enter a valid machine score"
        );

        return;
      }

      const previousScore =
        ballScores[
          ballScores.length - 1
        ];

      if (
        previousScore !==
          undefined &&
        score < previousScore
      ) {
        setError(
          "Machine score cannot decrease between balls"
        );

        return;
      }

      const nextBallScores = [
        ...ballScores,
        score,
      ];

      try {
        setLoading(true);
        setError("");
        setMessage("");

        const response =
          await submitHoleScore(
            lobby.code,
            currentHole.holeId,
            selectedPlayerId,
            nextBallScores
          );

        if (
          response.scoring
            .status ===
          "in_progress"
        ) {
          setBallScores(
            nextBallScores
          );

          setCurrentScore("");

          setMessage(
            `Ball ${
              response.scoring
                .ballsPlayed
            } complete. Target not reached yet.`
          );

          return;
        }

        setBallScores([]);
        setCurrentScore("");

        if (
          response.scoring
            .reachedTarget
        ) {
          setMessage(
            `Target reached in ${
              response.scoring
                .strokes
            } stroke${
              response.scoring
                .strokes === 1
                ? ""
                : "s"
            }!`
          );
        } else {
          setMessage(
            `Target missed. Hole scored as ${
              response.scoring
                .strokes
            } strokes.`
          );
        }

        await refreshRound();
      } catch (err) {
        if (
          err.message ===
          "Lobby time limit has expired"
        ) {
          await refreshRound();

          setMessage(
            "Time limit expired. The round is finished."
          );

          return;
        }

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  if (!standings) {
    return (
      <section className="card">
        <h2>Round</h2>

        <p>
          Loading round...
        </p>
      </section>
    );
  }

  return (
    <>
      {lobby.status ===
        "playing" &&
        currentHole && (
          <section className="card play-card">
            <p className="hole-label">
              Hole{" "}
              {currentHole.order}
            </p>

            <h2>
              {
                currentHole
                  .machine.name
              }
            </h2>

            <p className="target-label">
              Target
            </p>

            <div className="target-number">
              {currentHole.targetScore
                .toLocaleString()}
            </div>

            <p className="muted">
              Enter the total score
              currently displayed on
              the pinball machine
              after each ball.
            </p>

            {ballScores.length >
              0 && (
              <div className="ball-history">
                {ballScores.map(
                  (
                    score,
                    index
                  ) => (
                    <div
                      key={index}
                      className="ball-score"
                    >
                      <span>
                        Ball{" "}
                        {index + 1}
                      </span>

                      <strong>
                        {score.toLocaleString()}
                      </strong>
                    </div>
                  )
                )}
              </div>
            )}

            <form
              className="score-form"
              onSubmit={
                handleSubmitBall
              }
            >
              <label htmlFor="machine-score">
                Score after Ball{" "}
                {nextBallNumber}
              </label>

              <input
                id="machine-score"
                type="number"
                min="0"
                step="1"
                value={
                  currentScore
                }
                placeholder="85000000"
                onChange={(
                  event
                ) =>
                  setCurrentScore(
                    event.target
                      .value
                  )
                }
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  currentScore ===
                    "" ||
                  nextBallNumber >
                    ballsAllowed
                }
              >
                Submit Ball{" "}
                {nextBallNumber}
              </button>
            </form>

            <p className="muted">
              {ballScores.length} of{" "}
              {ballsAllowed} balls
              entered
            </p>

            {message && (
              <div className="success-message">
                {message}
              </div>
            )}

            {error && (
              <div className="error">
                {error}
              </div>
            )}
          </section>
        )}

      {lobby.status ===
        "playing" &&
        playerStanding
          ?.isComplete && (
          <section className="card">
            <h2>
              Your Round Is Complete
            </h2>

            <p>
              Waiting for the other
              players to finish.
            </p>
          </section>
        )}

      {lobby.status ===
        "finished" && (
          <section className="card finished-card">
            <h2>
              Round Complete
            </h2>

            <p>
              Final scores are
              below.
            </p>
          </section>
        )}

      <section className="card">
        <div className="section-heading">
          <h2>Standings</h2>

          <button
            type="button"
            className="refresh-button"
            onClick={
              refreshRound
            }
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        <div className="standings-list">
          {standings.standings.map(
            (
              entry,
              index
            ) => (
              <div
                key={
                  entry.player.id
                }
                className={
                  entry.player.id ===
                  selectedPlayerId
                    ? "standing-row current-player"
                    : "standing-row"
                }
              >
                <div>
                  <strong>
                    #{index + 1}{" "}
                    {
                      entry.player
                        .displayName
                    }
                  </strong>

                  <span>
                    {
                      entry.holesCompleted
                    }
                    /
                    {
                      entry.totalHoles
                    }{" "}
                    holes
                  </span>
                </div>

                <strong>
                  {
                    entry.totalStrokes
                  }{" "}
                  strokes
                </strong>
              </div>
            )
          )}
        </div>
      </section>
    </>
  );
}

export default RoundView;
