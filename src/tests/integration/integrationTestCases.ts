export const integrationTestCases = [
  {
    id: 1,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=true', '--actions=all', '--cleanup=all'],
  },
  {
    id: 2,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=true', '--actions=all', '--cleanup=mail'],
  },
  {
    id: 3,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=true', '--actions=all', '--cleanup=sheets'],
  },
  {
    id: 4,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=true', '--actions=all', '--cleanup=none'],
  },
  {
    id: 5,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=true', '--actions=fio', '--cleanup=all'],
  },
  {
    id: 6,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=true', '--actions=fio', '--cleanup=mail'],
  },
  {
    id: 7,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=true', '--actions=fio', '--cleanup=sheets'],
  },
  {
    id: 8,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=true', '--actions=fio', '--cleanup=none'],
  },
  {
    id: 9,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=true', '--actions=mail', '--cleanup=all'],
  },
  {
    id: 10,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=true', '--actions=mail', '--cleanup=mail'],
  },
  {
    id: 11,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=true', '--actions=mail', '--cleanup=sheets'],
  },
  {
    id: 12,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=true', '--actions=mail', '--cleanup=none'],
  },
  {
    id: 13,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=all', '--cleanup=all'],
  },
  {
    id: 14,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=all', '--cleanup=mail'],
  },
  {
    id: 15,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=all', '--cleanup=sheets'],
  },
  {
    id: 16,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=all', '--cleanup=none'],
  },
  {
    id: 17,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=fio', '--cleanup=all'],
  },
  {
    id: 18,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=fio', '--cleanup=mail'],
  },
  {
    id: 19,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=fio', '--cleanup=sheets'],
  },
  {
    id: 20,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=fio', '--cleanup=none'],
  },
  {
    id: 21,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=mail', '--cleanup=all'],
  },
  {
    id: 22,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=mail', '--cleanup=mail'],
  },
  {
    id: 23,
    command: 'yarn',
    args: [
      'start',
      '--environment=development',
      '--withLabeling=false',
      '--actions=mail',
      '--cleanup=sheets',
    ],
  },
  {
    id: 24,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=mail', '--cleanup=none'],
  },
  {
    id: 25, // RESET CASE
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=none', '--cleanup=all'],
  },
  {
    id: 26,
    command: 'yarn',
    args: ['start', '--environment=development', '--withLabeling=false', '--actions=none', '--cleanup=mail'],
  },
  {
    id: 27,
    command: 'yarn',
    args: [
      'start',
      '--environment=development',
      '--withLabeling=false',
      '--actions=none',
      '--cleanup=sheets',
    ],
  },
];
