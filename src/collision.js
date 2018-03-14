// const PLAYER_1 = Math.pow(2, 1)
// const PLAYER_2 = Math.pow(2, 2)
// const PLAYER_3 = Math.pow(2, 3)
// const PLAYER_4 = Math.pow(2, 4)
// const PLAYER_5 = Math.pow(2, 5)
// const PLAYER_6 = Math.pow(2, 6)
// const BULLET_1 = Math.pow(2, 7)
// const BULLET_2 = Math.pow(2, 8)
// const BULLET_3 = Math.pow(2, 9)
// const BULLET_4 = Math.pow(2, 10)
// const BULLET_5 = Math.pow(2, 11)
// const BULLET_6 = Math.pow(2, 12)

const TEAM_1 = Math.pow(2, 1)
const TEAM_2 = Math.pow(2, 2)
const TEAM_1_BULLET = Math.pow(2, 3)
const TEAM_2_BULLET = Math.pow(2, 4)

// module.exports = {
//   GROUPS: {
//     PLAYER_1, PLAYER_2, PLAYER_3, PLAYER_4, PLAYER_5, PLAYER_6,
//     BULLET_1, BULLET_2, BULLET_3, BULLET_4, BULLET_5, BULLET_6
//   },
//   MASKS: {
//     PLAYER_1: BULLET_2 | BULLET_3 | BULLET_4 | BULLET_5 | BULLET_6,
//     PLAYER_2: BULLET_1 | BULLET_3 | BULLET_4 | BULLET_5 | BULLET_6,
//     PLAYER_3: BULLET_1 | BULLET_2 | BULLET_4 | BULLET_5 | BULLET_6,
//     PLAYER_4: BULLET_1 | BULLET_2 | BULLET_3 | BULLET_5 | BULLET_6,
//     PLAYER_5: BULLET_1 | BULLET_2 | BULLET_3 | BULLET_4 | BULLET_6,
//     PLAYER_6: BULLET_1 | BULLET_2 | BULLET_3 | BULLET_4 | BULLET_5,
//     BULLET_1: PLAYER_2 | PLAYER_3 | PLAYER_4 | PLAYER_5 | PLAYER_6,
//     BULLET_2: PLAYER_1 | PLAYER_3 | PLAYER_4 | PLAYER_5 | PLAYER_6,
//     BULLET_3: PLAYER_1 | PLAYER_2 | PLAYER_4 | PLAYER_5 | PLAYER_6,
//     BULLET_4: PLAYER_1 | PLAYER_2 | PLAYER_3 | PLAYER_5 | PLAYER_6,
//     BULLET_5: PLAYER_1 | PLAYER_2 | PLAYER_3 | PLAYER_4 | PLAYER_6,
//     BULLET_6: PLAYER_1 | PLAYER_2 | PLAYER_3 | PLAYER_4 | PLAYER_5
//   }
// }

module.exports = {
  GROUPS: {
    TEAM_1, TEAM_2, TEAM_1_BULLET, TEAM_2_BULLET
  },
  MASKS: {
    TEAM_1: TEAM_2_BULLET,
    TEAM_2: TEAM_1_BULLET,
    TEAM_1_BULLET: TEAM_2,
    TEAM_2_BULLET: TEAM_1
  }
}
