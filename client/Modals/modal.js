exports.MaterializeModal = (function() {
  var DEBUG, MaterializeModal, cs, de, en, es, exports, fr, it, sk,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  DEBUG = false;

  function MaterializeModalClass() {
    this.complete = __bind(this.complete, this);
    this.closeModal = __bind(this.closeModal, this);
    this.templateOptions = new ReactiveVar();
    this.$modal = null;
  }

  MaterializeModalClass.prototype.defaults = {
    title: 'Message',
    message: '',
    type: 'message',
    closeLabel: null,
    submitLabel: 'ok',
    inputSelector: '#prompt-input',
    callback: null,
    complete: null,
    dismissible: true,
    outDuration: 200,
    opacity: 0.5,
    noAutoCloseOnSubmit: false
  };

  MaterializeModalClass.prototype.injectContainer = function() {
    if (this.modalContainer == null) {
      return this.modalContainer = Blaze.renderWithData(Template.materializeModalContainer, this.templateOptions, document.body);
    }
  };

  MaterializeModalClass.prototype.open = function(options) {
    if (DEBUG) {
      console.log("MaterializeModal.open()", this);
    }
    this.onComplete = null;
    this.injectContainer();
    return this.templateOptions.set(options);
  };

  MaterializeModalClass.prototype.close = function(submit, context, closeModal) {
    var cbSuccess, options;
    if (submit == null) {
      submit = false;
    }
    if (context == null) {
      context = null;
    }
    if (closeModal == null) {
      closeModal = true;
    }
    if (DEBUG) {
      console.log("MaterializeModal.close()");
    }
    options = this.templateOptions.get();
    if (options != null) {
      if (submit) {
        cbSuccess = this.doSubmitCallback(context);
        if (options.noAutoCloseOnSubmit) {
          closeModal = false;
        }
      } else {
        cbSuccess = this.doCancelCallback();
      }
      if (cbSuccess) {
        if (closeModal) {
          this.$modal.modal('close');
          return this.templateOptions.set(null);
        } else {
          return this.templateOptions.set(null);
        }
      }
    }
  };

  MaterializeModalClass.prototype.closeModal = function(_at_onComplete) {
    this.onComplete = _at_onComplete;
    this.$modal.modal('close');
    return this.templateOptions.set(null);
  };

  MaterializeModalClass.prototype.complete = function() {
    if (DEBUG) {
      console.log("MaterializeModal: complete", this.complete);
    }
    if (typeof this.onComplete === "function") {
      this.onComplete();
    }
    return this.onComplete = null;
  };

  MaterializeModalClass.prototype.display = function(options) {
    if (options == null) {
      options = {};
    }
    _.defaults(options, {
      message: null,
      title: null,
      submitLabel: null,
      closeLabel: t9nIt('cancel')
    }, this.defaults);
    return this.open(options);
  };

  MaterializeModalClass.prototype.message = function(options) {
    if (options == null) {
      options = {};
    }
    _.defaults(options, {
      message: t9nIt('You need to pass a message to materialize modal!'),
      title: t9nIt('Message'),
      submitLabel: t9nIt('ok')
    }, this.defaults);
    return this.open(options);
  };

  MaterializeModalClass.prototype.alert = function(options) {
    if (options == null) {
      options = {};
    }
    _.defaults(options, {
      type: 'alert',
      message: t9nIt('Alert'),
      title: t9nIt('Alert'),
      label: t9nIt("Alert"),
      bodyTemplate: "materializeModalAlert",
      submitLabel: t9nIt('ok')
    }, this.defaults);
    return this.open(options);
  };

  MaterializeModalClass.prototype.error = function(options) {
    if (options == null) {
      options = {};
    }
    _.defaults(options, {
      type: 'error',
      message: t9nIt('Error'),
      title: t9nIt('Error'),
      label: t9nIt("Error"),
      bodyTemplate: "materializeModalError",
      submitLabel: t9nIt('ok')
    }, this.defaults);
    return this.open(options);
  };

  MaterializeModalClass.prototype.confirm = function(options) {
    if (options == null) {
      options = {};
    }
    _.defaults(options, {
      type: 'confirm',
      message: t9nIt('Message'),
      title: t9nIt('Confirm'),
      closeLabel: t9nIt('cancel'),
      submitLabel: t9nIt('ok')
    }, this.defaults);
    return this.open(options);
  };

  MaterializeModalClass.prototype.prompt = function(options) {
    if (options == null) {
      options = {};
    }
    _.defaults(options, {
      type: 'prompt',
      message: t9nIt('Feedback?'),
      title: t9nIt('Prompt'),
      bodyTemplate: 'materializeModalPrompt',
      closeLabel: t9nIt('cancel'),
      submitLabel: t9nIt('submit'),
      placeholder: t9nIt("Type something here")
    }, this.defaults);
    return this.open(options);
  };

  MaterializeModalClass.prototype.loading = function(options) {
    if (options == null) {
      options = {};
    }
    _.defaults(options, {
      message: t9nIt('Loading'),
      title: null,
      bodyTemplate: 'materializeModalLoading',
      submitLabel: t9nIt('cancel')
    }, this.defaults);
    return this.open(options);
  };

  MaterializeModalClass.prototype.progress = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.progress == null) {
      return Materialize.toast(t9nIt("Error: No progress value specified!", 3000, "red"));
    } else {
      options.progress = parseInt(100 * options.progress).toString() + "%";
      _.defaults(options, {
        message: null,
        title: null,
        bodyTemplate: 'materializeModalProgress',
        submitLabel: t9nIt('close')
      }, this.defaults);
      return this.open(options);
    }
  };

  MaterializeModalClass.prototype.form = function(options) {
    if (options == null) {
      options = {};
    }
    if (DEBUG) {
      console.log("form options", options);
    }
    if (options.bodyTemplate == null) {
      return Materialize.toast(t9nIt("Error: No bodyTemplate specified!"), 3000, "red");
    } else {
      _.defaults(options, {
        type: 'form',
        title: t9nIt("Edit Record"),
        submitLabel: '<i class="material-icons left">save</i>' + t9nIt('save'),
        closeLabel: '<i class="material-icons left">&#xE033;</i>' + t9nIt('cancel')
      }, this.defaults);
      if (options.smallForm) {
        options.size = 'modal-sm';
        options.btnSize = 'btn-sm';
      }
      return this.open(options);
    }
  };

  MaterializeModalClass.prototype.addValueToObjFromDotString = function(obj, dotString, value) {
    var lastPart, part, path, tmp, _i, _len;
    path = dotString.split(".");
    tmp = obj;
    lastPart = path.pop();
    for (_i = 0, _len = path.length; _i < _len; _i++) {
      part = path[_i];
      if (tmp[part] == null) {
        tmp[part] = {};
      }
      tmp = tmp[part];
    }
    if (lastPart != null) {
      return tmp[lastPart] = value;
    }
  };

  MaterializeModalClass.prototype.fromForm = function(form) {
    var check, key, result, _i, _j, _len, _len1, _ref, _ref1;
    if (DEBUG) {
      console.log("fromForm", form, form != null ? form.serializeArray() : void 0);
    }
    result = {};
    _ref = form != null ? form.serializeArray() : void 0;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      this.addValueToObjFromDotString(result, key.name, key.value);
    }
    _ref1 = form != null ? form.find("input:checkbox") : void 0;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      check = _ref1[_j];
      if ($(check).prop('name')) {
        result[$(check).prop('name')] = $(check).prop('checked');
      }
    }
    if (DEBUG) {
      console.log("fromForm result", result);
    }
    return result;
  };

  MaterializeModalClass.prototype.doCancelCallback = function() {
    var error, options, response;
    options = this.templateOptions.get();
    if ((options != null ? options.callback : void 0) == null) {
      return true;
    }
    try {
      if (DEBUG) {
        console.log("materializeModal: doCancelCallback");
      }
      response = {
        submit: false
      };
      options.callback(null, response);
    } catch (_error) {
      error = _error;
      options.callback(error, null);
    }
    return true;
  };

  MaterializeModalClass.prototype.doSubmitCallback = function(context) {
    var error, options, response;
    options = this.templateOptions.get();
    if ((options != null ? options.callback : void 0) == null) {
      return true;
    }
    try {
      response = {
        submit: true
      };
      switch (options.type) {
        case 'prompt':
          response.value = $(options.inputSelector).val();
          break;
        case 'form':
          if (context.form != null) {
            response.form = this.fromForm(context.form);
            response.value = response.form;
          }
      }
      try {
        options.callback(null, response);
      } catch (_error) {
        error = _error;
        console.error("MaterializeModal Callback returned Error", error, response);
        Materialize.toast(error.reason, 3000, 'toast-error');
        return false;
      }
    } catch (_error) {
      error = _error;
      options.callback(error, null);
    }
    return true;
  };


  /* Loading, Status, Progress code etc.
  
    status: (message, callback, title = 'Status', cancelText = 'Cancel') ->
      @_setData message, title, "materializeModalstatus",
        message: message
      @callback = callback
      @set("submitLabel", cancelText)
      @_show()
  
  
    updateProgressMessage: (message) ->
      if DEBUG
        console.log("updateProgressMessage", $("#progressMessage").html(), message)
      if $("#progressMessage").html()?
        $("#progressMessage").fadeOut 400, ->
          $("#progressMessage").html(message)
          $("#progressMessage").fadeIn(400)
      else
        @set("message", message)
   */

  this.t9nIt = function(string) {
    return (typeof T9n !== "undefined" && T9n !== null ? typeof T9n.get === "function" ? T9n.get(string) : void 0 : void 0) || string;
  };

  Template.registerHelper('mmT9nit', function(string) {
    return t9nIt(string);
  });

  MaterializeModal = new MaterializeModalClass();


  /*
   *     Template.materializeModalContainer
   */

  Template.materializeModalContainer.helpers({
    modalOptions: function() {
      return Template.currentData().get();
    }
  });


  /*
   *     Template.materializeModal
   */

  Template.materializeModal.onCreated(function() {
    if (DEBUG) {
      console.log("Template.materializeModal.onCreated", this.data);
    }
    if (typeof Materialize === "undefined" || Materialize === null) {
      throw new Error("MaterializeModal requires Materializecss !!!");
    }
    if (Materialize.openModal != null) {
      throw new Error("MaterializeModal 1.1+ requires Materializecss v0.97.8 or greater!  Use 1.0 for earlier versions of Materializecss");
    }
  });

  Template.materializeModal.onRendered(function() {
    var inDuration;
    if (DEBUG) {
      console.log("Template.materializeModal.onRendered", this.data.title);
    }
    MaterializeModal.$modal = this.$('#materializeModal');
    if (this.data.fullscreen) {
      inDuration = 0;
    } else {
      300;
    }
    inDuration = this.data.inDuration || 300;
    MaterializeModal.$modal.modal({
      dismissible: this.data.dismissible,
      opacity: this.data.opacity,
      in_duration: inDuration,
      out_duration: this.data.outDuration || 200,
      ready: (function(_this) {
        return function(modal, trigger) {
          var _base;
          if (DEBUG) {
            console.log("materializeModal: ready");
          }
          return typeof (_base = _this.data).ready === "function" ? _base.ready() : void 0;
        };
      })(this),
      complete: function() {
        if (DEBUG) {
          console.log("materializeModal: modal complete");
        }
        MaterializeModal.close(false, null, false);
        return MaterializeModal.complete();
      }
    });
    return MaterializeModal.$modal.modal('open');
  });

  Template.materializeModal.onDestroyed(function() {
    if (DEBUG) {
      return console.log("Template.materializeModal.onDestroyed");
    }
  });

  Template.materializeModal.helpers({
    bodyTemplate: function() {
      return this.bodyTemplate || null;
    },
    icon: function() {
      if (this.icon) {
        return this.icon;
      } else {
        if (DEBUG) {
          console.log("icon: type", this.type);
        }
        switch (this.type) {
          case 'alert':
            return 'warning';
          case 'error':
            return 'error';
        }
      }
    },
    modalFooter: function() {
      return this.footerTemplate || 'materializeModalFooter';
    },
    modalFooterData: function() {
      return _.extend({}, this, this.footerTemplateData);
    }
  });

  Template.materializeModal.events({
    "click #closeButton": function(e, tmpl) {
      e.preventDefault();
      if (DEBUG) {
        console.log('closeButton');
      }
      return MaterializeModal.close(false);
    },
    "submit form#materializeModalForm, click button#submitButton": function(e, tmpl) {
      var form, _ref;
      e.preventDefault();
      form = tmpl.$('form#materializeModalForm');
      if (((_ref = form.find('form')) != null ? _ref.length : void 0) > 0) {
        form = form.find('form');
      }
      if (DEBUG) {
        console.log('submit event:', e, "form:", form);
      }
      MaterializeModal.close(true, {
        event: e,
        form: form
      });
      return false;
    }
  });

  Template.materializeModalForm.helpers({
    isForm: function() {
      var _ref;
      return (_ref = this.type) === 'form' || _ref === 'prompt';
    }
  });

  Template.materializeModalStatus.helpers({
    progressMessage: function() {}
  });

  if (DEBUG) {
    console.log("Modal T9n", T9n);
  }

  en = {
    'Close': 'Close',
    'close': 'close',
    'OK': 'OK',
    'ok': 'ok',
    'Ok': 'Ok',
    'You need to pass a message to materialize modal!': 'You need to pass a message to materialize modal!',
    'Message': 'Message',
    'Alert': 'Alert',
    'Error': 'Error',
    'Confirm': 'Confirm',
    'cancel': 'cancel',
    'save': 'save',
    'Feedback?': 'Feedback?',
    'Prompt': 'Prompt',
    'submit': 'submit',
    "Type something here": "Type something here",
    'Loading': 'Loading',
    "Error: No template specified!": "Error: No template specified!",
    "Edit Record": "Edit Record"
  };

  if (typeof T9n !== "undefined" && T9n !== null) {
    if (typeof T9n.map === "function") {
      T9n.map("en", en);
    }
  }

  it = {
    "Loading": "Caricamento",
    "submit": "presentare",
    "Alert": "Allarme",
    "Prompt": "Pronto",
    "Type something here": "Digita qualcosa qui",
    "OK": "OK",
    'ok': 'ok',
    "Message": "Messaggio",
    "Error": "Errore",
    "Edit Record": "Modifica record",
    "cancel": "cancellare",
    "Error: No template specified!": "Error: No modello specificato!",
    "Confirm": "Confermare",
    "Feedback?": "Risposte?",
    "You need to pass a message to materialize modal!": "È necessario passare un messaggio a materializzarsi modale!",
    "Close": "Vicino",
    "save": "salvare"
  };

  if (typeof T9n !== "undefined" && T9n !== null) {
    if (typeof T9n.map === "function") {
      T9n.map("it", it);
    }
  }

  sk = {
    "OK": "OK",
    'ok': 'ok',
    "Error": "Chyba",
    "Confirm": "Potvrdiť",
    "Alert": "Poplach",
    "Message": "Správa",
    "cancel": "zrušiť",
    "submit": "predložiť",
    "Close": "Zavrieť",
    "Feedback?": "Spätná väzba?",
    "Edit Record": "Upraviť záznam",
    "Type something here": "Typ niečo tu",
    "Error: No template specified!": "Chyba: žiadna šablóna uvedené!",
    "Prompt": "Okamžitý",
    "You need to pass a message to materialize modal!": "Musíte odovzdať správu zhmotniť modálne!",
    "Loading": "Nakladanie",
    "save": "ušetriť"
  };

  if (typeof T9n !== "undefined" && T9n !== null) {
    if (typeof T9n.map === "function") {
      T9n.map("sk", sk);
    }
  }

  cs = {
    "Feedback?": "Zpětná vazba?",
    "submit": "předložit",
    "cancel": "zrušit",
    "Confirm": "Potvrdit",
    "Prompt": "Okamžitý",
    "Type something here": "Typ něco zde",
    "Alert": "Poplach",
    "Edit Record": "Upravit záznam",
    "Loading": "Nakládání",
    "Error": "Chyba",
    "Message": "Zpráva",
    "OK": "OK",
    'ok': 'ok',
    "Error: No template specified!": "Chyba: žádná šablona uvedeno!",
    "Close": "Zavřít",
    "You need to pass a message to materialize modal!": "Musíte předat zprávu zhmotnit modální!",
    "save": "ušetřit"
  };

  if (typeof T9n !== "undefined" && T9n !== null) {
    if (typeof T9n.map === "function") {
      T9n.map("cs", cs);
    }
  }

  fr = {
    "Close": "Fermer",
    "Message": "Message",
    "OK": "OK",
    'ok': 'ok',
    "Loading": "Chargement",
    "submit": "soumettre",
    "Type something here": "Tapez quelque chose ici",
    "cancel": "annuler",
    "Edit Record": "Modifier l'enregistrement",
    "Error": "Erreur",
    "Confirm": "Confirmer",
    "Feedback?": "Commentaires?",
    "Error: No template specified!": "Erreur: Aucun modèle spécifié!",
    "You need to pass a message to materialize modal!": "Vous devez fournir un message à materialize modal!",
    "Alert": "Avertissement",
    "Prompt": "Demande",
    "save": "enregistrer"
  };

  if (typeof T9n !== "undefined" && T9n !== null) {
    if (typeof T9n.map === "function") {
      T9n.map("fr", fr);
    }
  }

  de = {
    "Close": "In der Nähe",
    "Loading": "Laden",
    "Alert": "Alarm",
    "OK": "OK",
    'ok': 'ok',
    "submit": "einreichen",
    "Feedback?": "Feedback?",
    "Error": "Fehler",
    "cancel": "stornieren",
    "Error: No template specified!": "Fehler: nicht Vorlage angegeben!",
    "Edit Record": "Datensatz bearbeiten",
    "Type something here": "Geben Sie hier etwas",
    "Confirm": "Bestätigen",
    "Message": "Nachricht",
    "You need to pass a message to materialize modal!": "Sie müssen eine Nachricht übergeben zu materialisieren modalen!",
    "Prompt": "Prompt",
    "save": "sparen"
  };

  if (typeof T9n !== "undefined" && T9n !== null) {
    if (typeof T9n.map === "function") {
      T9n.map("de", de);
    }
  }

  es = {
    "Close": "Cerca",
    "OK": "OK",
    'ok': 'ok',
    "Error": "Error",
    "Feedback?": "Comentarios?",
    "submit": "presentar",
    "Prompt": "Rápido",
    "Type something here": "Escriba algo aquí",
    "Edit Record": "Editar registro",
    "Error: No template specified!": "Error: No plantilla especificada!",
    "Alert": "Alerta",
    "Message": "Mensaje",
    "cancel": "cancelar",
    "You need to pass a message to materialize modal!": "Tiene que pasar un mensaje a materializarse modal!",
    "Confirm": "Confirmar",
    "Loading": "Cargando",
    "save": "guardar"
  };

  if (typeof T9n !== "undefined" && T9n !== null) {
    if (typeof T9n.map === "function") {
      T9n.map('es', 'es');
    }
  }

  return MaterializeModal;
})();
