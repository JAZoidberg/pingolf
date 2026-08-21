import {
  useEffect,
  useState,
} from "react";

import {
  configureLobby,
  getLocations,
  getMachines,
  startLobby,
  updateHoleTarget,
} from "../services/api";

function LobbySetup({
  lobby,
  selectedPlayerId,
  onLobbyUpdate,
}) {
  const [locations, setLocations] =
    useState([]);

  const [machines, setMachines] =
    useState([]);

  const [locationId, setLocationId] =
    useState(
      lobby.location?._id || ""
    );

  const [
    selectedMachineIds,
    setSelectedMachineIds,
  ] = useState(
    lobby.holes.map(
      (hole) => hole.machine._id
    )
  );

  const [
    timeLimitMinutes,
    setTimeLimitMinutes,
  ] = useState(
    lobby.settings
      ?.timeLimitMinutes ?? ""
  );

  const [
    ballsAllowed,
    setBallsAllowed,
  ] = useState(
    lobby.settings?.ballsAllowed ?? 3
  );

  const [
    missPenaltyStrokes,
    setMissPenaltyStrokes,
  ] = useState(
    lobby.settings
      ?.missPenaltyStrokes ?? 1
  );

  const [
    targetValues,
    setTargetValues,
  ] = useState({});

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadSetupData = async () => {
      try {
        const [
          locationData,
          machineData,
        ] = await Promise.all([
          getLocations(),
          getMachines(),
        ]);

        setLocations(locationData);
        setMachines(machineData);
      } catch (err) {
        setError(err.message);
      }
    };

    loadSetupData();
  }, []);

  useEffect(() => {
    const values = {};

    lobby.holes.forEach((hole) => {
      values[hole._id] =
        hole.targetScore ?? "";
    });

    setTargetValues(values);
  }, [lobby.holes]);

  const toggleMachine = (
    machineId
  ) => {
    setSelectedMachineIds(
      (current) => {
        if (
          current.includes(machineId)
        ) {
          return current.filter(
            (id) => id !== machineId
          );
        }

        return [
          ...current,
          machineId,
        ];
      }
    );
  };

  const handleConfigure =
    async () => {
      if (!locationId) {
        setError(
          "Choose a location first"
        );
        return;
      }

      if (
        selectedMachineIds.length === 0
      ) {
        setError(
          "Choose at least one machine"
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        const updatedLobby =
          await configureLobby(
            lobby.code,
            {
              hostPlayerId:
                selectedPlayerId,

              locationId,

              machineIds:
                selectedMachineIds,

              timeLimitMinutes:
                timeLimitMinutes === ""
                  ? null
                  : Number(
                      timeLimitMinutes
                    ),

              ballsAllowed:
                Number(
                  ballsAllowed
                ),

              missPenaltyStrokes:
                Number(
                  missPenaltyStrokes
                ),
            }
          );

        onLobbyUpdate(
          updatedLobby
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  const handleSaveTarget =
    async (hole) => {
      const targetScore =
        Number(
          targetValues[hole._id]
        );

      if (
        !Number.isFinite(
          targetScore
        ) ||
        targetScore <= 0
      ) {
        setError(
          "Target must be a positive number"
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        const updatedLobby =
          await updateHoleTarget(
            lobby.code,
            hole._id,
            selectedPlayerId,
            targetScore
          );

        onLobbyUpdate(
          updatedLobby
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  const handleStart =
    async () => {
      try {
        setLoading(true);
        setError("");

        const updatedLobby =
          await startLobby(
            lobby.code,
            selectedPlayerId
          );

        onLobbyUpdate(
          updatedLobby
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  const allTargetsReady =
    lobby.holes.length > 0 &&
    lobby.holes.every(
      (hole) =>
        typeof hole.targetScore ===
          "number" &&
        hole.targetScore > 0
    );

  return (
    <section className="card setup-card">
      <h2>Host Setup</h2>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="location">
          Location
        </label>

        <select
          id="location"
          value={locationId}
          onChange={(event) =>
            setLocationId(
              event.target.value
            )
          }
        >
          <option value="">
            Select location...
          </option>

          {locations.map(
            (location) => (
              <option
                key={location._id}
                value={location._id}
              >
                {location.name}
                {location.city
                  ? ` — ${location.city}`
                  : ""}
              </option>
            )
          )}
        </select>
      </div>

      <div className="form-group">
        <h3>Machines</h3>

        <div className="machine-list">
          {machines.map(
            (machine) => (
              <label
                key={machine._id}
                className="machine-option"
              >
                <input
                  type="checkbox"
                  checked={
                    selectedMachineIds.includes(
                      machine._id
                    )
                  }
                  onChange={() =>
                    toggleMachine(
                      machine._id
                    )
                  }
                />

                <span>
                  <strong>
                    {machine.name}
                  </strong>

                  {machine.manufacturer && (
                    <small>
                      {
                        machine.manufacturer
                      }

                      {machine.year
                        ? ` • ${machine.year}`
                        : ""}
                    </small>
                  )}
                </span>
              </label>
            )
          )}
        </div>
      </div>

      <div className="settings-grid">
        <div className="form-group">
          <label htmlFor="balls">
            Balls allowed
          </label>

          <input
            id="balls"
            type="number"
            min="1"
            value={ballsAllowed}
            onChange={(event) =>
              setBallsAllowed(
                event.target.value
              )
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="penalty">
            Miss penalty
          </label>

          <input
            id="penalty"
            type="number"
            min="0"
            value={
              missPenaltyStrokes
            }
            onChange={(event) =>
              setMissPenaltyStrokes(
                event.target.value
              )
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="timer">
            Time limit
            (minutes)
          </label>

          <input
            id="timer"
            type="number"
            min="1"
            value={
              timeLimitMinutes
            }
            placeholder="No limit"
            onChange={(event) =>
              setTimeLimitMinutes(
                event.target.value
              )
            }
          />
        </div>
      </div>

      <button
        type="button"
        onClick={
          handleConfigure
        }
        disabled={loading}
      >
        {lobby.holes.length > 0
          ? "Update Course"
          : "Configure Course"}
      </button>

      {lobby.holes.length > 0 && (
        <div className="targets">
          <h3>Hole Targets</h3>

          <p className="muted">
            Suggested targets were
            calculated from existing
            score history. You can
            override them before
            starting.
          </p>

          {lobby.holes.map(
            (hole) => (
              <div
                key={hole._id}
                className="target-row"
              >
                <div>
                  <strong>
                    Hole {hole.order}
                  </strong>

                  <span>
                    {
                      hole.machine.name
                    }
                  </span>
                </div>

                <input
                  type="number"
                  min="1"
                  value={
                    targetValues[
                      hole._id
                    ] ?? ""
                  }
                  placeholder="Target"
                  onChange={(
                    event
                  ) =>
                    setTargetValues(
                      (current) => ({
                        ...current,

                        [hole._id]:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                />

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    handleSaveTarget(
                      hole
                    )
                  }
                  disabled={loading}
                >
                  Save
                </button>
              </div>
            )
          )}

          <button
            type="button"
            className="start-button"
            onClick={
              handleStart
            }
            disabled={
              loading ||
              !allTargetsReady
            }
          >
            Start Round
          </button>

          {!allTargetsReady && (
            <p className="muted">
              Every hole needs a
              target before the
              round can start.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default LobbySetup;
