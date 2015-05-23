var soap    = require('soap'),
    events  = require('events'),
    extend  = require('extend'),
    cheerio = require('cheerio'),
    request = require('request'),
    _       = require('underscore'),
    help    = require('./help'),
    util    = require('util');


// Correios class
var Correios = function () {
  'use strict';

  // If is not instance of Correios return a new instance
  if (false === (this instanceof Correios)) {
    return new Correios();
  }

  events.EventEmitter.call(this);

  // Default URl's
  this.calcPrecoUrl = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl';
  this.cepUrl = 'http://cep.correiocontrol.com.br/{CEP}.json';

  // Default args for price calculation
  this.calcArgs = {
    nCdEmpresa: '',
    sDsSenha: '',
    sCdMaoPropria: 'N',
    nVlValorDeclarado: 0,
    sCdAvisoRecebimento: 'N'
  };

  // Default args for CEP search
  this.cepArgs = {
    cepEntrada: '',
    metodo: 'buscarCep'
  };

  this.errorMessage = 'Erro no envio SOAP, verifique os campos enviados';
};

// Inherits from event emitter
util.inherits(Correios, events.EventEmitter);


// Calculate price
Correios.prototype.calcPreco = function (args, callback) {
  'use strict';

  var _this = this,
      arg   = extend({}, this.calcArgs, args);

  // create the SOAP client
  soap.createClient(this.calcPrecoUrl, function (err, client) {
    client.CalcPreco(arg, function (err, result) {
      if (!help.isNull(err)) {
        if (callback) {
          callback({ MsgErro: _this.errorMessage });

        } else {
          _this.emit('error', { MsgErro: _this.errorMessage });
        }

      } else {
        if (callback) {
          callback(result.CalcPrecoResult.Servicos.cServico);

        } else {
          _this.emit('result', result.CalcPrecoResult.Servicos.cServico);
        }
      }
    });
  });
};


// Calculate price and delivery time
Correios.prototype.calcPrecoPrazo = function (args, callback) {
  'use strict';

  var _this = this,
      arg   = extend({}, this.calcArgs, args);

  // create the SOAP client
  soap.createClient(this.calcPrecoUrl, function (err, client) {
    client.CalcPrecoPrazo(arg, function (err, result) {
      if (!help.isNull(err)) {
        if (callback) {
          callback({ MsgErro: _this.errorMessage });

        } else {
          _this.emit('error', { MsgErro: _this.errorMessage });
        }

      } else {
        if (callback) {
          callback(result.CalcPrecoPrazoResult.Servicos.cServico);

        } else {
          _this.emit('result', result.CalcPrecoPrazoResult.Servicos.cServico);
        }
      }
    });
  });
};


// Search for address using cep
Correios.prototype.consultaCEP = function (args, callback) {
  'use strict';

  var _this = this,
      arg   = extend({}, args);

  if ('cep' in arg === false) {
    throw new Error('You need to inform a CEP ex: { cep: 00000000 }');
  }

  // make request to the cep api
  var url = this.cepUrl.replace('{CEP}', arg.cep.replace('-', ''));

  request(url, function (err, resp, body) {
    try {
      if (callback) {
        callback(JSON.parse(body));

      } else {
        _this.emit('result', JSON.parse(body));
      }

    } catch (e) {
      if (callback) {
        callback({
          Erro: 404,
          MsgErro: 'Cep não encontrado'
        });

      } else {
        _this.emit('error', {
          Erro: 404,
          MsgErro: 'Cep não encontrado'
        });
      }
    }
  });
};

module.exports = Correios;

