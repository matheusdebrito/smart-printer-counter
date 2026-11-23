/**
 * Configuração centralizada de todas as impressoras.
 * Extraída dos módulos individuais em impressoras/
 */
const printers = [
  {
    id: 'rh',
    name: 'RH',
    ip: '192.168.250.4',
    module: './impressoras/impressora_rh',
    type: 'pdf',
    login: { username: '1234567', password: '1234567', managerMode: true },
    checkUrl: 'http://192.168.250.4/login.html',
    counterUrl: 'http://192.168.250.4/d_counter.html'
  },
  {
    id: 'fonte_2_envelopamento',
    name: 'Fonte 2 Envelopamento',
    ip: '192.168.254.46',
    module: './impressoras/fonte_2_envelopamento',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.254.46/',
    counterUrl: 'http://192.168.254.46/'
  },
  {
    id: 'prev_barra_recepcao_direita',
    name: 'Prev Barra Recepção Direita',
    ip: '192.168.253.63',
    module: './impressoras/prev_barra_recepcao_direita',
    type: 'pdf',
    login: {},
    checkUrl: 'http://192.168.253.63/',
    counterUrl: 'http://192.168.253.63/'
  },
  {
    id: 'prev_copa_sala_medicos',
    name: 'Prev Copa Sala Médicos',
    ip: '192.168.252.100',
    module: './impressoras/prev_copa_sala_medicos',
    type: 'png',
    login: {},
    checkUrl: 'http://192.168.252.100/',
    counterUrl: 'http://192.168.252.100/'
  },
  {
    id: 'prev_copa_recepcao',
    name: 'Prev Copa Recepção',
    ip: '192.168.252.101',
    module: './impressoras/prev_copa_recepcao',
    type: 'png',
    login: {},
    checkUrl: 'http://192.168.252.101/',
    counterUrl: 'http://192.168.252.101/'
  },
  {
    id: 'fonte_1_laudos',
    name: 'Fonte 1 Laudos',
    ip: '192.168.254.47',
    module: './impressoras/fonte_1_laudos',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.254.47/',
    counterUrl: 'http://192.168.254.47/'
  },
  {
    id: 'prev_barra_recepcao_esquerda',
    name: 'Prev Barra Recepção Esquerda',
    ip: '192.168.253.64',
    module: './impressoras/prev_barra_recepcao_esquerda',
    type: 'pdf',
    login: {},
    checkUrl: 'http://192.168.253.64/',
    counterUrl: 'http://192.168.253.64/'
  },
  {
    id: 'fonte_1_teste_ergometrico',
    name: 'Fonte 1 Teste Ergométrico',
    ip: '192.168.254.48',
    module: './impressoras/fonte_1_teste_ergometrico',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.254.48/',
    counterUrl: 'http://192.168.254.48/'
  },
  {
    id: 'fonte_2_ultra_eco',
    name: 'Fonte 2 Ultra Eco',
    ip: '192.168.254.49',
    module: './impressoras/fonte_2_ultra_eco',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.254.49/',
    counterUrl: 'http://192.168.254.49/'
  },
  {
    id: 'fonte_2_envelopamento_2',
    name: 'Fonte 2 Envelopamento 2',
    ip: '192.168.254.50',
    module: './impressoras/fonte_2_envelopamento_2',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.254.50/',
    counterUrl: 'http://192.168.254.50/'
  },
  {
    id: 'fonte_1_recepcao',
    name: 'Fonte 1 Recepção',
    ip: '192.168.254.45',
    module: './impressoras/fonte_1_recepcao',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.254.45/',
    counterUrl: 'http://192.168.254.45/'
  },
  {
    id: 'fonte_2_recepcao',
    name: 'Fonte 2 Recepção',
    ip: '192.168.254.51',
    module: './impressoras/fonte_2_recepcao',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.254.51/',
    counterUrl: 'http://192.168.254.51/'
  },
  {
    id: 'fonte_1_recepcao_2_sala_vip',
    name: 'Fonte 1 Recepção 2 Sala VIP',
    ip: '192.168.254.52',
    module: './impressoras/fonte_1_recepcao_2_sala_vip',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.254.52/',
    counterUrl: 'http://192.168.254.52/'
  },
  {
    id: 'faturamento',
    name: 'Faturamento',
    ip: '192.168.254.53',
    module: './impressoras/faturamento',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.254.53/',
    counterUrl: 'http://192.168.254.53/'
  }
];

module.exports = { printers };