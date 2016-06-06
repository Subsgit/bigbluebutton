import Users from '/imports/api/users';
import ath from '/imports/ui/services/auth';

const ROLE_MODERATOR = 'MODERATOR';
const EMOJI_STATUSES = ['raiseHand', 'happy', 'smile', 'neutral', 'sad', 'confused', 'away'];

/* TODO: Same map is done in the chat/service we should share this someway */

const mapUser = (user) => ({
  id: user.userid,
  name: user.name,
  status: user.status,
  isPresenter: user.presenter,
  isModerator: user.role === ROLE_MODERATOR,
  isCurrent: user.userid === ath.getUser(),
  isVoiceUser: user.voiceUser.joined,
  isMuted: user.voiceUser.muted,
  isListenOnly: user.listenOnly,
  isSharingWebcam: user.webcam_stream.length,
  isPhoneUser: user.phoneUser,
});

/*
 * Algorithm borrowed from the flash client
 * Sort users based on their current status (emoji, roles, phone, name, id)
 */
const sortUsers = (a, b) => {
  if (a.isModerator) {
    return -1;
  } else if (b.isModerator) {
    return 1;
  } else if (EMOJI_STATUSES.indexOf(a.status) > -1 && EMOJI_STATUSES.indexOf(b.status) == -1) {
    return -1;
  } else if (EMOJI_STATUSES.indexOf(b.status) > -1 && EMOJI_STATUSES.indexOf(a.status) == -1) {
    return 1;
  } else if (a.isPhoneUser) {
    return -1;
  } else if (b.isPhoneUser) {
    return 1;
  }

  /**
  * Check name (case-insensitive) in the event of a tie up above. If the name
  * is the same then use userID which should be unique making the order the same
  * across all clients.
  */
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return -1;
  } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return 1;
  } else if (a.id.toLowerCase() > b.id.toLowerCase()) {
    return -1;
  } else if (a.id.toLowerCase() < b.id.toLowerCase()) {
    return 1;
  }

  return 0;
};

const getUsers = () => {
  let users = Users
  .find({}, {
    'user.set_emoji_time': 1,
    'user.role': 1,
    'user.phone_user': 1,
    'user._sort_name': 1,
    'user.userid': 1,
  })
  .fetch();

  return users
    .map(u => u.user)
    .map(mapUser)
    .sort(sortUsers);
};

export default {
  getUsers,
};
