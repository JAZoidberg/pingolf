import {
  useEffect,
  useState,
} from "react";

import PlayerSelector from "./components/PlayerSelector";
import LobbyActions from "./components/LobbyActions";
import LobbySummary from "./components/LobbySummary";
import LobbySetup from "./components/LobbySetup";
import RoundView from "./components/RoundView";

import {
  getPlayers,
  createLobby,
  joinLobby,
  getLobby,
} from "./services/api";

function App() {
  const [players, setPlayers] =
    useState([]);

  const [
    selectedPlayerId,
    setSelectedPlayerId,
  ] = useState("");

  const [lobbyCode, setLobbyCode] =
    useState("");

  const [lobby, setLobby] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const data =
          await getPlayers();

        setPlayers(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadPlayers();
  }, []);

  const handleCreateLobby = async () => {
    if (!selectedPlayerId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const createdLobby =
        await createLobby(
          selectedPlayerId
        );

      setLobby(createdLobby);
      setLobbyCode(
        createdLobby.code
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLobby = async () => {
    if (
      !selectedPlayerId ||
      !lobbyCode.trim()
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const joinedLobby =
        await joinLobby(
          lobbyCode.trim(),
          selectedPlayerId
        );

      setLobby(joinedLobby);
      setLobbyCode(
        joinedLobby.code
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshLobby =
    async () => {
      if (!lobby) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const updatedLobby =
          await getLobby(
            lobby.code
          );

        setLobby(updatedLobby);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
   };

  return (
    <main className="app">
      <header className="hero">
        <h1>Pingolf</h1>

        <p>
          Turn pinball scores into
          strokes and compete with
          friends.
        </p>
      </header>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {!lobby && (
        <div className="grid">
          <PlayerSelector
            players={players}
            selectedPlayerId={
              selectedPlayerId
            }
            onChange={
              setSelectedPlayerId
            }
          />

          <LobbyActions
            selectedPlayerId={
              selectedPlayerId
            }
            lobbyCode={lobbyCode}
            onLobbyCodeChange={
              setLobbyCode
            }
            onCreateLobby={
              handleCreateLobby
            }
            onJoinLobby={
              handleJoinLobby
            }
            loading={loading}
          />
        </div>
      )}

      {lobby && (
  <div className="lobby-view">
    <LobbySummary
      lobby={lobby}
    />

    {lobby.status === "waiting" &&
      lobby.hostPlayer?._id ===
        selectedPlayerId && (
        <LobbySetup
          lobby={lobby}
          selectedPlayerId={
            selectedPlayerId
          }
          onLobbyUpdate={
            setLobby
          }
        />
      )}

    {lobby.status === "waiting" &&
      lobby.hostPlayer?._id !==
        selectedPlayerId && (
        <section className="card">
          <h2>
            Waiting for Host
          </h2>

          <p>
            The host is setting up
            the course.
          </p>

          <button
            type="button"
            onClick={
              handleRefreshLobby
            }
            disabled={loading}
          >
            Refresh Lobby
          </button>
        </section>
      )}

    {(
      lobby.status === "playing" ||
      lobby.status === "finished"
    ) && (
      <RoundView
        lobby={lobby}
        selectedPlayerId={
          selectedPlayerId
        }
        onLobbyUpdate={
          setLobby
        }
      />
    )} 
  </div>
)}
    </main>
  );
}

export default App;
