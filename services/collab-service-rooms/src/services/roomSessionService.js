// create room
// reuse room if exists
// validate user
// track session status

export class RoomSessionService {
  constructor() {
    // In-memory session store for MVP
    // key = roomId
    // value = session object
    this.sessions = new Map();

    // Optional helper map:
    // key = matchId
    // value = roomId
    this.matchToRoom = new Map();
  }

  generateRoomId() {
    return `room-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  async startSession({ userId, matchId }) {
    if (!userId || !matchId) {
      throw new Error('userId and matchId are required');
    }

    // If a room already exists for this match, reuse it
    const existingRoomId = this.matchToRoom.get(matchId);
    if (existingRoomId) {
      const existingSession = this.sessions.get(existingRoomId);

      if (existingSession && existingSession.status !== 'closed') {
        return {
          roomId: existingSession.roomId,
          questionId: existingSession.questionId,
          status: existingSession.status,
          reused: true,
        };
      }
    }

    // In a real system, you would look up the match from your match service / DB
    // and get both users + assigned question from there.
    // For now, we create a basic session.
    const roomId = this.generateRoomId();

    const session = {
      roomId,
      matchId,
      questionId: 'sample-question-id',
      users: [userId], // For MVP. Ideally include both matched users.
      status: 'active',
      submittedUsers: [],
      leftUsers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(roomId, session);
    this.matchToRoom.set(matchId, roomId);

    return {
      roomId: session.roomId,
      questionId: session.questionId,
      status: session.status,
      reused: false,
    };
  }

  async reconnectSession({ userId, roomId }) {
    if (!userId || !roomId) {
      throw new Error('userId and roomId are required');
    }

    const session = this.sessions.get(roomId);

    if (!session) {
      return {
        success: false,
        message: 'Session not found',
      };
    }

    if (session.status === 'closed') {
      return {
        success: false,
        message: 'Session is closed',
      };
    }

    // MVP: allow rejoin if user was already in session, or add them if missing
    if (!session.users.includes(userId)) {
      session.users.push(userId);
    }

    // If user had left before, remove from leftUsers
    session.leftUsers = session.leftUsers.filter((id) => id !== userId);
    session.updatedAt = new Date().toISOString();

    this.sessions.set(roomId, session);

    return {
      success: true,
      roomId: session.roomId,
      questionId: session.questionId,
      status: session.status,
      session,
    };
  }

  async leaveSession({ userId, roomId }) {
    if (!userId || !roomId) {
      throw new Error('userId and roomId are required');
    }

    const session = this.sessions.get(roomId);

    if (!session) {
      return {
        success: false,
        message: 'Session not found',
      };
    }

    if (!session.leftUsers.includes(userId)) {
      session.leftUsers.push(userId);
    }

    session.updatedAt = new Date().toISOString();

    // Example close rule:
    // if all known users have left, close session
    const allUsersLeft =
      session.users.length > 0 &&
      session.users.every((id) => session.leftUsers.includes(id));

    if (allUsersLeft) {
      session.status = 'closed';
    }

    this.sessions.set(roomId, session);

    return {
      success: true,
      message: 'User left session successfully',
      status: session.status,
      session,
    };
  }

  async submitSession({ userId, roomId, code }) {
    if (!userId || !roomId) {
      throw new Error('userId and roomId are required');
    }

    const session = this.sessions.get(roomId);

    if (!session) {
      return {
        success: false,
        message: 'Session not found',
      };
    }

    if (session.status === 'closed') {
      return {
        success: false,
        message: 'Session is already closed',
      };
    }

    if (!session.submittedUsers.includes(userId)) {
      session.submittedUsers.push(userId);
    }

    session.lastSubmittedCode = code ?? '';
    session.updatedAt = new Date().toISOString();

    // Example rule:
    // close when all users in session have submitted
    const allUsersSubmitted =
      session.users.length > 0 &&
      session.users.every((id) => session.submittedUsers.includes(id));

    if (allUsersSubmitted) {
      session.status = 'closed';
    }

    this.sessions.set(roomId, session);

    return {
      success: true,
      message: 'Session submitted successfully',
      status: session.status,
      session,
    };
  }

  async getSessionByRoomId(roomId) {
    return this.sessions.get(roomId) || null;
  }
}