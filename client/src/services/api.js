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

export const getLocations = () => {
  return request("/locations");
};

export const getMachines = () => {
  return request("/machines");
};

export const configureLobby = (
  code,
  {
    hostPlayerId,
    locationId,
    machineIds,
    timeLimitMinutes,
    ballsAllowed,
    missPenaltyStrokes,
  }
) => {
  return request(`/lobbies/${code}/setup`, {
    method: "PUT",
    body: JSON.stringify({
      hostPlayerId,
      locationId,
      machineIds,
      timeLimitMinutes,
      ballsAllowed,
      missPenaltyStrokes,
    }),
  });
};

export const updateHoleTarget = (
  code,
  holeId,
  hostPlayerId,
  targetScore
) => {
  return request(
    `/lobbies/${code}/holes/${holeId}/target`,
    {
      method: "PATCH",
      body: JSON.stringify({
        hostPlayerId,
        targetScore,
      }),
    }
  );
};

export const startLobby = (
  code,
  hostPlayerId
) => {
  return request(`/lobbies/${code}/start`, {
    method: "POST",
    body: JSON.stringify({
      hostPlayerId,
    }),
  });
};
