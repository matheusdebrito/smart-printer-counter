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
    ip: '192.168.251.35',
    module: './impressoras/fonte_2_envelopamento',
    type: 'xml',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.251.35/',
    counterUrl: 'http://192.168.251.35/wcd/system_counter.xml'
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
    ip: '192.168.252.151',
    module: './impressoras/prev_copa_recepcao',
    type: 'png',
    login: {},
    checkUrl: 'http://192.168.252.151/',
    counterUrl: 'http://192.168.252.151/'
  },
  {
    id: 'fonte_1_laudos',
    name: 'Fonte 1 Laudos',
    ip: '192.168.254.34',
    module: './impressoras/fonte_1_laudos',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.254.34/',
    counterUrl: 'http://192.168.254.34/'
  },
  {
    id: 'prev_barra_recepcao_esquerda',
    name: 'Prev Barra Recepção Esquerda',
    ip: '192.168.253.150',
    module: './impressoras/prev_barra_recepcao_esquerda',
    type: 'pdf',
    login: {},
    checkUrl: 'http://192.168.253.150/',
    counterUrl: 'http://192.168.253.150/'
  },
  {
    id: 'fonte_1_teste_ergometrico',
    name: 'Fonte 1 Teste Ergométrico',
    ip: '192.168.254.42',
    module: './impressoras/fonte_1_teste_ergometrico',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.254.42/',
    counterUrl: 'http://192.168.254.42/'
  },
  {
    id: 'fonte_2_ultra_eco',
    name: 'Fonte 2 Ultra Eco',
    ip: '192.168.251.37',
    module: './impressoras/fonte_2_ultra_eco',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.251.37/',
    counterUrl: 'http://192.168.251.37/'
  },
  {
    id: 'fonte_2_envelopamento_2',
    name: 'Fonte 2 Envelopamento 2',
    ip: '192.168.251.39',
    module: './impressoras/fonte_2_envelopamento_2',
    type: 'xml',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.251.39/',
    counterUrl: 'http://192.168.251.39/wcd/system_counter.xml'
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
    ip: '192.168.251.36',
    module: './impressoras/fonte_2_recepcao',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.251.36/',
    counterUrl: 'http://192.168.251.36/'
  },
  {
    id: 'fonte_1_recepcao_2_sala_vip',
    name: 'Fonte 1 Recepção 2 Sala VIP',
    ip: '192.168.254.31',
    module: './impressoras/fonte_1_recepcao_2_sala_vip',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.254.31/',
    counterUrl: 'http://192.168.254.31/'
  },
  {
    id: 'faturamento',
    name: 'Faturamento',
    ip: '192.168.250.10',
    module: './impressoras/faturamento',
    type: 'pdf',
    login: { username: 'administrator', password: '12345678' },
    checkUrl: 'http://192.168.250.10/',
    counterUrl: 'http://192.168.250.10/'
  }
];

module.exports = { printers };