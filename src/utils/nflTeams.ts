// src/utils/nflTeams.ts

export const NFL_TEAMS = [
  { id: 'ARI', name: 'Cardinals' }, { id: 'ATL', name: 'Falcons' },
  { id: 'BAL', name: 'Ravens' }, { id: 'BUF', name: 'Bills' },
  { id: 'CAR', name: 'Panthers' }, { id: 'CHI', name: 'Bears' },
  { id: 'CIN', name: 'Bengals' }, { id: 'CLE', name: 'Browns' },
  { id: 'DAL', name: 'Cowboys' }, { id: 'DEN', name: 'Broncos' },
  { id: 'DET', name: 'Lions' }, { id: 'GB',  name: 'Packers' },
  { id: 'HOU', name: 'Texans' }, { id: 'IND', name: 'Colts' },
  { id: 'JAX', name: 'Jaguars' }, { id: 'KC',  name: 'Chiefs' },
  { id: 'LV',  name: 'Raiders' }, { id: 'LAC', name: 'Chargers' },
  { id: 'LAR', name: 'Rams' }, { id: 'MIA', name: 'Dolphins' },
  { id: 'MIN', name: 'Vikings' }, { id: 'NE',  name: 'Patriots' },
  { id: 'NO',  name: 'Saints' }, { id: 'NYG', name: 'Giants' },
  { id: 'NYJ', name: 'Jets' }, { id: 'PHI', name: 'Eagles' },
  { id: 'PIT', name: 'Steelers' }, { id: 'SF',  name: '49ers' },
  { id: 'SEA', name: 'Seahawks' }, { id: 'TB',  name: 'Buccaneers' },
  { id: 'TEN', name: 'Titans' }, { id: 'WSH', name: 'Commanders' }
];

export const getTeamLogo = (teamId?: string) => {
  if (!teamId || teamId.toUpperCase() === 'NFL') {
    return 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png';
  }
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`;
};