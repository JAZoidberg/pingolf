import {
  useEffect,
  useState,
} from "react";

import PlayerSelector from "./components/PlayerSelector";
import LobbyActions from "./components/LobbyActions";
import LobbySummary from "./components/LobbySummary";
import LobbySetup from "./components/LobbySetup";

import {
  getPlayers,
  createLobby,
  joinLobby,
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
        </section>
      )}

    {lobby.status === "playing" && (
      <section className="card">
        <h2>
          Round Started!
        </h2>

        <p>
          The play screen comes
          next.
        </p>
      </section>
    )}
  </div>
)}
    </main>
  );
}

export default App;
