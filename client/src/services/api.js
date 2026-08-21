const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const request = async (
  path,
  options = {}
) => {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Request failed"
    );
  }

  return data;
};

export const getPlayers = () => {
  return request("/players");
};

export const createLobby = (
  hostPlayerId
) => {
  return request("/lobbies", {
    method: "POST",
    body: JSON.stringify({
      hostPlayerId,
    }),
  });
};

export const joinLobby = (
  code,
  playerId
) => {
  return request(
    `/lobbies/${code}/join`,
    {
      method: "POST",
      body: JSON.stringify({
        playerId,
      }),
    }
  );
};

export const getLobby = (code) => {
  return request(`/lobbies/${code}`);
};
